import { readdir, stat } from 'fs/promises';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';
import { MarkerPlugin, PluginContext, validatePlugin } from './plugin-api.js';
import { createLogger } from './index.js';

export class PluginManager {
  constructor(config) {
    this.config = config;
    this.plugins = new Map();
    this.logger = createLogger(config.verbose);
    this.context = new PluginContext(config, this.logger);
    this.enabled = config.plugins?.enabled !== false;
  }

  /**
   * Load all plugins from configured directories
   */
  async loadPlugins() {
    if (!this.enabled) {
      this.logger.log('Plugins disabled in config');
      return;
    }

    const pluginConfig = this.config.plugins || {};
    const pluginDir = pluginConfig.directory || 'plugins';
    const autoLoad = pluginConfig.autoLoad || [];

    try {
      // Load plugins from directory
      const pluginPath = resolve(process.cwd(), pluginDir);
      const entries = await readdir(pluginPath).catch(() => []);

      for (const entry of entries) {
        const fullPath = join(pluginPath, entry);
        const stats = await stat(fullPath).catch(() => null);

        if (stats && stats.isFile() && entry.endsWith('.js')) {
          // Check if plugin should be auto-loaded
          if (autoLoad.includes(entry) || autoLoad.includes('*')) {
            await this.loadPlugin(fullPath);
          }
        }
      }

      this.logger.log(`Loaded ${this.plugins.size} plugins`);
    } catch (error) {
      this.logger.warn(`Failed to load plugins: ${error.message}`);
    }
  }

  /**
   * Load a single plugin from file
   */
  async loadPlugin(pluginPath) {
    try {
      const fileUrl = pathToFileURL(resolve(pluginPath));
      const module = await import(fileUrl.href);
      
      // Support both default and named export
      const PluginClass = module.default || module.Plugin || module.MarkerPlugin;
      
      if (!PluginClass) {
        throw new Error('No plugin class exported');
      }

      // Create plugin instance
      const plugin = new PluginClass();
      
      // Validate plugin
      validatePlugin(plugin);

      // Initialize plugin
      await plugin.init(this.context);

      // Register plugin
      this.plugins.set(plugin.name, plugin);
      this.logger.log(`Loaded plugin: ${plugin.name} v${plugin.version}`);

      return plugin;
    } catch (error) {
      this.logger.error(`Failed to load plugin ${pluginPath}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute plugin hook
   */
  async executeHook(hookName, ...args) {
    const results = [];

    for (const [name, plugin] of this.plugins) {
      if (typeof plugin[hookName] === 'function') {
        try {
          const result = await plugin[hookName](...args, this.context);
          results.push({ plugin: name, result });
        } catch (error) {
          this.logger.error(`Plugin ${name} failed at ${hookName}: ${error.message}`);
        }
      }
    }

    return results;
  }

  /**
   * Execute hook that modifies data
   */
  async executeModifierHook(hookName, data, ...args) {
    let modifiedData = data;

    for (const [name, plugin] of this.plugins) {
      if (typeof plugin[hookName] === 'function') {
        try {
          const result = await plugin[hookName](modifiedData, ...args, this.context);
          if (result !== undefined) {
            modifiedData = result;
          }
        } catch (error) {
          this.logger.error(`Plugin ${name} failed at ${hookName}: ${error.message}`);
        }
      }
    }

    return modifiedData;
  }

  /**
   * Unload all plugins
   */
  async cleanup() {
    for (const [name, plugin] of this.plugins) {
      try {
        await plugin.cleanup(this.context);
        this.logger.log(`Cleaned up plugin: ${name}`);
      } catch (error) {
        this.logger.error(`Failed to cleanup plugin ${name}: ${error.message}`);
      }
    }
    this.plugins.clear();
  }

  /**
   * Get loaded plugins info
   */
  getPluginsInfo() {
    return Array.from(this.plugins.values()).map(plugin => ({
      name: plugin.name,
      version: plugin.version,
      description: plugin.description
    }));
  }
}

// Singleton instance
let pluginManager = null;

/**
 * Get or create plugin manager instance
 */
export function getPluginManager(config) {
  if (!pluginManager) {
    pluginManager = new PluginManager(config);
  }
  return pluginManager;
}

/**
 * Reset plugin manager (for testing)
 */
export function resetPluginManager() {
  if (pluginManager) {
    pluginManager.cleanup();
    pluginManager = null;
  }
} 
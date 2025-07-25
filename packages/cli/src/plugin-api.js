/**
 * Marker Validator Plugin API
 * 
 * Plugins can hook into various stages of the marker processing pipeline
 */

export class PluginContext {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
    this.metadata = new Map();
  }

  // Store plugin-specific metadata
  setMetadata(key, value) {
    this.metadata.set(key, value);
  }

  getMetadata(key) {
    return this.metadata.get(key);
  }

  // Log methods
  log(message) {
    this.logger.log(`[Plugin] ${message}`);
  }

  warn(message) {
    this.logger.warn(`[Plugin] ${message}`);
  }

  error(message) {
    this.logger.error(`[Plugin] ${message}`);
  }
}

export class MarkerPlugin {
  constructor() {
    this.name = 'unnamed-plugin';
    this.version = '1.0.0';
    this.description = '';
  }

  /**
   * Called when plugin is loaded
   * @param {PluginContext} context 
   */
  async init(context) {
    // Override in plugin
  }

  /**
   * Called before validation starts
   * @param {Object} marker - The marker object
   * @param {PluginContext} context 
   * @returns {Object} Modified marker or original
   */
  async beforeValidation(marker, context) {
    return marker;
  }

  /**
   * Called after validation completes
   * @param {Object} marker - The marker object
   * @param {Object} validationResult - Validation result
   * @param {PluginContext} context 
   */
  async afterValidation(marker, validationResult, context) {
    // Override in plugin
  }

  /**
   * Called before repair starts
   * @param {Object} marker - The marker object
   * @param {PluginContext} context 
   * @returns {Object} Modified marker or original
   */
  async beforeRepair(marker, context) {
    return marker;
  }

  /**
   * Called after repair completes
   * @param {Object} marker - The original marker
   * @param {Object} repairedMarker - The repaired marker
   * @param {Array} fixes - Applied fixes
   * @param {PluginContext} context 
   */
  async afterRepair(marker, repairedMarker, fixes, context) {
    // Override in plugin
  }

  /**
   * Called before conversion starts
   * @param {Object} marker - The marker object
   * @param {String} targetFormat - Target format (yaml/json)
   * @param {PluginContext} context 
   * @returns {Object} Modified marker or original
   */
  async beforeConversion(marker, targetFormat, context) {
    return marker;
  }

  /**
   * Called after conversion completes
   * @param {Object} marker - The marker object
   * @param {String} output - Converted output string
   * @param {String} format - Output format (yaml/json)
   * @param {PluginContext} context 
   * @returns {String} Modified output or original
   */
  async afterConversion(marker, output, format, context) {
    return output;
  }

  /**
   * Called after batch processing completes
   * @param {Array} results - Array of processing results
   * @param {PluginContext} context 
   */
  async afterBatch(results, context) {
    // Override in plugin
  }

  /**
   * Called when plugin is about to be unloaded
   * @param {PluginContext} context 
   */
  async cleanup(context) {
    // Override in plugin
  }
}

// Plugin validation
export function validatePlugin(plugin) {
  if (!plugin.name || typeof plugin.name !== 'string') {
    throw new Error('Plugin must have a name property');
  }

  if (!plugin.version || typeof plugin.version !== 'string') {
    throw new Error('Plugin must have a version property');
  }

  const methods = [
    'init', 'beforeValidation', 'afterValidation',
    'beforeRepair', 'afterRepair', 'beforeConversion',
    'afterConversion', 'afterBatch', 'cleanup'
  ];

  for (const method of methods) {
    if (plugin[method] && typeof plugin[method] !== 'function') {
      throw new Error(`Plugin method ${method} must be a function`);
    }
  }

  return true;
} 
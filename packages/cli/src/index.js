/**
 * Marker Validator CLI - Main Module
 * Exports core functionality for the CLI tool
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load default configuration
export function loadConfig(configPath) {
  try {
    const defaultPath = resolve(__dirname, '../../../config/marker-tool.default.json');
    const config = configPath 
      ? JSON.parse(readFileSync(resolve(configPath), 'utf8'))
      : JSON.parse(readFileSync(defaultPath, 'utf8'));
      
    // Ensure all config sections exist
    config.schemas = config.schemas || {};
    config.outputDirs = config.outputDirs || {};
    config.processing = config.processing || {};
    config.repair = config.repair || {};
    config.validation = config.validation || {};
    config.export = config.export || {
      prettyPrint: true,
      yamlIndent: 2,
      jsonIndent: 2,
      sortKeys: false
    };
    config.plugins = config.plugins || {
      enabled: true,
      directory: '../plugins',
      autoLoad: []
    };
    
    return config;
  } catch (error) {
    console.error(chalk.red(`Failed to load config: ${error.message}`));
    process.exit(1);
  }
}

// Utility function to determine file type
export function getFileType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  if (ext === 'yaml' || ext === 'yml') return 'yaml';
  if (ext === 'json') return 'json';
  return 'unknown';
}

// Create logger
export function createLogger(verbose = false) {
  return {
    log: (message) => {
      if (verbose) console.log(chalk.gray(`[LOG] ${message}`));
    },
    info: (message) => console.log(chalk.blue(`ℹ ${message}`)),
    success: (message) => console.log(chalk.green(`✓ ${message}`)),
    warn: (message) => console.log(chalk.yellow(`⚠ ${message}`)),
    error: (message) => console.error(chalk.red(`✗ ${message}`))
  };
}

// Export all modules
export * from './converter.js';
export * from './validator.js';
export * from './repair.js';
export * from './plugin-api.js';
export * from './plugin-loader.js'; 
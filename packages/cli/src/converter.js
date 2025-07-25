/**
 * Marker Converter Module
 * Handles YAML <-> JSON conversion
 */

import yaml from 'js-yaml';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname, basename, extname } from 'path';
import { getFileType, createLogger } from './index.js';
import { getPluginManager } from './plugin-loader.js';

/**
 * Read and parse a marker file
 * @param {string} filepath - Path to the file
 * @returns {Object} Parsed content and metadata
 */
export async function readMarkerFile(filepath) {
  const fileType = getFileType(filepath);
  const content = readFileSync(filepath, 'utf8');
  
  let data;
  
  switch (fileType) {
    case 'yaml':
      try {
        data = yaml.load(content, {
          schema: yaml.JSON_SCHEMA,
          json: true // For better JSON compatibility
        });
      } catch (error) {
        throw new Error(`Failed to parse YAML: ${error.message}`);
      }
      break;
      
    case 'json':
      try {
        data = JSON.parse(content);
      } catch (error) {
        throw new Error(`Failed to parse JSON: ${error.message}`);
      }
      break;
      
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
  
  return {
    data,
    originalFormat: fileType,
    filepath,
    filename: basename(filepath)
  };
}

/**
 * Convert marker data to specified format
 * @param {Object} marker - Marker data
 * @param {string} format - Target format ('yaml' or 'json')
 * @param {Object} options - Conversion options
 * @returns {string} Formatted content
 */
export function formatMarker(data, format, options = {}) {
  const config = options.config?.export || {};
  
  try {
    if (format === 'yaml') {
      return yaml.dump(data, {
        noRefs: true,
        indent: config.yamlIndent || 2,
        sortKeys: config.sortKeys || false,
        lineWidth: -1 // Disable line wrapping
      });
    } else if (format === 'json') {
      return JSON.stringify(
        data, 
        null, 
        config.prettyPrint !== false ? (config.jsonIndent || 2) : 0
      );
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }
  } catch (error) {
    throw new Error(`Failed to format as ${format}: ${error.message}`);
  }
}

/**
 * Write marker data to file
 * @param {string} filepath - Output path
 * @param {string} content - Content to write
 * @param {string} format - Output format
 */
export function writeMarkerFile(filepath, content, format) {
  // Ensure directory exists
  const dir = dirname(filepath);
  mkdirSync(dir, { recursive: true });
  
  // Write file
  writeFileSync(filepath, content, 'utf8');
}

/**
 * Convert a single file
 * @param {string} filepath - Input file path
 * @param {Object} options - Conversion options
 * @returns {Object} Conversion result
 */
export async function convertFile(filepath, options = {}) {
  const logger = createLogger(options.verbose);
  const pluginManager = getPluginManager(options.config || {});
  
  try {
    // Read and parse the file
    const { data, originalFormat, filename } = await readMarkerFile(filepath);
    
    // Use repaired marker if available
    let markerData = options.repairedMarkers?.get(filepath) || data;
    
    // Execute beforeConversion plugins for both formats
    markerData = await pluginManager.executeModifierHook('beforeConversion', markerData, 'dual');
    
    // Determine output paths
    const baseName = filename.replace(/\.(yaml|yml|json)$/i, '');
    const outputDir = options.output || 'out';
    const yamlDir = resolve(outputDir, 'yaml');
    const jsonDir = resolve(outputDir, 'json');
    
    // Create output directories
    mkdirSync(yamlDir, { recursive: true });
    mkdirSync(jsonDir, { recursive: true });
    
    // Create backup if enabled
    if (options.backup !== false) {
      const backupDir = resolve(outputDir, 'backup');
      mkdirSync(backupDir, { recursive: true });
      const backupPath = resolve(backupDir, `${filename}.backup`);
      writeFileSync(backupPath, readFileSync(filepath));
      logger.log(`Created backup: ${backupPath}`);
    }
    
    // Convert to both formats
    let yamlOutput = formatMarker(markerData, 'yaml', options);
    let jsonOutput = formatMarker(markerData, 'json', options);
    
    // Execute afterConversion plugins
    yamlOutput = await pluginManager.executeModifierHook('afterConversion', markerData, yamlOutput, 'yaml');
    jsonOutput = await pluginManager.executeModifierHook('afterConversion', markerData, jsonOutput, 'json');
    
    // Write both outputs
    const yamlPath = resolve(yamlDir, `${baseName}.yaml`);
    const jsonPath = resolve(jsonDir, `${baseName}.json`);
    
    writeMarkerFile(yamlPath, yamlOutput, 'yaml');
    writeMarkerFile(jsonPath, jsonOutput, 'json');
    
    const outputs = [
      { path: yamlPath, format: 'yaml' },
      { path: jsonPath, format: 'json' }
    ];
    
    logger.success(`Converted ${filename} to both formats`);
    
    return {
      success: true,
      input: filepath,
      outputs,
      data: markerData,
      originalFormat
    };
  } catch (error) {
    logger.error(`Failed to convert ${filepath}: ${error.message}`);
    return {
      success: false,
      input: filepath,
      error: error.message
    };
  }
}

/**
 * Convert multiple files in batch
 * @param {string[]} files - Array of file paths
 * @param {Object} options - Conversion options
 * @returns {Object} Batch results
 */
export async function convertBatch(files, options = {}) {
  const logger = createLogger(options.verbose);
  const pluginManager = getPluginManager(options.config || {});
  const results = [];
  
  // Load plugins
  await pluginManager.loadPlugins();
  
  logger.info(`Converting ${files.length} files...`);
  
  for (const file of files) {
    const result = await convertFile(file, options);
    results.push(result);
    
    if (result.success) {
      logger.success(`✓ ${basename(file)}`);
    } else {
      logger.error(`✗ ${basename(file)}: ${result.error}`);
    }
  }
  
  // Execute afterBatch plugins
  await pluginManager.executeHook('afterBatch', results);
  
  // Cleanup plugins
  await pluginManager.cleanup();
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  logger.info(`\nConversion complete: ${successful} succeeded, ${failed} failed`);
  
  return results;
} 
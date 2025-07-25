/**
 * Marker Validator Module
 * Handles schema validation using AJV
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createLogger } from './index.js';
import { getPluginManager } from './plugin-loader.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Cache for loaded schemas
const schemaCache = new Map();

/**
 * Create and configure AJV instance
 * @param {Object} options - Validation options
 * @returns {Object} Configured AJV instance
 */
function createValidator(options = {}) {
  const ajv = new Ajv({
    allErrors: true,
    verbose: true,
    strict: options.strictMode ?? false,
    allowUnionTypes: true,
    validateFormats: true
  });
  
  // Add format validators (for date-time, etc.)
  addFormats(ajv);
  
  return ajv;
}

/**
 * Load a JSON schema from file
 * @param {string} schemaPath - Path to schema file
 * @returns {Object} Parsed schema
 */
export async function loadSchema(schemaPath) {
  // Check cache first
  if (schemaCache.has(schemaPath)) {
    return schemaCache.get(schemaPath);
  }
  
  const resolvedPath = resolve(schemaPath);
  
  if (!existsSync(resolvedPath)) {
    throw new Error(`Schema file not found: ${schemaPath}`);
  }
  
  try {
    const schemaContent = readFileSync(resolvedPath, 'utf8');
    const schema = JSON.parse(schemaContent);
    
    // Cache the loaded schema
    schemaCache.set(schemaPath, schema);
    
    return schema;
  } catch (error) {
    throw new Error(`Failed to load schema: ${error.message}`);
  }
}

/**
 * Get schema path from config
 * @param {string} schemaType - Schema type ('default' or 'fraud')
 * @param {Object} config - Configuration object
 * @returns {string} Schema path
 */
function getSchemaPath(schemaType, config) {
  const schemas = config?.schemas || {};
  const schemaPath = schemas[schemaType];
  
  if (!schemaPath) {
    throw new Error(`Unknown schema type: ${schemaType}`);
  }
  
  // Resolve relative to config directory (which is in the project root)
  const configDir = resolve(__dirname, '../../../config');
  return resolve(configDir, schemaPath);
}

/**
 * Validate a marker against schema
 * @param {Object} marker - Marker data to validate
 * @param {string} schemaType - Schema type to use
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export async function validateMarker(marker, schemaType = 'default', options = {}) {
  const logger = createLogger(options.verbose);
  const pluginManager = getPluginManager(options.config || {});
  
  try {
    // Execute beforeValidation plugins
    const modifiedMarker = await pluginManager.executeModifierHook('beforeValidation', marker);
    
    const schemaPath = getSchemaPath(schemaType, options.config);
    const schema = await loadSchema(schemaPath);
    
    const ajv = createValidator(options);
    
    // Always preload the base schema for reference resolution
    if (schemaType === 'fraud') {
      const baseSchemaPath = getSchemaPath('default', options.config);
      const baseSchema = await loadSchema(baseSchemaPath);
      ajv.addSchema(baseSchema, baseSchema.$id);
    }
    
    const valid = ajv.validate(schema, modifiedMarker);
    
    // Check ID prefix matches level
    let prefixValid = true;
    let expectedPrefix = '';
    
    if (valid && modifiedMarker.id && modifiedMarker.level) {
      const prefixMap = {
        1: 'A_',
        2: 'S_',
        3: 'C_',
        4: 'MM_'
      };
      
      expectedPrefix = prefixMap[modifiedMarker.level];
      prefixValid = modifiedMarker.id.startsWith(expectedPrefix);
      
      if (!prefixValid && !ajv.errors) {
        ajv.errors = [];
      }
      
      if (!prefixValid) {
        ajv.errors.push({
          instancePath: '/id',
          schemaPath: '#/properties/id/pattern',
          keyword: 'pattern',
          params: { pattern: `^${expectedPrefix}` },
          message: `ID should start with '${expectedPrefix}' for level ${modifiedMarker.level}`
        });
      }
    }
    
    const result = {
      valid: valid && prefixValid,
      errors: ajv.errors || [],
      schema: schemaType
    };
    
    // Execute afterValidation plugins
    await pluginManager.executeHook('afterValidation', modifiedMarker, result);
    
    return result;
  } catch (error) {
    logger.error(`Validation error: ${error.message}`);
    throw error;
  }
}

/**
 * Validate multiple markers in batch
 * @param {Object[]} markers - Array of markers to validate
 * @param {string} schemaType - Schema type to use
 * @param {Object} options - Validation options
 * @returns {Object} Batch validation results
 */
export async function validateBatch(markers, schemaType = 'default', options = {}) {
  const logger = createLogger(options.verbose);
  const results = [];
  
  logger.info(`Validating ${markers.length} markers against '${schemaType}' schema...`);
  
  for (const marker of markers) {
    const result = await validateMarker(marker, schemaType, options);
    results.push(result);
    
    if (options.verbose) {
      if (result.valid) {
        logger.success(`  ✓ ${result.markerId}`);
      } else {
        logger.error(`  ✗ ${result.markerId}: ${result.errors.length} error(s)`);
      }
    }
  }
  
  // Summary
  const valid = results.filter(r => r.valid).length;
  const invalid = results.filter(r => !r.valid).length;
  const warnings = results.filter(r => r.warnings?.length > 0).length;
  
  return {
    results,
    summary: {
      total: markers.length,
      valid,
      invalid,
      warnings
    }
  };
}

/**
 * Format validation errors for display
 * @param {Object} result - Validation result
 * @returns {string[]} Formatted error messages
 */
export function formatValidationErrors(result) {
  if (result.valid) {
    return [];
  }
  
  const messages = [];
  
  for (const error of result.errors) {
    const field = error.field === '/' ? 'root' : error.field;
    messages.push(`  • ${field}: ${error.message}`);
  }
  
  if (result.warnings) {
    for (const warning of result.warnings) {
      messages.push(`  ⚠ ${warning.field}: ${warning.message}`);
      if (warning.suggestion) {
        messages.push(`    → Suggestion: ${warning.suggestion}`);
      }
    }
  }
  
  return messages;
} 
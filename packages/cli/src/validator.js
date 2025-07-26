/**
 * Marker Validator Module
 * Handles schema validation using AJV
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import { createLogger } from './index.js';
import { getPluginManager } from './plugin-loader.js';
import { FileTypeDetector } from './file-type-detector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LEVEL_PREFIX_MAP = {
  1: 'A_',
  2: 'S_',
  3: 'C_',
  4: 'MM_'
};

let ajvInstance = null;

function createValidator(options = {}) {
  if (!ajvInstance) {
    ajvInstance = new Ajv({
      allErrors: true,
      verbose: options.verbose || false,
      strict: options.strictMode || false,
      allowUnionTypes: true
    });
    addFormats(ajvInstance);
  }
  return ajvInstance;
}

async function loadSchema(schemaPath) {
  try {
    const fullPath = resolve(__dirname, '../../../', schemaPath);
    if (!existsSync(fullPath)) {
      throw new Error(`Schema file not found: ${fullPath}`);
    }
    const schemaContent = readFileSync(fullPath, 'utf8');
    return JSON.parse(schemaContent);
  } catch (error) {
    throw new Error(`Failed to load schema from ${schemaPath}: ${error.message}`);
  }
}

function getSchemaPath(schemaType, config) {
  const schemas = config?.schemas || {};
  return schemas[schemaType] || schemas.default || 'schemas/marker.schema.v2.1.json';
}

export async function validateMarker(marker, schemaType = 'default', options = {}) {
  const logger = createLogger(options.verbose);
  const pluginManager = getPluginManager(options.config || {});
  try {
    const modifiedMarker = await pluginManager.executeModifierHook('beforeValidation', marker);

    const schemaPath = getSchemaPath(schemaType, options.config);
    const schema = await loadSchema(schemaPath);
    const ajv = createValidator(options);

    // Add base schema to AJV instance for cross-schema validation
    if (schemaType === 'fraud') {
      const baseSchemaPath = getSchemaPath('default', options.config);
      const baseSchema = await loadSchema(baseSchemaPath);
      ajv.addSchema(baseSchema, baseSchema.$id);
    }

    const valid = ajv.validate(schema, modifiedMarker);

    // Check ID prefix matches level (logic updated for clarity)
    let prefixValid = true;
    if (valid && modifiedMarker.id && modifiedMarker.level) {
      const expectedPrefix = {
        1: 'A_',
        2: 'S_',
        3: 'C_',
        4: 'MM_'
      }[modifiedMarker.level];
      
      if (expectedPrefix && !modifiedMarker.id.startsWith(expectedPrefix)) {
        prefixValid = false;
        ajv.errors = ajv.errors || [];
        ajv.errors.push({
          keyword: 'prefix',
          dataPath: '.id',
          schemaPath: '#/properties/id',
          params: { expectedPrefix, actualPrefix: modifiedMarker.id.split('_')[0] + '_' },
          message: `ID prefix should be '${expectedPrefix}' for level ${modifiedMarker.level}`
        });
      }
    }

    const result = {
      valid: valid && prefixValid,
      errors: ajv.errors || [],
      schema: schemaType
    };

    await pluginManager.executeHook('afterValidation', modifiedMarker, result);

    return result;
  } catch (error) {
    logger.error(`Validation error: ${error.message}`);
    return {
      valid: false,
      errors: [{ message: error.message }],
      schema: schemaType
    };
  }
}

export async function validateFile(filepath, options = {}) {
  const logger = createLogger(options.verbose);
  const pluginManager = getPluginManager(options.config || {});
  
  try {
    // Detect file type
    const detector = new FileTypeDetector(options.config || {});
    const fileType = detector.detectFileType(filepath);
    
    logger.log(`Detected file type: ${fileType.type} (confidence: ${fileType.confidence})`);
    
    // Validate file location
    const locationValidation = detector.validateFileLocation(filepath, fileType);
    if (!locationValidation.valid) {
      logger.warn(`File location warning: ${locationValidation.message}`);
    }
    
    // Get appropriate schema
    const schemaPath = detector.getSchemaPath(fileType);
    const schema = await loadSchema(schemaPath);
    
    // Create a fresh AJV instance for each file to avoid schema conflicts
    const ajv = new Ajv({
      allErrors: true,
      verbose: options.verbose || false,
      strict: options.strictMode || false,
      allowUnionTypes: true
    });
    addFormats(ajv);
    
    // Read and parse file
    const { data } = await import('./converter.js').then(m => m.readMarkerFile(filepath));
    
    // Execute beforeValidation plugins
    const modifiedData = await pluginManager.executeModifierHook('beforeValidation', data);
    
    // Validate against schema
    const valid = ajv.validate(schema, modifiedData);
    
    // Additional validations based on file type
    const additionalErrors = await validateFileTypeSpecific(data, fileType, filepath, options);
    
    const result = {
      valid: valid && additionalErrors.length === 0,
      errors: [...(ajv.errors || []), ...additionalErrors],
      schema: fileType.schema,
      fileType: fileType.type,
      locationValid: locationValidation.valid,
      locationMessage: locationValidation.message
    };
    
    // Execute afterValidation plugins
    await pluginManager.executeHook('afterValidation', modifiedData, result);
    
    return result;
  } catch (error) {
    logger.error(`File validation error: ${error.message}`);
    return {
      valid: false,
      errors: [{ message: error.message }],
      fileType: 'unknown'
    };
  }
}

async function validateFileTypeSpecific(data, fileType, filepath, options) {
  const errors = [];
  
  // Reference validation
  if (options.config?.validation?.checkReferences !== false) {
    const referenceErrors = await validateReferences(data, fileType, options);
    errors.push(...referenceErrors);
  }
  
  // File structure validation
  if (options.config?.validation?.validateFileStructure !== false) {
    const structureErrors = validateFileStructure(data, fileType);
    errors.push(...structureErrors);
  }

  // Filename prefix validation for marker files
  if (fileType.type === 'markers' && filepath) {
    const base = basename(filepath, extname(filepath));
    const idPrefixMatch = data.id ? data.id.match(/^(A|S|C|MM)_/) : null;

    // Filename should start with the marker prefix
    const expectedPrefix = idPrefixMatch ? idPrefixMatch[0] : LEVEL_PREFIX_MAP[data.level];
    if (expectedPrefix && !base.startsWith(expectedPrefix)) {
      errors.push({
        keyword: 'filenamePrefix',
        dataPath: '',
        message: `Filename should start with '${expectedPrefix}'`
      });
    }

    // Also report missing prefix in ID
    if (data.id && !idPrefixMatch && expectedPrefix) {
      errors.push({
        keyword: 'prefix',
        dataPath: '.id',
        message: `ID prefix should be '${expectedPrefix}'`
      });
    }
  }
  
  return errors;
}

async function validateReferences(data, fileType, options) {
  const errors = [];
  
  // Check for circular references
  if (data.id) {
    const circularErrors = checkCircularReferences(data, fileType);
    errors.push(...circularErrors);
  }
  
  // Check for invalid references
  if (fileType.type === 'markers') {
    const referenceErrors = await checkMarkerReferences(data, options);
    errors.push(...referenceErrors);
  }
  
  if (fileType.type === 'detects') {
    const referenceErrors = await checkDetectReferences(data, options);
    errors.push(...referenceErrors);
  }
  
  if (fileType.type === 'chunk-analysis') {
    const referenceErrors = await checkChunkAnalysisReferences(data, options);
    errors.push(...referenceErrors);
  }
  
  return errors;
}

function checkCircularReferences(data, fileType) {
  const errors = [];
  
  // Check if ID references itself
  if (data.id && data.composed_of) {
    for (const item of data.composed_of) {
      if (item.marker_ids && item.marker_ids.includes(data.id)) {
        errors.push({
          keyword: 'circular',
          dataPath: '.composed_of',
          message: `Circular reference detected: ${data.id} references itself`
        });
      }
    }
  }
  
  return errors;
}

async function checkMarkerReferences(data, options) {
  const errors = [];
  
  // Check composed_of references
  if (data.composed_of) {
    for (const item of data.composed_of) {
      if (item.marker_ids) {
        for (const markerId of item.marker_ids) {
          // This would require checking if the referenced marker exists
          // For now, just validate the format
          if (!markerId.match(/^(A|S|C|MM)_[A-Z0-9_]+$/)) {
            errors.push({
              keyword: 'reference',
              dataPath: '.composed_of',
              message: `Invalid marker reference format: ${markerId}`
            });
          }
        }
      }
    }
  }
  
  return errors;
}

async function checkDetectReferences(data, options) {
  const errors = [];
  
  // Check fire_marker reference
  if (data.fire_marker && !data.fire_marker.match(/^(A|S|C|MM)_[A-Z0-9_]+$/)) {
    errors.push({
      keyword: 'reference',
      dataPath: '.fire_marker',
      message: `Invalid marker reference format: ${data.fire_marker}`
    });
  }
  
  return errors;
}

async function checkChunkAnalysisReferences(data, options) {
  const errors = [];
  
  // Check detectors_active references
  if (data.detectors_active) {
    for (const detectId of data.detectors_active) {
      if (!detectId.match(/^DETECT_[A-Z0-9_]+$/)) {
        errors.push({
          keyword: 'reference',
          dataPath: '.detectors_active',
          message: `Invalid detect reference format: ${detectId}`
        });
      }
    }
  }
  
  return errors;
}

function validateFileStructure(data, fileType) {
  const errors = [];
  
  // Check for required fields based on file type
  switch (fileType.type) {
    case 'markers':
      if (!data.description || data.description.length < 10) {
        errors.push({
          keyword: 'minLength',
          dataPath: '.description',
          message: 'Description must be at least 10 characters long'
        });
      }
      if (!data.examples || data.examples.length < 2) {
        errors.push({
          keyword: 'minItems',
          dataPath: '.examples',
          message: 'At least 2 examples are required'
        });
      }
      break;
      
    case 'schemas':
      if (data.id?.startsWith('SCH_') && (!data.weights || Object.keys(data.weights).length === 0)) {
        errors.push({
          keyword: 'required',
          dataPath: '.weights',
          message: 'Schema must have weights configuration'
        });
      }
      break;
      
    case 'detects':
      if (!data.rule || !data.rule.type) {
        errors.push({
          keyword: 'required',
          dataPath: '.rule.type',
          message: 'Detect must have a rule type'
        });
      }
      break;
      
    case 'chunk-analysis':
      if (!data.detectors_active || data.detectors_active.length === 0) {
        errors.push({
          keyword: 'minItems',
          dataPath: '.detectors_active',
          message: 'At least one detector must be active'
        });
      }
      break;
  }
  
  return errors;
}

export async function validateBatch(files, options = {}) {
  const logger = createLogger(options.verbose);
  const results = [];
  
  for (const file of files) {
    try {
      const result = await validateFile(file, options);
      results.push({
        file,
        ...result
      });
    } catch (error) {
      logger.error(`Failed to validate ${file}: ${error.message}`);
      results.push({
        file,
        valid: false,
        errors: [{ message: error.message }],
        fileType: 'unknown'
      });
    }
  }
  
  return results;
}

export function formatValidationErrors(errors, options = {}) {
  if (!errors || errors.length === 0) {
    return 'No validation errors';
  }
  
  const formatted = errors.map((error, index) => {
    const path = error.dataPath || error.schemaPath || 'unknown';
    const message = error.message || 'Unknown error';
    const keyword = error.keyword || 'validation';
    
    return `${index + 1}. ${keyword} at ${path}: ${message}`;
  });
  
  return formatted.join('\n');
} 
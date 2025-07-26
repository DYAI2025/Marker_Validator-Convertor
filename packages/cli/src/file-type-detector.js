import { readFileSync } from 'fs';
import { basename, dirname, extname } from 'path';
import yaml from 'js-yaml';

export class FileTypeDetector {
  constructor(config) {
    this.config = config;
    this.fileTypes = config.fileTypes || {};
  }

  /**
   * Detect file type based on filename, content, and folder structure
   */
  detectFileType(filepath) {
    const filename = basename(filepath);
    const extension = extname(filename).toLowerCase();
    const directory = dirname(filepath);
    
    // Try to detect by filename prefix first
    const prefixMatch = this.detectByPrefix(filename);
    if (prefixMatch) {
      return prefixMatch;
    }
    
    // Try to detect by folder structure
    const folderMatch = this.detectByFolder(directory);
    if (folderMatch) {
      return folderMatch;
    }
    
    // Try to detect by content analysis
    const contentMatch = this.detectByContent(filepath, extension);
    if (contentMatch) {
      return contentMatch;
    }
    
    // Default to marker if no specific type found
    return {
      type: 'markers',
      schema: 'marker',
      confidence: 'low'
    };
  }

  /**
   * Detect file type by filename prefix
   */
  detectByPrefix(filename) {
    for (const [type, config] of Object.entries(this.fileTypes)) {
      for (const prefix of config.prefixes || []) {
        if (filename.startsWith(prefix)) {
          return {
            type,
            schema: config.schema,
            confidence: 'high',
            prefix
          };
        }
      }
    }
    return null;
  }

  /**
   * Detect file type by folder structure
   */
  detectByFolder(directory) {
    const normalizedDir = directory.replace(/\\/g, '/');
    
    for (const [type, config] of Object.entries(this.fileTypes)) {
      for (const folder of config.folders || []) {
        if (normalizedDir.includes(folder)) {
          return {
            type,
            schema: config.schema,
            confidence: 'medium',
            folder
          };
        }
      }
    }
    return null;
  }

  /**
   * Detect file type by content analysis
   */
  detectByContent(filepath, extension) {
    try {
      const content = readFileSync(filepath, 'utf8');
      
      // For YAML/JSON files, try to parse and analyze structure
      if (extension === '.yaml' || extension === '.yml' || extension === '.json') {
        const data = extension === '.json' ? JSON.parse(content) : yaml.load(content);
        
        // Check for specific fields that indicate file type
        if (data.id) {
          return this.detectByPrefix(data.id);
        }
        
        // Check for specific field combinations
        if (data.weights && data.window) {
          return {
            type: 'schemas',
            schema: 'schema',
            confidence: 'medium'
          };
        }
        
        if (data.rule && data.fire_marker) {
          return {
            type: 'detects',
            schema: 'detect',
            confidence: 'medium'
          };
        }
        
        if (data.detectors_active && data.high_level_snapshot) {
          return {
            type: 'chunk-analysis',
            schema: 'chunk-analysis',
            confidence: 'medium'
          };
        }
        
        if (data.target_markers && data.aggregation) {
          return {
            type: 'scores',
            schema: 'score',
            confidence: 'medium'
          };
        }
      }
      
      // For Python files, check for class definitions
      if (extension === '.py') {
        if (content.includes('class') && content.includes('def update')) {
          return {
            type: 'profilers',
            schema: 'profiler',
            confidence: 'medium'
          };
        }
        
        if (content.includes('def run(') || content.includes('export function run')) {
          return {
            type: 'grabbers',
            schema: 'grabber',
            confidence: 'medium'
          };
        }
      }
      
      // For JavaScript files, check for export patterns
      if (extension === '.js') {
        if (content.includes('export') && (content.includes('function run') || content.includes('const run'))) {
          return {
            type: 'grabbers',
            schema: 'grabber',
            confidence: 'medium'
          };
        }
      }
      
    } catch (error) {
      // If we can't read or parse the file, return null
      return null;
    }
    
    return null;
  }

  /**
   * Get schema path for a detected file type
   */
  getSchemaPath(fileType) {
    const typeConfig = this.fileTypes[fileType.type];
    if (!typeConfig) {
      return this.config.schemas.default;
    }
    
    const schemaName = typeConfig.schema;
    return this.config.schemas[schemaName] || this.config.schemas.default;
  }

  /**
   * Validate that file type matches expected folder structure
   */
  validateFileLocation(filepath, detectedType) {
    const directory = dirname(filepath);
    const normalizedDir = directory.replace(/\\/g, '/');
    const typeConfig = this.fileTypes[detectedType.type];
    
    if (!typeConfig || !typeConfig.folders) {
      return { valid: true, message: 'No folder restrictions' };
    }
    
    for (const folder of typeConfig.folders) {
      if (normalizedDir.includes(folder)) {
        return { valid: true, message: `File in correct folder: ${folder}` };
      }
    }
    
    return {
      valid: false,
      message: `File should be in one of: ${typeConfig.folders.join(', ')}`,
      expectedFolders: typeConfig.folders
    };
  }

  /**
   * Get all supported file types
   */
  getSupportedFileTypes() {
    return Object.keys(this.fileTypes);
  }

  /**
   * Get file type configuration
   */
  getFileTypeConfig(type) {
    return this.fileTypes[type] || null;
  }
} 
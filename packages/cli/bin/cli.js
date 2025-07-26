#!/usr/bin/env node

/**
 * Marker Validator CLI
 * Entry point for the command line interface
 */

import { program } from 'commander';
import chalk from 'chalk';
import { readFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import {
  loadConfig,
  convertBatch,
  validateMarker,
  formatValidationErrors,
  readMarkerFile,
  writeMarkerFile,
  repairMarker,
  repairBatch,
  formatMarker,
  validateFile,
  validateBatch,
  repairFile,
  createLogger
} from '../src/index.js';
import { FileTypeDetector } from '../src/file-type-detector.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf8'));

// Configure the CLI
program
  .name('marker-validator')
  .description('Marker Validator & Converter Tool - Validates and converts YAML/JSON markers')
  .version('1.0.0')
  .option('-c, --config <path>', 'path to config file')
  .option('-v, --verbose', 'verbose output', false)
  .option('--no-color', 'disable colored output')
  .helpOption('-h, --help', 'display help for command');

// convert command (updated in Iteration 2, enhanced in Iteration 3)
program
  .command('convert <files...>')
  .description('Convert and validate marker files')
  .option('-o, --output <dir>', 'output directory', 'out')
  .option('-s, --schema <type>', 'schema to use (default|fraud)', 'default')
  .option('--dry-run', 'show what would be done without doing it')
  .option('--no-repair', 'disable auto-repair')
  .option('--no-backup', 'disable backup creation')
  .action(async (files, options) => {
    try {
      const config = loadConfig(options.config);
      const logger = createLogger(options.verbose);
      
      // Expand glob patterns
      const expandedFiles = [];
      for (const pattern of files) {
        const matches = await glob(pattern, { absolute: true });
        expandedFiles.push(...matches);
      }
      
      if (expandedFiles.length === 0) {
        logger.warn('No files found matching the patterns');
        return;
      }
      
      logger.info(`Converting ${expandedFiles.length} files...`);
      
      const results = await convertBatch(expandedFiles, {
        ...options,
        config,
        verbose: options.verbose
      });
      
      // Print results
      let successCount = 0;
      let errorCount = 0;
      
      for (const result of results) {
        if (result.success) {
          logger.success(`✓ ${result.input} → ${result.outputs.join(', ')}`);
          successCount++;
        } else {
          logger.error(`✗ ${result.input}: ${result.error}`);
          errorCount++;
        }
      }
      
      logger.info(`\nConversion complete: ${successCount} successful, ${errorCount} failed`);
      
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// validate command (updated in Iteration 2, enhanced in Iteration 3)
program
  .command('validate <files...>')
  .description('Validate marker files without conversion')
  .option('-s, --schema <type>', 'schema to use (default|fraud)', 'default')
  .option('--strict', 'enable strict validation mode')
  .option('--repair', 'attempt to repair before validation')
  .option('-c, --config <path>', 'path to config file')
  .option('-v, --verbose', 'verbose output')
  .action(async (files, options) => {
    try {
      const config = loadConfig(options.config);
      const logger = createLogger(options.verbose);
      
      // Expand glob patterns
      const expandedFiles = [];
      for (const pattern of files) {
        const matches = await glob(pattern, { absolute: true });
        expandedFiles.push(...matches);
      }
      
      if (expandedFiles.length === 0) {
        logger.warn('No files found matching the patterns');
        return;
      }
      
      logger.info(`Validating ${expandedFiles.length} files...`);
      
      const results = await validateBatch(expandedFiles, {
        ...options,
        config,
        verbose: options.verbose
      });
      
      // Print results
      let validCount = 0;
      let invalidCount = 0;
      
      for (const result of results) {
        if (result.valid) {
          logger.success(`✓ ${result.file} (${result.fileType})`);
          validCount++;
        } else {
          logger.error(`✗ ${result.file} (${result.fileType})`);
          if (result.errors && result.errors.length > 0) {
            console.log(formatValidationErrors(result.errors, options));
          }
          invalidCount++;
        }
        
        if (result.locationValid === false) {
          logger.warn(`  Location warning: ${result.locationMessage}`);
        }
      }
      
      logger.info(`\nValidation complete: ${validCount} valid, ${invalidCount} invalid`);
      
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// repair command (Added in Iteration 3, updated in Iteration 7)
program
  .command('repair <files...>')
  .description('Repair marker files by applying auto-fixes')
  .option('-o, --output <dir>', 'output directory', 'out/repaired')
  .option('--dry-run', 'show what would be fixed without doing it')
  .option('--no-backup', 'disable backup creation')
  .option('-c, --config <path>', 'path to config file') // Added in Iteration 6
  .option('-v, --verbose', 'verbose output')
  .action(async (files, options) => {
    try {
      const config = loadConfig(options.config);
      const logger = createLogger(options.verbose);
      
      // Expand glob patterns
      const expandedFiles = [];
      for (const pattern of files) {
        const matches = await glob(pattern, { absolute: true });
        expandedFiles.push(...matches);
      }
      
      if (expandedFiles.length === 0) {
        logger.warn('No files found matching the patterns');
        return;
      }
      
      logger.info(`Repairing ${expandedFiles.length} files...`);
      
      const detector = new FileTypeDetector(config);
      let repairedCount = 0;
      let unchangedCount = 0;
      let errorCount = 0;
      
      for (const filepath of expandedFiles) {
        try {
          const { data, originalFormat, filename } = await readMarkerFile(filepath);
          const fileType = detector.detectFileType(filepath);
          
          logger.log(`Processing ${filename} (${fileType.type})...`);
          
          const result = await repairFile(data, fileType.type, {
            ...options,
            config,
            verbose: options.verbose
          });
          
          if (result.modified) {
            logger.success(`✓ ${filename}: ${result.fixes.length} fixes applied`);
            if (options.verbose) {
              result.fixes.forEach(fix => logger.log(`  - ${fix}`));
            }
            
            if (!options.dryRun) {
              const outputDir = options.output;
              await mkdirSync(outputDir, { recursive: true });
              const outputPath = resolve(outputDir, filename);
              await writeMarkerFile(outputPath, formatMarker(result.marker, originalFormat, { config }), originalFormat);
            }
            
            repairedCount++;
          } else {
            logger.info(`- ${filename}: No fixes needed`);
            unchangedCount++;
          }
          
        } catch (error) {
          logger.error(`✗ ${filepath}: ${error.message}`);
          errorCount++;
        }
      }
      
      logger.info(`\nRepair complete: ${repairedCount} repaired, ${unchangedCount} unchanged, ${errorCount} errors`);
      
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// NEW: validate-all command for all file types
program
  .command('validate-all')
  .description('Validate all files in the project according to their detected types')
  .option('-c, --config <path>', 'path to config file')
  .option('-v, --verbose', 'verbose output')
  .option('--strict', 'enable strict validation mode')
  .action(async (options) => {
    try {
      const config = loadConfig(options.config);
      const logger = createLogger(options.verbose);
      
      logger.info('Scanning project for all supported file types...');
      
      // Find all files in project directories
      const allFiles = [];
      const fileTypes = config.fileTypes || {};
      
      for (const [type, typeConfig] of Object.entries(fileTypes)) {
        for (const folder of typeConfig.folders || []) {
          const patterns = typeConfig.extensions.map(ext => `${folder}/**/*${ext}`);
          for (const pattern of patterns) {
            const matches = await glob(pattern, { absolute: true });
            allFiles.push(...matches);
          }
        }
      }
      
      if (allFiles.length === 0) {
        logger.warn('No files found in project directories');
        return;
      }
      
      logger.info(`Found ${allFiles.length} files to validate...`);
      
      const results = await validateBatch(allFiles, {
        ...options,
        config,
        verbose: options.verbose
      });
      
      // Group results by file type
      const groupedResults = {};
      for (const result of results) {
        const type = result.fileType || 'unknown';
        if (!groupedResults[type]) {
          groupedResults[type] = { valid: [], invalid: [] };
        }
        if (result.valid) {
          groupedResults[type].valid.push(result);
        } else {
          groupedResults[type].invalid.push(result);
        }
      }
      
      // Print summary by file type
      let totalValid = 0;
      let totalInvalid = 0;
      
      for (const [type, typeResults] of Object.entries(groupedResults)) {
        const validCount = typeResults.valid.length;
        const invalidCount = typeResults.invalid.length;
        totalValid += validCount;
        totalInvalid += invalidCount;
        
        logger.info(`\n${type.toUpperCase()}:`);
        logger.success(`  ✓ ${validCount} valid`);
        if (invalidCount > 0) {
          logger.error(`  ✗ ${invalidCount} invalid`);
          for (const result of typeResults.invalid) {
            logger.error(`    - ${result.file}`);
            if (result.errors && result.errors.length > 0) {
              console.log(formatValidationErrors(result.errors, options));
            }
          }
        }
      }
      
      logger.info(`\nOverall: ${totalValid} valid, ${totalInvalid} invalid`);
      
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// NEW: repair-all command for all file types
program
  .command('repair-all')
  .description('Repair all files in the project by applying auto-fixes')
  .option('-c, --config <path>', 'path to config file')
  .option('-v, --verbose', 'verbose output')
  .option('--dry-run', 'show what would be fixed without doing it')
  .action(async (options) => {
    try {
      const config = loadConfig(options.config);
      const logger = createLogger(options.verbose);
      
      logger.info('Scanning project for all supported file types...');
      
      // Find all files in project directories
      const allFiles = [];
      const fileTypes = config.fileTypes || {};
      
      for (const [type, typeConfig] of Object.entries(fileTypes)) {
        for (const folder of typeConfig.folders || []) {
          const patterns = typeConfig.extensions.map(ext => `${folder}/**/*${ext}`);
          for (const pattern of patterns) {
            const matches = await glob(pattern, { absolute: true });
            allFiles.push(...matches);
          }
        }
      }
      
      if (allFiles.length === 0) {
        logger.warn('No files found in project directories');
        return;
      }
      
      logger.info(`Found ${allFiles.length} files to repair...`);
      
      const detector = new FileTypeDetector(config);
      let repairedCount = 0;
      let unchangedCount = 0;
      let errorCount = 0;
      
      for (const filepath of allFiles) {
        try {
          const { data, originalFormat, filename } = await readMarkerFile(filepath);
          const fileType = detector.detectFileType(filepath);
          
          logger.log(`Processing ${filename} (${fileType.type})...`);
          
          const result = await repairFile(data, fileType.type, {
            ...options,
            config,
            verbose: options.verbose
          });
          
          if (result.modified) {
            logger.success(`✓ ${filename}: ${result.fixes.length} fixes applied`);
            result.fixes.forEach(fix => logger.log(`  - ${fix}`));
            
            if (!options.dryRun) {
              // Write back to original location
              await writeMarkerFile(filepath, formatMarker(result.marker, originalFormat, { config }), originalFormat);
            }
            
            repairedCount++;
          } else {
            logger.info(`- ${filename}: No fixes needed`);
            unchangedCount++;
          }
          
        } catch (error) {
          logger.error(`✗ ${filepath}: ${error.message}`);
          errorCount++;
        }
      }
      
      logger.info(`\nRepair complete: ${repairedCount} repaired, ${unchangedCount} unchanged, ${errorCount} errors`);
      
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// NEW: detect command to show file type detection
program
  .command('detect <files...>')
  .description('Detect file types without validation')
  .option('-c, --config <path>', 'path to config file')
  .option('-v, --verbose', 'verbose output')
  .action(async (files, options) => {
    try {
      const config = loadConfig(options.config);
      const logger = createLogger(options.verbose);
      
      // Expand glob patterns
      const expandedFiles = [];
      for (const pattern of files) {
        const matches = await glob(pattern, { absolute: true });
        expandedFiles.push(...matches);
      }
      
      if (expandedFiles.length === 0) {
        logger.warn('No files found matching the patterns');
        return;
      }
      
      const detector = new FileTypeDetector(config);
      
      for (const filepath of expandedFiles) {
        const fileType = detector.detectFileType(filepath);
        const locationValidation = detector.validateFileLocation(filepath, fileType);
        
        console.log(`\n${filepath}:`);
        console.log(`  Type: ${fileType.type}`);
        console.log(`  Schema: ${fileType.schema}`);
        console.log(`  Confidence: ${fileType.confidence}`);
        if (fileType.prefix) {
          console.log(`  Prefix: ${fileType.prefix}`);
        }
        if (fileType.folder) {
          console.log(`  Folder: ${fileType.folder}`);
        }
        console.log(`  Location: ${locationValidation.valid ? '✓' : '✗'} ${locationValidation.message}`);
      }
      
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// info command (updated in Iteration 2)
program
  .command('info')
  .description('Show configuration and environment info')
  .action(() => {
    try {
      const config = loadConfig();
      console.log(chalk.blue('Configuration:'));
      console.log(JSON.stringify(config, null, 2));
      
      const detector = new FileTypeDetector(config);
      console.log(chalk.blue('\nSupported file types:'));
      for (const type of detector.getSupportedFileTypes()) {
        const typeConfig = detector.getFileTypeConfig(type);
        console.log(`  ${type}:`);
        console.log(`    Prefixes: ${typeConfig.prefixes.join(', ')}`);
        console.log(`    Extensions: ${typeConfig.extensions.join(', ')}`);
        console.log(`    Folders: ${typeConfig.folders.join(', ')}`);
        console.log(`    Schema: ${typeConfig.schema}`);
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program.parse(); 
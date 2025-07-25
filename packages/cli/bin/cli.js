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
  formatMarker
} from '../src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf8'));

// Configure the CLI
program
  .name('marker-convert')
  .description('CLI tool for validating and converting YAML/JSON markers')
  .version(packageJson.version)
  .option('-c, --config <path>', 'path to config file', '../../config/marker-tool.default.json')
  .option('-v, --verbose', 'verbose output', false)
  .option('--no-color', 'disable colored output')
  .helpOption('-h, --help', 'display help for command');

// Convert command
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
      // Load configuration
      const config = loadConfig(program.opts().config);
      
      // Expand globs
      const expandedFiles = [];
      for (const pattern of files) {
        const matches = await glob(pattern);
        expandedFiles.push(...matches);
      }
      
      if (expandedFiles.length === 0) {
        console.error(chalk.red('❌ No files found matching the pattern(s)'));
        process.exit(1);
      }
      
      console.log(chalk.blue(`🔄 Processing ${expandedFiles.length} file(s)...`));
      
      // If repair is enabled, repair markers before conversion
      let repairedMarkers = null;
      if (options.repair && config.processing?.autoRepair !== false) {
        console.log(chalk.blue('\n🔧 Repairing markers...'));
        
        const markersToRepair = [];
        for (const file of expandedFiles) {
          try {
            const { data } = await readMarkerFile(file);
            markersToRepair.push({ file, data });
          } catch (err) {
            console.error(chalk.red(`❌ Failed to read ${file}: ${err.message}`));
          }
        }
        
        const repairResults = await repairBatch(
          markersToRepair.map(m => m.data),
          { config, verbose: program.opts().verbose }
        );
        
        // Map repaired markers back to files
        repairedMarkers = new Map();
        repairResults.results.forEach((result, index) => {
          if (result.modified) {
            repairedMarkers.set(markersToRepair[index].file, result.marker);
          }
        });
      }
      
      // Prepare options
      const convertOptions = {
        outputDir: options.output,
        dryRun: options.dryRun,
        createBackup: options.backup,
        verbose: program.opts().verbose,
        config,
        repairedMarkers,
        ...config.export
      };
      
      // Convert files
      const { summary } = await convertBatch(expandedFiles, convertOptions);
      
      // If validation is requested, validate the converted files
      if (options.schema && !options.dryRun) {
        console.log(chalk.blue('\n📋 Validating converted files...'));
        
        for (const file of expandedFiles) {
          try {
            const { data } = await readMarkerFile(file);
            // Use repaired marker if available
            const markerToValidate = repairedMarkers?.get(file) || data;
            
            const result = await validateMarker(markerToValidate, options.schema, {
              config,
              verbose: program.opts().verbose
            });
            
            if (!result.valid) {
              console.log(chalk.yellow(`\n⚠️  Validation issues in ${file}:`));
              const errors = formatValidationErrors(result);
              errors.forEach(err => console.log(chalk.yellow(err)));
            }
          } catch (err) {
            console.error(chalk.red(`❌ Failed to validate ${file}: ${err.message}`));
          }
        }
      }
      
      if (summary.failed > 0) {
        process.exit(1);
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
      if (program.opts().verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// Repair command
program
  .command('repair <files...>')
  .description('Repair marker files by applying auto-fixes')
  .option('-o, --output <dir>', 'output directory', 'out/repaired')
  .option('--dry-run', 'show what would be fixed without doing it')
  .option('--no-backup', 'disable backup creation')
  .action(async (files, options) => {
    try {
      // Load configuration
      const config = loadConfig(program.opts().config);
      
      // Expand globs
      const expandedFiles = [];
      for (const pattern of files) {
        const matches = await glob(pattern);
        expandedFiles.push(...matches);
      }
      
      if (expandedFiles.length === 0) {
        console.error(chalk.red('❌ No files found matching the pattern(s)'));
        process.exit(1);
      }
      
      console.log(chalk.blue(`🔧 Repairing ${expandedFiles.length} file(s)...`));
      
      let totalFixed = 0;
      let totalUnchanged = 0;
      
      for (const file of expandedFiles) {
        try {
          const { data, filename, originalFormat } = await readMarkerFile(file);
          
          const result = await repairMarker(data, {
            config,
            verbose: program.opts().verbose
          });
          
          if (result.modified) {
            console.log(chalk.green(`✓ ${filename} - ${result.fixes.length} fixes applied`));
            
            if (program.opts().verbose) {
              result.fixes.forEach(fix => {
                console.log(chalk.gray(`  - ${fix.message}`));
              });
            }
            
            // Write repaired file if not dry-run
            if (!options.dryRun) {
              const outputDir = options.output;
              await mkdirSync(outputDir, { recursive: true });
              const outputPath = resolve(outputDir, filename);
              
              await writeMarkerFile(outputPath, formatMarker(result.marker, originalFormat, { config }), originalFormat);
            }
            
            totalFixed++;
          } else {
            console.log(chalk.gray(`- ${filename} - no fixes needed`));
            totalUnchanged++;
          }
          
        } catch (error) {
          console.error(chalk.red(`✗ ${file}: ${error.message}`));
        }
      }
      
      // Summary
      console.log(chalk.cyan('\n📊 Repair Summary:'));
      console.log(chalk.green(`  ✓ Fixed: ${totalFixed}`));
      console.log(chalk.gray(`  - Unchanged: ${totalUnchanged}`));
      
      if (options.dryRun) {
        console.log(chalk.yellow('\n⚠️  This was a dry run. No files were modified.'));
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
      if (program.opts().verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// Validate command
program
  .command('validate <files...>')
  .description('Validate marker files without conversion')
  .option('-s, --schema <type>', 'schema to use (default|fraud)', 'default')
  .option('--strict', 'enable strict validation mode')
  .option('--repair', 'attempt to repair before validation')
  .action(async (files, options) => {
    try {
      // Load configuration
      const config = loadConfig(program.opts().config);
      
      // Expand globs
      const expandedFiles = [];
      for (const pattern of files) {
        const matches = await glob(pattern);
        expandedFiles.push(...matches);
      }
      
      if (expandedFiles.length === 0) {
        console.error(chalk.red('❌ No files found matching the pattern(s)'));
        process.exit(1);
      }
      
      console.log(chalk.blue(`✓ Validating ${expandedFiles.length} file(s)...`));
      
      let totalValid = 0;
      let totalInvalid = 0;
      let totalRepaired = 0;
      
      for (const file of expandedFiles) {
        try {
          let { data, filename } = await readMarkerFile(file);
          
          // Optionally repair before validation
          if (options.repair) {
            const repairResult = await repairMarker(data, {
              config,
              verbose: false
            });
            
            if (repairResult.modified) {
              data = repairResult.marker;
              totalRepaired++;
              if (program.opts().verbose) {
                console.log(chalk.yellow(`  🔧 Applied ${repairResult.fixes.length} fixes`));
              }
            }
          }
          
          const result = await validateMarker(data, options.schema, {
            config,
            strictMode: options.strict,
            verbose: program.opts().verbose
          });
          
          if (result.valid) {
            console.log(chalk.green(`✓ ${filename}`));
            totalValid++;
          } else {
            console.log(chalk.red(`✗ ${filename}`));
            const errors = formatValidationErrors(result);
            errors.forEach(err => console.log(chalk.red(err)));
            totalInvalid++;
          }
          
          if (result.warnings?.length > 0 && program.opts().verbose) {
            result.warnings.forEach(warn => {
              console.log(chalk.yellow(`  ⚠ ${warn.field}: ${warn.message}`));
            });
          }
          
        } catch (error) {
          console.error(chalk.red(`✗ ${file}: ${error.message}`));
          totalInvalid++;
        }
      }
      
      // Summary
      console.log(chalk.cyan('\n📊 Validation Summary:'));
      console.log(chalk.green(`  ✓ Valid: ${totalValid}`));
      console.log(chalk.red(`  ✗ Invalid: ${totalInvalid}`));
      if (options.repair && totalRepaired > 0) {
        console.log(chalk.yellow(`  🔧 Repaired: ${totalRepaired}`));
      }
      
      if (totalInvalid > 0) {
        process.exit(1);
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
      if (program.opts().verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// Info command
program
  .command('info')
  .description('Show configuration and environment info')
  .action(() => {
    try {
      const config = loadConfig(program.opts().config);
      
      console.log(chalk.cyan('\n📋 Marker Validator CLI Info\n'));
      console.log(`Version: ${packageJson.version}`);
      console.log(`Node: ${process.version}`);
      console.log(`Platform: ${process.platform}`);
      console.log(`Config: ${program.opts().config}`);
      console.log('\nConfiguration:');
      console.log(JSON.stringify(config, null, 2));
      console.log();
    } catch (error) {
      console.error(chalk.red('Failed to load config:'), error.message);
    }
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
} 
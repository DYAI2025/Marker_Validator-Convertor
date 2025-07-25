/**
 * Marker Repair Module
 * Handles auto-repair and migration logic
 */

import slugify from 'slugify';
import { createLogger } from './index.js';
import { getPluginManager } from './plugin-loader.js';

// Common field name typos to fix
const COMMON_FIELD_FIXES = {
  'beschreibg': 'description',
  'beschreibung': 'description',
  'descr': 'description',
  'desc': 'description',
  'autor': 'author',
  'erstellt': 'created',
  'geaendert': 'last_modified',
  'modified': 'last_modified',
  'updated': 'last_modified',
  'kategorie': 'category',
  'beispiele': 'examples',
  'muster': 'pattern',
  'patterns': 'pattern',
  'risk': 'risk_score',
  'risiko': 'risk_score'
};

// Level to prefix mapping
const LEVEL_PREFIX_MAP = {
  1: 'A',
  2: 'S',
  3: 'C',
  4: 'MM'
};

/**
 * Normalize a date value to ISO format
 * @param {*} value - Date value to normalize
 * @returns {string|null} ISO date string or null
 */
function normalizeDate(value) {
  if (!value) return null;
  
  try {
    // Try parsing as ISO date first
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  } catch (e) {
    // Ignore parse errors
  }
  
  // Try common date formats
  const datePatterns = [
    /^(\d{4})-(\d{2})-(\d{2})$/,  // YYYY-MM-DD
    /^(\d{2})\.(\d{2})\.(\d{4})$/, // DD.MM.YYYY
    /^(\d{2})\/(\d{2})\/(\d{4})$/, // MM/DD/YYYY
  ];
  
  for (const pattern of datePatterns) {
    const match = String(value).match(pattern);
    if (match) {
      let year, month, day;
      
      if (pattern.source.includes('\\.')) {
        // German format DD.MM.YYYY
        [, day, month, year] = match;
      } else if (pattern.source.includes('\\/')) {
        // US format MM/DD/YYYY
        [, month, day, year] = match;
      } else {
        // ISO format YYYY-MM-DD
        [, year, month, day] = match;
      }
      
      const date = new Date(`${year}-${month}-${day}T00:00:00Z`);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }
  }
  
  return null;
}

/**
 * Generate a marker ID from marker name
 * @param {string} markerName - Marker name
 * @param {number} level - Marker level
 * @returns {string} Generated ID
 */
function generateMarkerId(markerName, level) {
  const prefix = LEVEL_PREFIX_MAP[level] || 'A';
  const slug = slugify(markerName, {
    replacement: '_',
    remove: /[^\w\s_-]/g,
    upper: true,
    strict: true
  });
  return `${prefix}_${slug}`;
}

/**
 * Repair a marker by applying auto-fixes
 * @param {Object} marker - Marker to repair
 * @param {Object} options - Repair options
 * @returns {Object} Repair result with repaired marker and applied fixes
 */
export async function repairMarker(marker, options = {}) {
  const logger = createLogger(options.verbose);
  const config = options.config?.repair || {};
  const pluginManager = getPluginManager(options.config || {});
  
  const fixes = [];
  const original = JSON.parse(JSON.stringify(marker));
  let modified = false;
  
  // Execute beforeRepair plugins
  let repairedMarker = await pluginManager.executeModifierHook('beforeRepair', marker);

  // Fix field name typos
  if (config.autoFixTypos !== false) {
    for (const [wrong, correct] of Object.entries(COMMON_FIELD_FIXES)) {
      if (repairedMarker[wrong] && !repairedMarker[correct]) {
        repairedMarker[correct] = repairedMarker[wrong];
        delete repairedMarker[wrong];
        fixes.push(`Fixed typo: '${wrong}' → '${correct}'`);
        modified = true;
      }
    }
  }

  // Add default values
  const defaults = {
    version: '1.0.0',
    status: 'draft',
    author: config.fallbackAuthor || 'auto_import',
    created: normalizeDate(new Date()),
    last_modified: normalizeDate(new Date())
  };

  for (const [field, value] of Object.entries(defaults)) {
    if (!repairedMarker[field]) {
      repairedMarker[field] = value;
      fixes.push(`Added default ${field}: ${value}`);
      modified = true;
    }
  }

  // Normalize dates
  if (config.autoFixDates !== false) {
    const dateFields = ['created', 'last_modified', 'updated', 'date'];
    for (const field of dateFields) {
      if (repairedMarker[field]) {
        const normalized = normalizeDate(repairedMarker[field]);
        if (normalized !== repairedMarker[field]) {
          repairedMarker[field] = normalized;
          fixes.push(`Normalized date format for ${field}`);
          modified = true;
        }
      }
    }
  }

  // Normalize pattern field
  if (config.normalizePatterns !== false && repairedMarker.pattern) {
    const { normalized, modified: patternModified } = normalizePatterns(repairedMarker);
    if (patternModified) {
      repairedMarker = normalized;
      fixes.push('Normalized pattern field to array format');
      modified = true;
    }
  }

  // Auto-migrate prefix based on level
  if (config.autoMigratePrefix !== false && repairedMarker.level) {
    const { marker: migratedMarker, migrated, originalId, fixes: migrationFixes } = migratePrefix(repairedMarker);
    if (migrated) {
      repairedMarker = migratedMarker;
      fixes.push(...migrationFixes);
      
      if (config.addMigrationMetadata !== false && originalId) {
        repairedMarker.x_migrated_from = originalId;
        repairedMarker.x_migration_ts = new Date().toISOString();
        fixes.push('Added migration metadata');
      }
      
      modified = true;
    }
  }

  // Generate ID if missing
  if (!repairedMarker.id && repairedMarker.marker) {
    const generatedId = generateMarkerId(repairedMarker.marker, repairedMarker.level || 1);
    repairedMarker.id = generatedId;
    fixes.push(`Generated ID: ${generatedId}`);
    modified = true;
  }

  // Convert single tags/examples to arrays
  if (repairedMarker.tags && !Array.isArray(repairedMarker.tags)) {
    repairedMarker.tags = String(repairedMarker.tags).split(',').map(t => t.trim()).filter(Boolean);
    fixes.push('Converted tags to array');
    modified = true;
  }

  if (repairedMarker.examples && !Array.isArray(repairedMarker.examples)) {
    repairedMarker.examples = [repairedMarker.examples];
    fixes.push('Converted examples to array');
    modified = true;
  }

  const result = {
    marker: repairedMarker,
    modified,
    fixes,
    original: modified ? original : null
  };
  
  // Execute afterRepair plugins
  await pluginManager.executeHook('afterRepair', original, repairedMarker, fixes);
  
  return result;
}

/**
 * Migrate ID prefix based on level
 * @param {Object} marker - Marker to migrate
 * @returns {Object} Migration result
 */
export function migratePrefix(marker) {
  const fixes = [];
  let migrated = false;
  let originalId = marker.id;
  
  if (!marker.id || !marker.level) {
    return { marker, migrated, originalId, fixes };
  }
  
  const expectedPrefix = LEVEL_PREFIX_MAP[marker.level];
  if (!expectedPrefix) {
    return { marker, migrated, originalId, fixes };
  }
  
  const currentPrefix = marker.id.match(/^([A-Z]+)_/)?.[1];
  
  if (!currentPrefix || currentPrefix !== expectedPrefix.replace('_', '')) {
    originalId = marker.id;
    const suffix = marker.id.replace(/^[A-Z]*_?/, '');
    // Ensure suffix doesn't start with underscore
    const cleanSuffix = suffix.replace(/^_+/, '');
    marker.id = `${expectedPrefix}${cleanSuffix}`;
    
    fixes.push(`Migrated ID prefix to '${expectedPrefix}' for level ${marker.level}`);
    migrated = true;
  }
  
  return { marker, migrated, originalId, fixes };
}

/**
 * Normalize pattern field to array format
 * @param {Object} marker - Marker to normalize
 * @returns {Object} Normalization result
 */
export function normalizePatterns(marker) {
  let modified = false;
  
  if (!marker.pattern) {
    return { normalized: marker, modified };
  }
  
  // If pattern is a string, convert to array
  if (typeof marker.pattern === 'string') {
    marker.pattern = [marker.pattern];
    modified = true;
  }
  
  // Ensure all patterns are strings
  if (Array.isArray(marker.pattern)) {
    marker.pattern = marker.pattern.map(p => String(p));
  }
  
  return { normalized: marker, modified };
}

/**
 * Repair multiple markers in batch
 * @param {Object[]} markers - Array of markers to repair
 * @param {Object} options - Repair options
 * @returns {Object} Batch repair results
 */
export async function repairBatch(markers, options = {}) {
  const logger = createLogger(options.verbose);
  const results = [];
  
  logger.info(`Repairing ${markers.length} markers...`);
  
  for (const marker of markers) {
    const result = await repairMarker(marker, options);
    results.push(result);
  }
  
  // Summary
  const repaired = results.filter(r => r.modified).length;
  const unchanged = results.filter(r => !r.modified).length;
  const totalFixes = results.reduce((sum, r) => sum + r.fixes.length, 0);
  
  logger.info(`\nRepair complete:`);
  logger.success(`  ✓ ${repaired} markers repaired (${totalFixes} fixes)`);
  logger.info(`  - ${unchanged} markers unchanged`);
  
  return {
    results,
    summary: {
      total: markers.length,
      repaired,
      unchanged,
      totalFixes
    }
  };
} 
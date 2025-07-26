/**
 * Marker Repair Module
 * Handles auto-repair and migration logic
 */

import slugify from 'slugify';
import { createLogger } from './index.js';
import { getPluginManager } from './plugin-loader.js';

const COMMON_FIELD_FIXES = {
  'desciption': 'description',
  'desription': 'description',
  'descrption': 'description',
  'descripton': 'description',
  'descriptin': 'description',
  'descriptio': 'description',
  'verson': 'version',
  'verison': 'version',
  'versio': 'version',
  'auther': 'author',
  'autho': 'author',
  'creatd': 'created',
  'creat': 'created',
  'modifed': 'modified',
  'modif': 'modified',
  'categry': 'category',
  'categoy': 'category',
  'categr': 'category',
  'patern': 'pattern',
  'patten': 'pattern',
  'pattn': 'pattern',
  'exmples': 'examples',
  'exampls': 'examples',
  'exampes': 'examples',
  'exmpls': 'examples',
  'tgs': 'tags',
  'tg': 'tags',
  'staus': 'status',
  'stat': 'status',
  'levl': 'level',
  'lvel': 'level',
  'risc': 'risk',
  'ris': 'risk',
  'scorng': 'scoring',
  'scor': 'scoring',
  'scorng.weight': 'scoring.weight',
  'scorng.impact': 'scoring.impact',
  'scorng.decay': 'scoring.decay',
  'windw': 'window',
  'wndow': 'window',
  'windo': 'window',
  'mesages': 'messages',
  'mesage': 'messages',
  'seonds': 'seconds',
  'secnds': 'seconds',
  'secods': 'seconds',
  'composed_of': 'composed_of',
  'composd_of': 'composed_of',
  'compos_of': 'composed_of',
  'actvation_logic': 'activation_logic',
  'actvaton_logic': 'activation_logic',
  'actvaton': 'activation_logic',
  'semantic_rules': 'semantic_rules',
  'semantc_rules': 'semantic_rules',
  'semantc': 'semantic_rules',
  'cluster_components': 'cluster_components',
  'clster_components': 'cluster_components',
  'clster': 'cluster_components',
  'trigger_threshold': 'trigger_threshold',
  'triger_threshold': 'trigger_threshold',
  'triger': 'trigger_threshold',
  'required_clusters': 'required_clusters',
  'requred_clusters': 'required_clusters',
  'requred': 'required_clusters',
  'meta_analysis': 'meta_analysis',
  'meta_anlysis': 'meta_analysis',
  'meta_anly': 'meta_analysis',
  'temporal_pattern': 'temporal_pattern',
  'tempra_pattern': 'temporal_pattern',
  'tempra': 'temporal_pattern',
  'frequency_threshold': 'frequency_threshold',
  'freqency_threshold': 'frequency_threshold',
  'freqency': 'frequency_threshold',
  'context_sensitivity': 'context_sensitivity',
  'contxt_sensitivity': 'context_sensitivity',
  'contxt': 'context_sensitivity',
  'weights': 'weights',
  'weghts': 'weights',
  'weght': 'weights',
  'decay': 'decay',
  'decay_factor': 'decay',
  'decay_factr': 'decay',
  'risk_thresholds': 'risk_thresholds',
  'risc_thresholds': 'risk_thresholds',
  'risc': 'risk_thresholds',
  'active_schemata': 'active_schemata',
  'actve_schemata': 'active_schemata',
  'actve': 'active_schemata',
  'priority': 'priority',
  'prorty': 'priority',
  'pror': 'priority',
  'fusion': 'fusion',
  'fuson': 'fusion',
  'fuso': 'fusion',
  'rule': 'rule',
  'rle': 'rule',
  'fire_marker': 'fire_marker',
  'fre_marker': 'fire_marker',
  'fre': 'fire_marker',
  'detectors_active': 'detectors_active',
  'detectrs_active': 'detectors_active',
  'detectrs': 'detectors_active',
  'high_level_snapshot': 'high_level_snapshot',
  'hgh_level_snapshot': 'high_level_snapshot',
  'hgh_level': 'high_level_snapshot',
  'include_levels': 'include_levels',
  'nclude_levels': 'include_levels',
  'nclude': 'include_levels',
  'top_k': 'top_k',
  'tp_k': 'top_k',
  'tp': 'top_k',
  'drift_axes': 'drift_axes',
  'drft_axes': 'drift_axes',
  'drft': 'drift_axes',
  'scoring': 'scoring',
  'scorng': 'scoring',
  'weight_multiplier': 'weight_multiplier',
  'weght_multiplier': 'weight_multiplier',
  'weght_mult': 'weight_multiplier',
  'outputs': 'outputs',
  'otputs': 'outputs',
  'otput': 'outputs',
  'show_markers': 'show_markers',
  'shw_markers': 'show_markers',
  'shw': 'show_markers',
  'show_drift': 'show_drift',
  'shw_drift': 'show_drift',
  'shw_drft': 'show_drift',
  'store_json': 'store_json',
  'store_jsn': 'store_json',
  'store': 'store_json',
  'target_markers': 'target_markers',
  'targt_markers': 'target_markers',
  'targt': 'target_markers',
  'aggregation': 'aggregation',
  'agregaton': 'aggregation',
  'agregat': 'aggregation',
  'class_name': 'class_name',
  'clas_name': 'class_name',
  'clas': 'class_name',
  'methods': 'methods',
  'methds': 'methods',
  'methd': 'methods',
  'parameters': 'parameters',
  'parametrs': 'parameters',
  'parametr': 'parameters',
  'file_path': 'file_path',
  'fle_path': 'file_path',
  'fle': 'file_path',
  'language': 'language',
  'langage': 'language',
  'lang': 'language',
  'function_name': 'function_name',
  'functon_name': 'function_name',
  'functon': 'function_name',
  'return_type': 'return_type',
  'retrn_type': 'return_type',
  'retrn': 'return_type',
  'dependencies': 'dependencies',
  'dependences': 'dependencies',
  'dependnce': 'dependencies'
};

const LEVEL_PREFIX_MAP = {
  1: 'A_',
  2: 'S_',
  3: 'C_',
  4: 'MM_'
};

const FILE_TYPE_PREFIX_MAP = {
  'markers': LEVEL_PREFIX_MAP,
  'schemas': { 'SCH': 'SCH_', 'MASTER_SCH': 'MASTER_SCH_' },
  'detects': { 'DETECT': 'DETECT_' },
  'chunk-analysis': { 'CHA': 'CHA_' },
  'scores': { 'SCR': 'SCR_' },
  'profilers': { 'PROF': 'PROF_' },
  'grabbers': { 'GR': 'GR_' }
};

function normalizeDate(value) {
  if (!value) return new Date().toISOString();
  if (typeof value === 'string') {
    // Try to parse various date formats
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  }
  return new Date().toISOString();
}

function generateMarkerId(markerName, level) {
  const prefix = LEVEL_PREFIX_MAP[level] || 'A_';
  const cleanName = markerName.replace(/[^A-Z0-9]/g, '_').toUpperCase();
  return `${prefix}${cleanName}`;
}

export async function repairMarker(marker, options = {}) {
  const logger = createLogger(options.verbose);
  const config = options.config?.repair || {};
  const pluginManager = getPluginManager(options.config || {});

  const fixes = [];
  const original = JSON.parse(JSON.stringify(marker));
  let modified = false;

  let repairedMarker = await pluginManager.executeModifierHook('beforeRepair', marker);

  // Fix typos in field names
  if (config.autoFixTypos !== false) {
    for (const [wrong, correct] of Object.entries(COMMON_FIELD_FIXES)) {
      if (repairedMarker[wrong] !== undefined) {
        repairedMarker[correct] = repairedMarker[wrong];
        delete repairedMarker[wrong];
        fixes.push(`Fixed typo: ${wrong} → ${correct}`);
        modified = true;
      }
    }
  }

  // Add missing default values
  if (config.autoFixDefaults !== false) {
    if (!repairedMarker.status) {
      repairedMarker.status = 'draft';
      fixes.push('Added default status: draft');
      modified = true;
    }
    if (!repairedMarker.risk_score) {
      repairedMarker.risk_score = 1;
      fixes.push('Added default risk_score: 1');
      modified = true;
    }
    if (!repairedMarker.author) {
      repairedMarker.author = config.fallbackAuthor || 'auto_import';
      fixes.push(`Added default author: ${repairedMarker.author}`);
      modified = true;
    }
  }

  // Normalize dates
  if (config.autoFixDates !== false) {
    if (!repairedMarker.created) {
      repairedMarker.created = normalizeDate();
      fixes.push('Added creation timestamp');
      modified = true;
    }
    if (!repairedMarker.last_modified) {
      repairedMarker.last_modified = normalizeDate();
      fixes.push('Added last_modified timestamp');
      modified = true;
    }
  }

  // Normalize patterns to arrays
  if (config.normalizePatterns !== false && repairedMarker.pattern) {
    const { normalized, modified: patternModified } = normalizePatterns(repairedMarker);
    if (patternModified) {
      repairedMarker = normalized;
      fixes.push('Normalized pattern to array');
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
  if (!repairedMarker.id && repairedMarker.marker && repairedMarker.level) {
    repairedMarker.id = generateMarkerId(repairedMarker.marker, repairedMarker.level);
    fixes.push(`Generated ID: ${repairedMarker.id}`);
    modified = true;
  }

  // Convert tags/examples to arrays if they're strings
  if (repairedMarker.tags && typeof repairedMarker.tags === 'string') {
    repairedMarker.tags = [repairedMarker.tags];
    fixes.push('Converted tags to array');
    modified = true;
  }
  if (repairedMarker.examples && typeof repairedMarker.examples === 'string') {
    repairedMarker.examples = [repairedMarker.examples];
    fixes.push('Converted examples to array');
    modified = true;
  }

  // Trim whitespace
  if (repairedMarker.description) {
    const trimmed = repairedMarker.description.trim();
    if (trimmed !== repairedMarker.description) {
      repairedMarker.description = trimmed;
      fixes.push('Trimmed description whitespace');
      modified = true;
    }
  }

  const result = {
    marker: repairedMarker,
    modified,
    fixes,
    original: modified ? original : null
  };

  await pluginManager.executeHook('afterRepair', original, repairedMarker, fixes);

  return result;
}

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
    const cleanSuffix = suffix.replace(/^_+/, '');
    marker.id = `${expectedPrefix}${cleanSuffix}`;

    fixes.push(`Migrated ID prefix to '${expectedPrefix}' for level ${marker.level}`);
    migrated = true;
  }
  return { marker, migrated, originalId, fixes };
}

export function normalizePatterns(marker) {
  let modified = false;
  if (!marker.pattern) {
    return { normalized: marker, modified };
  }
  if (typeof marker.pattern === 'string') {
    marker.pattern = [marker.pattern];
    modified = true;
  }
  if (Array.isArray(marker.pattern)) {
    marker.pattern = marker.pattern.map(p => String(p));
  }
  return { normalized: marker, modified };
}

// New function for repairing other file types
export async function repairFile(data, fileType, options = {}) {
  const logger = createLogger(options.verbose);
  const config = options.config?.repair || {};
  const pluginManager = getPluginManager(options.config || {});

  const fixes = [];
  const original = JSON.parse(JSON.stringify(data));
  let modified = false;

  let repairedData = await pluginManager.executeModifierHook('beforeRepair', data);

  // Apply file type specific repairs
  switch (fileType) {
    case 'markers':
      const markerResult = await repairMarker(repairedData, options);
      return markerResult;

    case 'schemas':
      repairedData = await repairSchema(repairedData, config, fixes);
      modified = fixes.length > 0;
      break;

    case 'detects':
      repairedData = await repairDetect(repairedData, config, fixes);
      modified = fixes.length > 0;
      break;

    case 'chunk-analysis':
      repairedData = await repairChunkAnalysis(repairedData, config, fixes);
      modified = fixes.length > 0;
      break;

    case 'scores':
      repairedData = await repairScore(repairedData, config, fixes);
      modified = fixes.length > 0;
      break;

    case 'profilers':
      repairedData = await repairProfiler(repairedData, config, fixes);
      modified = fixes.length > 0;
      break;

    case 'grabbers':
      repairedData = await repairGrabber(repairedData, config, fixes);
      modified = fixes.length > 0;
      break;

    default:
      // Default to marker repair
      const defaultResult = await repairMarker(repairedData, options);
      return defaultResult;
  }

  const result = {
    marker: repairedData,
    modified,
    fixes,
    original: modified ? original : null
  };

  await pluginManager.executeHook('afterRepair', original, repairedData, fixes);

  return result;
}

async function repairSchema(data, config, fixes) {
  // Fix typos in field names
  if (config.autoFixTypos !== false) {
    for (const [wrong, correct] of Object.entries(COMMON_FIELD_FIXES)) {
      if (data[wrong] !== undefined) {
        data[correct] = data[wrong];
        delete data[wrong];
        fixes.push(`Fixed typo: ${wrong} → ${correct}`);
      }
    }
  }

  // Fix risk thresholds
  if (config.autoFixRiskThresholds !== false && !data.risk_thresholds) {
    data.risk_thresholds = { green: 0, yellow: 10, red: 25 };
    fixes.push('Added default risk_thresholds');
  }

  // Fix window/decay defaults
  if (config.autoFixWindowDefaults !== false) {
    if (!data.window) {
      data.window = { messages: 100 };
      fixes.push('Added default window: { messages: 100 }');
    }
    if (data.decay === undefined) {
      data.decay = 0.005;
      fixes.push('Added default decay: 0.005');
    }
  }

  // Fix weights array format
  if (data.weights && typeof data.weights === 'string') {
    try {
      data.weights = JSON.parse(data.weights);
      fixes.push('Converted weights string to object');
    } catch (e) {
      // Keep as string if parsing fails
    }
  }

  return data;
}

async function repairDetect(data, config, fixes) {
  // Fix array fields
  if (config.autoFixArrays !== false) {
    if (data.rule && typeof data.rule.pattern === 'string') {
      data.rule.pattern = [data.rule.pattern];
      fixes.push('Converted rule pattern to array');
    }
  }

  // Fix timestamps
  if (config.autoFixDates !== false && !data.last_updated) {
    data.last_updated = new Date().toISOString();
    fixes.push('Added last_updated timestamp');
  }

  // Fix file paths
  if (data.file_path) {
    const normalized = data.file_path.replace(/\\/g, '/');
    if (normalized !== data.file_path) {
      data.file_path = normalized;
      fixes.push('Normalized file path separators');
    }
  }

  return data;
}

async function repairChunkAnalysis(data, config, fixes) {
  // Fix ID prefix
  if (config.autoMigratePrefix !== false && data.id && !data.id.startsWith('CHA_')) {
    const originalId = data.id;
    data.id = `CHA_${data.id.replace(/^[A-Z]*_?/, '')}`;
    fixes.push(`Fixed ID prefix: ${originalId} → ${data.id}`);
  }

  // Fix detectors_active array
  if (config.autoFixArrays !== false && data.detectors_active) {
    if (typeof data.detectors_active === 'string') {
      data.detectors_active = [data.detectors_active];
      fixes.push('Converted detectors_active to array');
    }
  }

  // Fix snapshot fields
  if (!data.high_level_snapshot) {
    data.high_level_snapshot = { include_levels: ['C_', 'MM_'], top_k: 5 };
    fixes.push('Added default high_level_snapshot');
  }

  return data;
}

async function repairScore(data, config, fixes) {
  // Fix ID prefix
  if (config.autoMigratePrefix !== false && data.id && !data.id.startsWith('SCR_')) {
    const originalId = data.id;
    data.id = `SCR_${data.id.replace(/^[A-Z]*_?/, '')}`;
    fixes.push(`Fixed ID prefix: ${originalId} → ${data.id}`);
  }

  // Fix window/aggregation defaults
  if (config.autoFixWindowDefaults !== false) {
    if (!data.window) {
      data.window = { messages: 50 };
      fixes.push('Added default window: { messages: 50 }');
    }
    if (!data.aggregation) {
      data.aggregation = 'sum';
      fixes.push('Added default aggregation: sum');
    }
  }

  // Fix array fields
  if (config.autoFixArrays !== false && data.target_markers && typeof data.target_markers === 'string') {
    data.target_markers = [data.target_markers];
    fixes.push('Converted target_markers to array');
  }

  return data;
}

async function repairProfiler(data, config, fixes) {
  // Fix ID prefix
  if (config.autoMigratePrefix !== false && data.id && !data.id.startsWith('PROF_')) {
    const originalId = data.id;
    data.id = `PROF_${data.id.replace(/^[A-Z]*_?/, '')}`;
    fixes.push(`Fixed ID prefix: ${originalId} → ${data.id}`);
  }

  // Fix window/aggregation defaults
  if (config.autoFixWindowDefaults !== false && !data.window) {
    data.window = { messages: 100 };
    fixes.push('Added default window: { messages: 100 }');
  }

  // Fix array fields
  if (config.autoFixArrays !== false && data.methods && typeof data.methods === 'string') {
    data.methods = [data.methods];
    fixes.push('Converted methods to array');
  }

  return data;
}

async function repairGrabber(data, config, fixes) {
  // Fix ID prefix
  if (config.autoMigratePrefix !== false && data.id && !data.id.startsWith('GR_')) {
    const originalId = data.id;
    data.id = `GR_${data.id.replace(/^[A-Z]*_?/, '')}`;
    fixes.push(`Fixed ID prefix: ${originalId} → ${data.id}`);
  }

  // Fix description
  if (!data.description) {
    data.description = 'Auto-generated grabber description';
    fixes.push('Added placeholder description');
  }

  // Fix array fields
  if (config.autoFixArrays !== false && data.dependencies && typeof data.dependencies === 'string') {
    data.dependencies = [data.dependencies];
    fixes.push('Converted dependencies to array');
  }

  return data;
}

export async function repairBatch(markers, options = {}) {
  const logger = createLogger(options.verbose);
  const results = [];

  for (const marker of markers) {
    try {
      const result = await repairMarker(marker, options);
      results.push(result);
    } catch (error) {
      logger.error(`Failed to repair marker: ${error.message}`);
      results.push({
        marker,
        modified: false,
        fixes: [],
        error: error.message
      });
    }
  }

  return results;
} 
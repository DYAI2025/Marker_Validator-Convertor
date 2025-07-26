import { MarkerPlugin } from '../packages/cli/src/plugin-api.js';

/**
 * Kimi Suggest Plugin
 * 
 * Suggests additional tags based on marker content using simple keyword analysis
 */
export default class KimiSuggestPlugin extends MarkerPlugin {
  constructor() {
    super();
    this.name = 'kimi-suggest';
    this.version = '1.0.0';
    this.description = 'Suggests additional tags based on marker content';
    
    // Keyword mappings for tag suggestions
    this.keywordMappings = {
      // Security related
      'password': ['security', 'authentication', 'credentials'],
      'token': ['security', 'authentication', 'api'],
      'encrypt': ['security', 'cryptography'],
      'decrypt': ['security', 'cryptography'],
      'auth': ['authentication', 'security'],
      'login': ['authentication', 'user-session'],
      'logout': ['authentication', 'user-session'],
      
      // Data related
      'database': ['data-storage', 'persistence'],
      'cache': ['performance', 'data-storage'],
      'storage': ['data-storage', 'persistence'],
      'backup': ['data-protection', 'recovery'],
      
      // Communication related
      'email': ['communication', 'notification'],
      'sms': ['communication', 'notification'],
      'webhook': ['integration', 'api', 'notification'],
      'api': ['integration', 'interface'],
      
      // Performance related
      'optimize': ['performance', 'efficiency'],
      'speed': ['performance'],
      'slow': ['performance', 'issue'],
      'fast': ['performance'],
      
      // Error/Issue related
      'error': ['error-handling', 'issue'],
      'exception': ['error-handling', 'issue'],
      'bug': ['issue', 'defect'],
      'fix': ['maintenance', 'bugfix'],
      
      // Fraud related
      'fraud': ['security', 'risk', 'fraud'],
      'manipulat': ['fraud', 'risk', 'manipulation'],
      'fake': ['fraud', 'deception'],
      'suspicious': ['fraud', 'risk', 'warning']
    };
  }

  async init(context) {
    context.log('Kimi Suggest Plugin initialized');
    context.setMetadata('suggestions_count', 0);
  }

  async afterValidation(marker, validationResult, context) {
    if (!validationResult.valid) {
      return;
    }

    // Analyze marker content for keywords
    const textToAnalyze = [
      marker.marker || '',
      marker.description || '',
      ...(marker.examples || [])
    ].join(' ').toLowerCase();

    const suggestedTags = new Set(marker.tags || []);
    const originalSize = suggestedTags.size;

    // Find matching keywords and suggest tags
    for (const [keyword, tags] of Object.entries(this.keywordMappings)) {
      if (textToAnalyze.includes(keyword)) {
        tags.forEach(tag => suggestedTags.add(tag));
      }
    }

    // Level-based suggestions
    if (marker.level === 1) {
      suggestedTags.add('atomic');
    } else if (marker.level === 2) {
      suggestedTags.add('semantic');
    } else if (marker.level === 3) {
      suggestedTags.add('cluster');
    } else if (marker.level === 4) {
      suggestedTags.add('meta');
    }

    // Risk-based suggestions
    if (marker.risk_score >= 4) {
      suggestedTags.add('high-risk');
      suggestedTags.add('critical');
    } else if (marker.risk_score >= 3) {
      suggestedTags.add('medium-risk');
    }

    const newTags = Array.from(suggestedTags);
    const addedCount = newTags.length - originalSize;

    if (addedCount > 0) {
      context.log(`Suggested ${addedCount} new tags for marker ${marker.id}`);
      context.setMetadata('suggestions_count', 
        context.getMetadata('suggestions_count') + addedCount
      );

      // Store suggestions in marker metadata
      marker.x_suggested_tags = newTags.filter(tag => 
        !(marker.tags || []).includes(tag)
      );
    }
  }

  async afterBatch(results, context) {
    const totalSuggestions = context.getMetadata('suggestions_count');
    if (totalSuggestions > 0) {
      context.log(`Total tag suggestions made: ${totalSuggestions}`);
    }
  }

  async cleanup(context) {
    context.log('Kimi Suggest Plugin cleaned up');
  }
} 
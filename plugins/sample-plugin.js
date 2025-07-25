/**
 * Sample Plugin for Marker Validator Tool
 * Demonstrates the plugin API
 */

export const plugin = {
  name: 'sample-plugin',
  version: '1.0.0',
  description: 'Sample plugin that adds tag statistics',
  
  // Called when plugin is loaded
  async init(context) {
    console.log(`${this.name} v${this.version} loaded`);
    this.tagStats = new Map();
  },
  
  // Called before validation
  async beforeValidation(marker, context) {
    // Count tags for statistics
    if (marker.tags && Array.isArray(marker.tags)) {
      marker.tags.forEach(tag => {
        const count = this.tagStats.get(tag) || 0;
        this.tagStats.set(tag, count + 1);
      });
    }
    return marker; // Return potentially modified marker
  },
  
  // Called after validation
  async afterValidation(marker, validationResult, context) {
    // Add custom validation info
    if (validationResult.valid && marker.tags?.includes('high-priority')) {
      validationResult.customInfo = {
        priority: 'HIGH',
        message: 'This marker has high priority tag'
      };
    }
    return validationResult;
  },
  
  // Called before repair
  async beforeRepair(marker, context) {
    // Custom repair suggestions
    if (!marker.category && marker.tags?.length > 0) {
      // Suggest category based on first tag
      marker.suggested_category = marker.tags[0].toUpperCase();
    }
    return marker;
  },
  
  // Called after all processing
  async afterBatch(results, context) {
    // Generate tag statistics report
    const report = {
      totalTags: this.tagStats.size,
      tagCounts: Object.fromEntries(this.tagStats),
      topTags: Array.from(this.tagStats.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([tag, count]) => ({ tag, count }))
    };
    
    return {
      ...results,
      pluginReports: {
        ...results.pluginReports,
        [this.name]: report
      }
    };
  }
};

// Export default for CommonJS compatibility
export default plugin; 
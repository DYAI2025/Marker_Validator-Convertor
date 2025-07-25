import { MarkerPlugin } from '../packages/cli/src/plugin-api.js';

/**
 * Timestamp Plugin
 * 
 * Adds processing timestamps to markers
 */
export default class TimestampPlugin extends MarkerPlugin {
  constructor() {
    super();
    this.name = 'timestamp';
    this.version = '1.0.0';
    this.description = 'Adds processing timestamps to markers';
  }

  async init(context) {
    context.log('Timestamp Plugin initialized');
    this.startTime = new Date();
  }

  async beforeValidation(marker, context) {
    // Add validation timestamp
    marker.x_validated_at = new Date().toISOString();
    return marker;
  }

  async beforeConversion(marker, targetFormat, context) {
    // Add conversion timestamp
    marker.x_converted_at = new Date().toISOString();
    marker.x_converted_to = targetFormat;
    return marker;
  }

  async afterBatch(results, context) {
    const endTime = new Date();
    const duration = (endTime - this.startTime) / 1000;
    
    context.log(`Batch processing completed in ${duration.toFixed(2)} seconds`);
    
    // Add batch summary
    const summary = {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      duration: duration,
      timestamp: endTime.toISOString()
    };
    
    context.setMetadata('batch_summary', summary);
  }

  async cleanup(context) {
    const summary = context.getMetadata('batch_summary');
    if (summary) {
      context.log(`Plugin cleanup - Processed ${summary.total} files`);
    }
  }
} 
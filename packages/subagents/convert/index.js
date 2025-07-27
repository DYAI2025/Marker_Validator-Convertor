import express from 'express';
import { formatMarker } from '../../../packages/cli/src/converter.js';

const app = express();
app.use(express.json());

const startTime = Date.now();

// Health-Check Endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'convert-agent',
    timestamp: new Date().toISOString() 
  });
});

// Metadata Endpoint
app.get('/meta', (req, res) => {
  res.json({
    name: 'convert-agent',
    version: '1.0.0',
    status: 'online',
    uptime: Date.now() - startTime,
    description: 'Converts markers between different formats',
    capabilities: ['json-to-yaml', 'yaml-to-json', 'format-conversion'],
    lastAction: null
  });
});

app.post('/convert', async (req, res) => {
  const marker = req.body;
  const { format = 'json' } = req.query;
  
  try {
    console.log(`🔄 Converting marker: ${marker.id || 'unknown'} to ${format}`);
    
    const options = {
      config: {
        export: {
          prettyPrint: true,
          yamlIndent: 2,
          jsonIndent: 2,
          sortKeys: false
        }
      }
    };
    
    const convertedContent = formatMarker(marker, format, options);
    
    console.log(`✅ Conversion completed: ${marker.id || 'unknown'} → ${format}`);
    
    res.json({
      converted: marker,
      format: format,
      content: convertedContent,
      summary: `Successfully converted to ${format.toUpperCase()} format`
    });
  } catch (err) {
    console.error(`❌ Conversion failed: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4003;
app.listen(PORT, () => {
  console.log(`🔄 Convert-Agent läuft auf Port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:4000`);
  console.log(`🔄 Convert: http://localhost:${PORT}`);
});

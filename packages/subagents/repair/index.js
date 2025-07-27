import express from 'express';
import { repairMarker } from '../../../packages/cli/src/repair.js';

const app = express();
app.use(express.json());

const startTime = Date.now();

// Health-Check Endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'repair-agent',
    timestamp: new Date().toISOString() 
  });
});

// Metadata Endpoint
app.get('/meta', (req, res) => {
  res.json({
    name: 'repair-agent',
    version: '1.0.0',
    status: 'online',
    uptime: Date.now() - startTime,
    description: 'Repairs and fixes marker objects',
    capabilities: ['repair', 'auto-fix', 'normalization'],
    lastAction: null
  });
});

app.post('/repair', async (req, res) => {
  const marker = req.body;
  const { mode = 'conservative' } = req.query;
  
  try {
    console.log(`🔧 Repairing marker: ${marker.id || 'unknown'}`);
    
    const options = {
      conservative: mode === 'conservative',
      aggressive: mode === 'aggressive',
      verbose: true
    };
    
    const result = await repairMarker(marker, options);
    
    console.log(`✅ Repair completed for: ${marker.id || 'unknown'}`);
    
    res.json({
      repaired: result.repaired,
      fixes: result.fixes || [],
      modified: result.modified || false,
      summary: result.summary || 'Repair completed successfully'
    });
  } catch (err) {
    console.error(`❌ Repair failed: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => {
  console.log(`🔧 Repair-Agent läuft auf Port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:4000`);
  console.log(`🔧 Repair: http://localhost:${PORT}`);
});

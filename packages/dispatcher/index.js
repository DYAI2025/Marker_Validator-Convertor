import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

// Subagent-Konfiguration
const SUBAGENTS = {
  validator: { port: 4001, name: 'Validator Agent', endpoint: '/validate' },
  repair: { port: 4002, name: 'Repair Agent', endpoint: '/repair' },
  convert: { port: 4003, name: 'Convert Agent', endpoint: '/convert' }
};

// Dispatcher-Logik
async function processMarker(marker, steps) {
  const results = {
    input: marker,
    steps: steps,
    results: {},
    errors: [],
    timestamp: new Date().toISOString()
  };

  let currentMarker = marker;

  for (const step of steps) {
    if (!SUBAGENTS[step]) {
      results.errors.push(`Unknown step: ${step}`);
      continue;
    }

    try {
      console.log(`Processing step: ${step}`);
      
      const agent = SUBAGENTS[step];
      const url = `http://localhost:${agent.port}${agent.endpoint}`;
      
      let response;
      if (step === 'convert') {
        response = await axios.post(`${url}?format=json`, currentMarker);
      } else {
        response = await axios.post(url, currentMarker);
      }

      results.results[step] = {
        success: true,
        data: response.data,
        agent: agent.name
      };

      if (step === 'repair' && response.data.repaired) {
        currentMarker = response.data.repaired;
      } else if (step === 'convert' && response.data.converted) {
        currentMarker = response.data.converted;
      }

    } catch (error) {
      console.error(`Error in step ${step}:`, error.message);
      results.results[step] = {
        success: false,
        error: error.message,
        agent: SUBAGENTS[step].name
      };
      results.errors.push(`${step}: ${error.message}`);
    }
  }

  results.finalMarker = currentMarker;
  return results;
}

// Health-Check Endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'marker-dispatcher',
    timestamp: new Date().toISOString() 
  });
});

// Dispatcher Endpoint
app.post('/process', async (req, res) => {
  try {
    const marker = req.body;
    const steps = req.query.steps ? req.query.steps.split(',') : ['validate'];
    
    console.log(`Processing marker with steps: ${steps.join(', ')}`);
    
    const result = await processMarker(marker, steps);
    res.json(result);
    
  } catch (error) {
    console.error('Dispatcher error:', error);
    res.status(500).json({ 
      error: error.message,
      service: 'marker-dispatcher'
    });
  }
});

// Agent Status Endpoint
app.get('/agents/status', async (req, res) => {
  const status = {};
  
  for (const [name, agent] of Object.entries(SUBAGENTS)) {
    try {
      const response = await axios.get(`http://localhost:${agent.port}/health`, { timeout: 2000 });
      status[name] = {
        name: agent.name,
        status: 'online',
        port: agent.port,
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      status[name] = {
        name: agent.name,
        status: 'offline',
        port: agent.port,
        error: error.message,
        lastCheck: new Date().toISOString()
      };
    }
  }
  
  res.json(status);
});

// Agent Metadata Endpoint
app.get('/agents/meta', async (req, res) => {
  const metadata = {};
  
  for (const [name, agent] of Object.entries(SUBAGENTS)) {
    try {
      const response = await axios.get(`http://localhost:${agent.port}/meta`, { timeout: 2000 });
      metadata[name] = response.data;
    } catch (error) {
      metadata[name] = {
        name: agent.name,
        status: 'offline',
        error: error.message
      };
    }
  }
  
  res.json(metadata);
});

const PORT = process.env.PORT || 4004;
app.listen(PORT, () => {
  console.log(`🚀 Marker Dispatcher läuft auf Port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:4000`);
  console.log(`🔧 Dispatcher: http://localhost:${PORT}`);
  console.log(`📋 Agents: ${Object.keys(SUBAGENTS).join(', ')}`);
});

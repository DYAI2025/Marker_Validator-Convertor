import express from 'express';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());

// Health-Check Endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'validator-agent',
    timestamp: new Date().toISOString() 
  });
});

app.post('/validate', (req, res) => {
  const marker = req.body;
  res.json({ valid: true, errors: [] });
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Validator-Agent läuft auf Port ${PORT}`);
});

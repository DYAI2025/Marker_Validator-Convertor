import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);

// Statische Dateien
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Subagent-Konfiguration
const SUBAGENTS = {
  validator: { port: 4001, name: 'Validator Agent', status: 'stopped' },
  repair: { port: 4002, name: 'Repair Agent', status: 'stopped' },
  convert: { port: 4003, name: 'Convert Agent', status: 'stopped' }
};

// Logs für jeden Subagent
const logs = {
  validator: [],
  repair: [],
  convert: []
};

// Log-Funktion
function addLog(agent, message) {
  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, message };
  logs[agent].push(logEntry);
  if (logs[agent].length > 100) logs[agent].shift();
  io.emit('log', { agent, logEntry });
}

// Subagent-Status prüfen
async function checkAgentStatus(agent) {
  try {
    const response = await axios.get(`http://localhost:${SUBAGENTS[agent].port}/health`, { timeout: 2000 });
    SUBAGENTS[agent].status = 'running';
    addLog(agent, 'Status: Running');
  } catch (error) {
    SUBAGENTS[agent].status = 'stopped';
    addLog(agent, 'Status: Stopped');
  }
  io.emit('status', { agent, status: SUBAGENTS[agent].status });
}

// Status alle 5 Sekunden prüfen
setInterval(() => {
  Object.keys(SUBAGENTS).forEach(checkAgentStatus);
}, 5000);

// Socket.IO Events
io.on('connection', (socket) => {
  console.log('Dashboard connected');
  
  socket.emit('agents', SUBAGENTS);
  socket.emit('logs', logs);
  
  socket.on('validate', async (data) => {
    try {
      addLog('validator', `Validating marker: ${data.id || 'unknown'}`);
      const response = await axios.post('http://localhost:4001/validate', data.marker);
      addLog('validator', `Validation result: ${response.data.valid ? 'Valid' : 'Invalid'}`);
      socket.emit('validation_result', response.data);
    } catch (error) {
      addLog('validator', `Error: ${error.message}`);
      socket.emit('error', { agent: 'validator', error: error.message });
    }
  });
  
  socket.on('repair', async (data) => {
    try {
      addLog('repair', `Repairing marker: ${data.id || 'unknown'}`);
      const response = await axios.post('http://localhost:4002/repair', data.marker);
      addLog('repair', `Repair result: ${response.data.modified ? 'Modified' : 'No changes'}`);
      socket.emit('repair_result', response.data);
    } catch (error) {
      addLog('repair', `Error: ${error.message}`);
      socket.emit('error', { agent: 'repair', error: error.message });
    }
  });
  
  socket.on('convert', async (data) => {
    try {
      addLog('convert', `Converting marker: ${data.id || 'unknown'} to ${data.format}`);
      const response = await axios.post(`http://localhost:4003/convert?format=${data.format}`, data.marker);
      addLog('convert', `Conversion completed to ${data.format}`);
      socket.emit('convert_result', response.data);
    } catch (error) {
      addLog('convert', `Error: ${error.message}`);
      socket.emit('error', { agent: 'convert', error: error.message });
    }
  });
  
  socket.on('clear_logs', (agent) => {
    logs[agent] = [];
    socket.emit('logs', logs);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Subagents Dashboard läuft auf Port ${PORT}`);
  console.log(`Dashboard verfügbar unter: http://localhost:${PORT}`);
});

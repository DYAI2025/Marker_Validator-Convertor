import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import isDev from 'electron-is-dev';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/icon.png'),
    title: 'Marker Validator & Converter'
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC Handlers

// Handle file dialog
ipcMain.handle('dialog:openFiles', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Marker Files', extensions: ['yaml', 'yml', 'json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  return result.canceled ? [] : result.filePaths;
});

// Handle folder dialog
ipcMain.handle('dialog:selectFolder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory']
  });
  
  return result.canceled ? null : result.filePaths[0];
});

// Handle CLI execution
ipcMain.handle('cli:execute', async (event, command, args) => {
  return new Promise((resolve, reject) => {
    const cliPath = isDev 
      ? path.join(__dirname, '../../cli/bin/cli.js')
      : path.join(process.resourcesPath, 'cli/bin/cli.js');
    
    const child = spawn('node', [cliPath, command, ...args], {
      cwd: app.getPath('userData'),
      env: { ...process.env, FORCE_COLOR: '1' }
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
      // Send progress updates to renderer
      event.sender.send('cli:output', data.toString());
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
      event.sender.send('cli:error', data.toString());
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, stdout, stderr });
      } else {
        reject(new Error(`CLI exited with code ${code}: ${stderr}`));
      }
    });
    
    child.on('error', (error) => {
      reject(error);
    });
  });
});

// Handle repair preview
ipcMain.handle('repair:preview', async (event, filePath) => {
  try {
    const cliPath = isDev 
      ? path.join(__dirname, '../../cli/bin/cli.js')
      : path.join(process.resourcesPath, 'cli/bin/cli.js');
    
    return new Promise((resolve, reject) => {
      // First, get repair info with dry-run
      const child = spawn('node', [cliPath, 'repair', filePath, '--dry-run', '-v'], {
        cwd: app.getPath('userData'),
        env: { ...process.env, FORCE_COLOR: '0' }
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', async (code) => {
        if (code === 0) {
          // Parse the repair output
          const fixes = [];
          const lines = stdout.split('\n');
          
          lines.forEach(line => {
            if (line.includes('→') || line.includes('Fixed:') || line.includes('Added:') || line.includes('Migrated:')) {
              const cleanLine = line.trim()
                .replace(/^[✓✔⚡]/, '')
                .replace(/^\s*-\s*/, '')
                .trim();
              if (cleanLine) fixes.push(cleanLine);
            }
          });
          
          // Read original file
          const originalContent = readFileSync(filePath, 'utf8');
          const fileExt = path.extname(filePath).toLowerCase();
          const isYaml = fileExt === '.yaml' || fileExt === '.yml';
          
          // Parse original content
          let original;
          try {
            original = isYaml ? yaml.load(originalContent) : JSON.parse(originalContent);
          } catch (error) {
            reject(new Error(`Failed to parse file: ${error.message}`));
            return;
          }
          
          // Get repaired version by running repair without dry-run to temp file
          const tempPath = path.join(app.getPath('temp'), `repair_preview_${Date.now()}.yaml`);
          
          const repairChild = spawn('node', [cliPath, 'repair', filePath, '-o', path.dirname(tempPath), '--no-backup'], {
            cwd: app.getPath('userData'),
            env: { ...process.env, FORCE_COLOR: '0' }
          });
          
          repairChild.on('close', (repairCode) => {
            if (repairCode === 0) {
              try {
                // Read the repaired file
                const repairedPath = path.join(path.dirname(tempPath), path.basename(filePath));
                const repairedContent = readFileSync(repairedPath, 'utf8');
                const repaired = yaml.load(repairedContent);
                
                // Convert to YAML for diff display
                const originalYaml = yaml.dump(original, { noRefs: true });
                const repairedYaml = yaml.dump(repaired, { noRefs: true });
                
                // Clean up temp file
                try {
                  const fs = require('fs');
                  fs.unlinkSync(repairedPath);
                } catch (e) {
                  // Ignore cleanup errors
                }
                
                resolve({
                  success: true,
                  fixes,
                  original,
                  repaired,
                  originalYaml,
                  repairedYaml
                });
              } catch (error) {
                reject(error);
              }
            } else {
              reject(new Error('Failed to generate repair preview'));
            }
          });
          
          repairChild.on('error', (error) => {
            reject(error);
          });
        } else {
          reject(new Error(`Repair preview failed: ${stderr}`));
        }
      });
      
      child.on('error', (error) => {
        reject(error);
      });
    });
  } catch (error) {
    console.error('Repair preview error:', error);
    throw error;
  }
});

// Handle file read
ipcMain.handle('file:read', async (event, filePath) => {
  try {
    const content = readFileSync(filePath, 'utf8');
    return { success: true, content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Handle file write
ipcMain.handle('file:write', async (event, filePath, content) => {
  try {
    writeFileSync(filePath, content, 'utf8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Handle config operations
ipcMain.handle('config:get', async () => {
  try {
    // First try to load user config
    const userConfigPath = path.join(app.getPath('userData'), 'marker-tool.config.json');
    
    if (existsSync(userConfigPath)) {
      const userConfig = JSON.parse(readFileSync(userConfigPath, 'utf8'));
      return userConfig;
    }
    
    // Fall back to default config
    const configPath = path.join(__dirname, '../../../config/marker-tool.default.json');
    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    return config;
  } catch (error) {
    console.error('Failed to load config:', error);
    return {};
  }
});

// Handle config save
ipcMain.handle('config:save', async (event, config) => {
  try {
    const userConfigPath = path.join(app.getPath('userData'), 'marker-tool.config.json');
    writeFileSync(userConfigPath, JSON.stringify(config, null, 2), 'utf8');
    return { success: true };
  } catch (error) {
    console.error('Failed to save config:', error);
    return { success: false, error: error.message };
  }
});

// Handle config reset
ipcMain.handle('config:reset', async () => {
  try {
    const userConfigPath = path.join(app.getPath('userData'), 'marker-tool.config.json');
    if (existsSync(userConfigPath)) {
      const fs = require('fs');
      fs.unlinkSync(userConfigPath);
    }
    
    // Return default config
    const configPath = path.join(__dirname, '../../../config/marker-tool.default.json');
    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    return config;
  } catch (error) {
    console.error('Failed to reset config:', error);
    return null;
  }
});

// Handle schema validation
ipcMain.handle('schema:validate', async (event, schemaPath) => {
  try {
    const schemaContent = readFileSync(schemaPath, 'utf8');
    const schema = JSON.parse(schemaContent);
    
    // Basic validation checks
    if (!schema.$schema || !schema.properties || !schema.required) {
      return { 
        valid: false, 
        error: 'Invalid schema format: missing required fields ($schema, properties, required)' 
      };
    }
    
    // Check for marker v2 compatibility
    const requiredProps = ['id', 'marker', 'description', 'level', 'version', 'status'];
    const missingProps = requiredProps.filter(prop => !schema.properties[prop]);
    
    if (missingProps.length > 0) {
      return { 
        valid: false, 
        error: `Schema missing required marker properties: ${missingProps.join(', ')}` 
      };
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
});

// Get app info
ipcMain.handle('app:getInfo', () => {
  return {
    version: app.getVersion(),
    platform: process.platform,
    paths: {
      userData: app.getPath('userData'),
      temp: app.getPath('temp')
    }
  };
}); 
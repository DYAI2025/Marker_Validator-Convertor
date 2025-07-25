import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  openFiles: () => ipcRenderer.invoke('dialog:openFiles'),
  selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
  readFile: (filePath) => ipcRenderer.invoke('file:read', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('file:write', filePath, content),
  
  // CLI operations
  executeCLI: (command, args) => ipcRenderer.invoke('cli:execute', command, args),
  
  // Repair operations
  previewRepair: (filePath) => ipcRenderer.invoke('repair:preview', filePath),
  
  // Listen to CLI output
  onCLIOutput: (callback) => {
    ipcRenderer.on('cli:output', (event, data) => callback(data));
  },
  
  onCLIError: (callback) => {
    ipcRenderer.on('cli:error', (event, data) => callback(data));
  },
  
  // Config operations
  getConfig: () => ipcRenderer.invoke('config:get'),
  saveConfig: (config) => ipcRenderer.invoke('config:save', config),
  resetConfig: () => ipcRenderer.invoke('config:reset'),
  
  // Schema operations
  validateSchema: (schemaPath) => ipcRenderer.invoke('schema:validate', schemaPath),
  
  // App info
  getAppInfo: () => ipcRenderer.invoke('app:getInfo'),
  
  // Remove listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
}); 
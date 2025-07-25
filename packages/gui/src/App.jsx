import React, { useState, useEffect } from 'react';
import DropZone from './components/DropZone';
import FileList from './components/FileList';
import ResultsTable from './components/ResultsTable';
import ActionBar from './components/ActionBar';
import RepairPreview from './components/RepairPreview';
import SettingsDialog from './components/SettingsDialog';
import './styles/App.css';

function App() {
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [command, setCommand] = useState('convert');
  const [config, setConfig] = useState({});
  const [repairPreview, setRepairPreview] = useState(null);
  const [interactiveMode, setInteractiveMode] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedSchema, setSelectedSchema] = useState('default');

  useEffect(() => {
    // Load config on mount
    loadConfig();
    
    // Set up CLI output listeners
    window.electronAPI.onCLIOutput((data) => {
      console.log('CLI Output:', data);
    });
    
    window.electronAPI.onCLIError((data) => {
      console.error('CLI Error:', data);
    });
    
    return () => {
      window.electronAPI.removeAllListeners('cli:output');
      window.electronAPI.removeAllListeners('cli:error');
    };
  }, []);

  const loadConfig = async () => {
    const loadedConfig = await window.electronAPI.getConfig();
    setConfig(loadedConfig);
  };

  const handleSaveSettings = async (newSettings) => {
    const result = await window.electronAPI.saveConfig(newSettings);
    if (result.success) {
      setConfig(newSettings);
      // Show success notification
      console.log('Settings saved successfully');
    } else {
      console.error('Failed to save settings:', result.error);
    }
  };

  const handleFilesAdded = (newFiles) => {
    const fileObjects = newFiles.map((file, index) => ({
      id: Date.now() + index,
      path: file.path || file,
      name: file.name || file.split('/').pop(),
      size: file.size || 0,
      type: file.name ? (file.name.endsWith('.yaml') || file.name.endsWith('.yml') ? 'yaml' : 'json') : 'unknown',
      status: 'pending'
    }));
    
    setFiles(prev => [...prev, ...fileObjects]);
  };

  const handleRemoveFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleClearAll = () => {
    setFiles([]);
    setResults([]);
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    
    setProcessing(true);
    setResults([]);
    
    try {
      // For repair command with interactive mode, show preview first
      if (command === 'repair' && interactiveMode) {
        await handleInteractiveRepair();
      } else {
        // Regular processing
        await processFiles(files);
      }
    } catch (error) {
      console.error('Processing error:', error);
      handleProcessingError(error);
    } finally {
      setProcessing(false);
    }
  };

  const handleInteractiveRepair = async () => {
    // Process files one by one for interactive repair
    for (const file of files) {
      try {
        const repairResult = await window.electronAPI.previewRepair(file.path);
        
        if (repairResult.fixes && repairResult.fixes.length > 0) {
          // Show preview and wait for user action
          await new Promise((resolve) => {
            setRepairPreview({
              file,
              repairs: repairResult,
              onApply: async (file, selectedFixes) => {
                // Apply selected fixes
                await applyRepairs(file, repairResult.repaired);
                updateFileStatus(file.id, 'success', `Applied ${selectedFixes.length} fixes`);
                setRepairPreview(null);
                resolve();
              },
              onCancel: () => {
                updateFileStatus(file.id, 'skipped', 'Repair cancelled');
                setRepairPreview(null);
                resolve();
              },
              onClose: () => {
                updateFileStatus(file.id, 'skipped', 'Repair cancelled');
                setRepairPreview(null);
                resolve();
              }
            });
          });
        } else {
          updateFileStatus(file.id, 'success', 'No repairs needed');
        }
      } catch (error) {
        updateFileStatus(file.id, 'error', error.message);
      }
    }
  };

  const applyRepairs = async (file, repairedData) => {
    // Write the repaired data back to file
    const yaml = await import('js-yaml');
    const fileExt = file.path.split('.').pop().toLowerCase();
    const content = fileExt === 'json' 
      ? JSON.stringify(repairedData, null, 2)
      : yaml.dump(repairedData, { noRefs: true });
    
    await window.electronAPI.writeFile(file.path, content);
  };

  const processFiles = async (filesToProcess) => {
    const filePaths = filesToProcess.map(f => f.path);
    const args = [...filePaths];
    
    // Add command-specific options
    if (command === 'convert') {
      args.push('-o', config.outputDirs?.yaml || 'out');
      if (selectedSchema !== 'default') {
        args.push('-s', selectedSchema);
      }
    } else if (command === 'validate') {
      if (selectedSchema !== 'default') {
        args.push('-s', selectedSchema);
      }
      args.push('--repair');
    } else if (command === 'repair') {
      args.push('-o', config.outputDirs?.yaml || 'out/repaired');
    }
    
    // Add config file if custom settings exist
    const userConfigPath = await window.electronAPI.getAppInfo().then(info => 
      `${info.paths.userData}/marker-tool.config.json`
    );
    args.push('-c', userConfigPath);
    
    const result = await window.electronAPI.executeCLI(command, args);
    
    // Parse results and update file statuses
    const updatedFiles = files.map(file => ({
      ...file,
      status: 'success'
    }));
    
    setFiles(updatedFiles);
    setResults(updatedFiles);
  };

  const updateFileStatus = (fileId, status, message) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, status, message }
        : file
    ));
    setResults(prev => [...prev, files.find(f => f.id === fileId)]);
  };

  const handleProcessingError = (error) => {
    const updatedFiles = files.map(file => ({
      ...file,
      status: 'error',
      error: error.message
    }));
    
    setFiles(updatedFiles);
    setResults(updatedFiles);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1>🎯 Marker Validator & Converter</h1>
            <p>Validate, convert, and repair YAML/JSON marker files</p>
          </div>
          <button 
            className="settings-button"
            onClick={() => setSettingsOpen(true)}
            title="Settings"
          >
            ⚙️
          </button>
        </div>
      </header>
      
      <main className="app-main">
        <section className="input-section">
          <DropZone onFilesAdded={handleFilesAdded} />
          
          {files.length > 0 && (
            <FileList 
              files={files} 
              onRemoveFile={handleRemoveFile}
              processing={processing}
            />
          )}
        </section>
        
        <ActionBar
          fileCount={files.length}
          command={command}
          onCommandChange={setCommand}
          onProcess={handleProcess}
          onClear={handleClearAll}
          processing={processing}
          interactiveMode={interactiveMode}
          onInteractiveModeChange={setInteractiveMode}
          showInteractiveOption={command === 'repair'}
          selectedSchema={selectedSchema}
          onSchemaChange={setSelectedSchema}
          availableSchemas={Object.keys(config.schemas || {})}
        />
        
        {results.length > 0 && (
          <section className="results-section">
            <h2>Results</h2>
            <ResultsTable results={results} />
          </section>
        )}
      </main>
      
      <footer className="app-footer">
        <p>Powered by Marker Validator CLI v{config.version || '1.0.0'}</p>
      </footer>
      
      {repairPreview && (
        <RepairPreview
          file={repairPreview.file}
          repairs={repairPreview.repairs}
          onApply={repairPreview.onApply}
          onCancel={repairPreview.onCancel}
          onClose={repairPreview.onClose}
        />
      )}
      
      <SettingsDialog
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        config={config}
        onSave={handleSaveSettings}
      />
    </div>
  );
}

export default App; 
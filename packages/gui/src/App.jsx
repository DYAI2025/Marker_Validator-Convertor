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
    loadConfig();
  }, []);

  const loadConfig = async () => {
    // Web-basierte Konfiguration
    const defaultConfig = {
      schemas: {
        default: "default",
        fraud: "fraud"
      },
      outputDirs: {
        json: "out/json",
        yaml: "out/yaml",
        backup: "backup"
      },
      processing: {
        maxBatchSize: 100,
        autoRepair: true,
        createBackups: true,
        preserveOriginalOrder: true
      },
      repair: {
        autoFixTypos: true,
        autoFixDates: true,
        autoMigratePrefix: true,
        normalizePatterns: true,
        fallbackAuthor: "auto_import",
        addMigrationMetadata: true
      },
      validation: {
        strictMode: false,
        reportLevel: "error",
        allowAdditionalProperties: true
      },
      export: {
        prettyPrint: true,
        yamlIndent: 2,
        jsonIndent: 2,
        sortKeys: false
      },
      plugins: {
        enabled: true,
        directory: "../plugins",
        autoLoad: ["kimi-suggest-plugin.js", "timestamp-plugin.js"]
      }
    };
    setConfig(defaultConfig);
  };

  const handleSaveSettings = async (newSettings) => {
    setConfig(newSettings);
    // In einer Web-Version würden wir hier localStorage verwenden
    localStorage.setItem('marker-validator-config', JSON.stringify(newSettings));
  };

  const handleFilesAdded = (newFiles) => {
    const fileObjects = newFiles.map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      name: file.name,
      path: file.name, // In Web-Version verwenden wir den Namen
      size: file.size,
      type: file.type,
      status: 'pending',
      file: file // Das eigentliche File-Objekt
    }));
    setFiles(prev => [...prev, ...fileObjects]);
  };

  const handleRemoveFile = (fileId) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleClearAll = () => {
    setFiles([]);
    setResults([]);
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    
    if (command === 'repair' && interactiveMode) {
      await handleInteractiveRepair();
    } else {
      await processFiles(files);
    }
  };

  const handleInteractiveRepair = async () => {
    setProcessing(true);
    const processedFiles = [];
    
    for (const file of files) {
      try {
        // Simuliere Repair-Preview für Web-Version
        const content = await file.file.text();
        const repairs = [
          { type: 'typo', description: 'Fix typo in field name', selected: true },
          { type: 'prefix', description: 'Migrate ID prefix', selected: true }
        ];
        
        setRepairPreview({
          file: file,
          repairs: repairs,
          original: content,
          modified: content.replace('test', 'TEST') // Simulierte Änderung
        });
        
        // Warte auf Benutzer-Interaktion
        await new Promise(resolve => {
          window.handleRepairApply = (repairedData) => {
            processedFiles.push({ ...file, status: 'success', data: repairedData });
            resolve();
          };
        });
      } catch (error) {
        processedFiles.push({ ...file, status: 'error', error: error.message });
      }
    }
    
    setResults(processedFiles);
    setProcessing(false);
  };

  const applyRepairs = async (file, repairedData) => {
    // In Web-Version: Download der reparierten Datei
    const blob = new Blob([repairedData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `repaired_${file.name}`;
    a.click();
    URL.revokeObjectURL(url);
    
    setRepairPreview(null);
    window.handleRepairApply(repairedData);
  };

  const processFiles = async (filesToProcess) => {
    setProcessing(true);
    const processedResults = [];
    
    for (const file of filesToProcess) {
      try {
        const content = await file.file.text();
        
        // Simuliere Verarbeitung für Web-Version
        const result = {
          file: file.name,
          type: file.type,
          status: 'success',
          details: `Processed ${file.name} successfully`
        };
        
        processedResults.push(result);
        
        // Simuliere Download der verarbeiteten Datei
        if (command === 'convert') {
          const blob = new Blob([content], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `converted_${file.name}`;
          a.click();
          URL.revokeObjectURL(url);
        }
      } catch (error) {
        processedResults.push({
          file: file.name,
          type: file.type,
          status: 'error',
          details: error.message
        });
      }
    }
    
    setResults(processedResults);
    setProcessing(false);
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
          >⚙️</button>
        </div>
      </header>
      <main className="app-main">
        <section className="input-section">
          <DropZone onFilesAdded={handleFilesAdded} />
          <FileList 
            files={files} 
            onRemoveFile={handleRemoveFile} 
            processing={processing} 
          />
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
        <p>Marker Validator & Converter Tool v1.0.0</p>
      </footer>
      {repairPreview && (
        <RepairPreview
          file={repairPreview.file}
          repairs={repairPreview.repairs}
          onApply={(repairedData) => applyRepairs(repairPreview.file, repairedData)}
          onCancel={() => setRepairPreview(null)}
          onClose={() => setRepairPreview(null)}
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
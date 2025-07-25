import React, { useState, useEffect } from 'react';
import '../styles/SettingsDialog.css';

function SettingsDialog({ isOpen, onClose, config, onSave }) {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    schemas: { ...config.schemas },
    outputDirs: { ...config.outputDirs },
    processing: { ...config.processing },
    repair: { ...config.repair },
    validation: { ...config.validation },
    export: { ...config.export }
  });
  const [customSchemas, setCustomSchemas] = useState([]);

  useEffect(() => {
    if (config) {
      setSettings({
        schemas: { ...config.schemas },
        outputDirs: { ...config.outputDirs },
        processing: { ...config.processing },
        repair: { ...config.repair },
        validation: { ...config.validation },
        export: { ...config.export }
      });
    }
  }, [config]);

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const handleReset = () => {
    setSettings({
      schemas: { ...config.schemas },
      outputDirs: { ...config.outputDirs },
      processing: { ...config.processing },
      repair: { ...config.repair },
      validation: { ...config.validation },
      export: { ...config.export }
    });
  };

  const handleAddSchema = async () => {
    const files = await window.electronAPI.openFiles();
    if (files.length > 0) {
      const schemaName = prompt('Enter a name for this schema:');
      if (schemaName) {
        setCustomSchemas([...customSchemas, { name: schemaName, path: files[0] }]);
        setSettings(prev => ({
          ...prev,
          schemas: {
            ...prev.schemas,
            [schemaName]: files[0]
          }
        }));
      }
    }
  };

  const handleBrowsePath = async (pathKey) => {
    const result = await window.electronAPI.selectFolder();
    if (result) {
      setSettings(prev => ({
        ...prev,
        outputDirs: {
          ...prev.outputDirs,
          [pathKey]: result
        }
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay">
      <div className="settings-dialog">
        <div className="settings-header">
          <h2>⚙️ Settings</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="settings-tabs">
          <button 
            className={`tab ${activeTab === 'general' ? 'tab--active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button 
            className={`tab ${activeTab === 'schemas' ? 'tab--active' : ''}`}
            onClick={() => setActiveTab('schemas')}
          >
            Schemas
          </button>
          <button 
            className={`tab ${activeTab === 'repair' ? 'tab--active' : ''}`}
            onClick={() => setActiveTab('repair')}
          >
            Repair
          </button>
          <button 
            className={`tab ${activeTab === 'export' ? 'tab--active' : ''}`}
            onClick={() => setActiveTab('export')}
          >
            Export
          </button>
          <button 
            className={`tab ${activeTab === 'plugins' ? 'tab--active' : ''}`}
            onClick={() => setActiveTab('plugins')}
          >
            Plugins
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'general' && (
            <div className="settings-section">
              <h3>Output Directories</h3>
              
              <div className="setting-item">
                <label>JSON Output Directory</label>
                <div className="path-input">
                  <input
                    type="text"
                    value={settings.outputDirs.json}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      outputDirs: { ...prev.outputDirs, json: e.target.value }
                    }))}
                  />
                  <button onClick={() => handleBrowsePath('json')}>Browse</button>
                </div>
              </div>

              <div className="setting-item">
                <label>YAML Output Directory</label>
                <div className="path-input">
                  <input
                    type="text"
                    value={settings.outputDirs.yaml}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      outputDirs: { ...prev.outputDirs, yaml: e.target.value }
                    }))}
                  />
                  <button onClick={() => handleBrowsePath('yaml')}>Browse</button>
                </div>
              </div>

              <div className="setting-item">
                <label>Backup Directory</label>
                <div className="path-input">
                  <input
                    type="text"
                    value={settings.outputDirs.backup}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      outputDirs: { ...prev.outputDirs, backup: e.target.value }
                    }))}
                  />
                  <button onClick={() => handleBrowsePath('backup')}>Browse</button>
                </div>
              </div>

              <h3>Processing Options</h3>
              
              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.processing.createBackups}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      processing: { ...prev.processing, createBackups: e.target.checked }
                    }))}
                  />
                  Create Backups
                </label>
              </div>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.processing.preserveOriginalOrder}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      processing: { ...prev.processing, preserveOriginalOrder: e.target.checked }
                    }))}
                  />
                  Preserve Original Field Order
                </label>
              </div>

              <div className="setting-item">
                <label>Max Batch Size</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={settings.processing.maxBatchSize}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    processing: { ...prev.processing, maxBatchSize: parseInt(e.target.value) }
                  }))}
                />
              </div>
            </div>
          )}

          {activeTab === 'schemas' && (
            <div className="settings-section">
              <h3>Available Schemas</h3>
              
              <div className="schema-list">
                {Object.entries(settings.schemas).map(([name, path]) => (
                  <div key={name} className="schema-item">
                    <span className="schema-name">{name}</span>
                    <span className="schema-path">{path}</span>
                    {name !== 'default' && name !== 'fraud' && (
                      <button 
                        className="remove-button"
                        onClick={() => {
                          const newSchemas = { ...settings.schemas };
                          delete newSchemas[name];
                          setSettings(prev => ({ ...prev, schemas: newSchemas }));
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button className="add-schema-button" onClick={handleAddSchema}>
                + Add Custom Schema
              </button>

              <div className="info-box">
                <p>💡 Custom schemas must follow the marker.schema.v2.json format</p>
              </div>
            </div>
          )}

          {activeTab === 'repair' && (
            <div className="settings-section">
              <h3>Auto-Repair Options</h3>
              
              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.repair.autoFixTypos}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      repair: { ...prev.repair, autoFixTypos: e.target.checked }
                    }))}
                  />
                  Auto-fix Field Name Typos
                </label>
              </div>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.repair.autoFixDates}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      repair: { ...prev.repair, autoFixDates: e.target.checked }
                    }))}
                  />
                  Normalize Date Formats
                </label>
              </div>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.repair.autoMigratePrefix}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      repair: { ...prev.repair, autoMigratePrefix: e.target.checked }
                    }))}
                  />
                  Auto-migrate ID Prefixes
                </label>
              </div>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.repair.normalizePatterns}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      repair: { ...prev.repair, normalizePatterns: e.target.checked }
                    }))}
                  />
                  Normalize Pattern Fields
                </label>
              </div>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.repair.addMigrationMetadata}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      repair: { ...prev.repair, addMigrationMetadata: e.target.checked }
                    }))}
                  />
                  Add Migration Metadata
                </label>
              </div>

              <div className="setting-item">
                <label>Fallback Author</label>
                <input
                  type="text"
                  value={settings.repair.fallbackAuthor}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    repair: { ...prev.repair, fallbackAuthor: e.target.value }
                  }))}
                />
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="settings-section">
              <h3>Export Options</h3>
              
              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.export.prettyPrint}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      export: { ...prev.export, prettyPrint: e.target.checked }
                    }))}
                  />
                  Pretty Print Output
                </label>
              </div>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.export.sortKeys}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      export: { ...prev.export, sortKeys: e.target.checked }
                    }))}
                  />
                  Sort Object Keys
                </label>
              </div>

              <div className="setting-item">
                <label>YAML Indent</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={settings.export.yamlIndent}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    export: { ...prev.export, yamlIndent: parseInt(e.target.value) }
                  }))}
                />
              </div>

              <div className="setting-item">
                <label>JSON Indent</label>
                <input
                  type="number"
                  min="0"
                  max="8"
                  value={settings.export.jsonIndent}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    export: { ...prev.export, jsonIndent: parseInt(e.target.value) }
                  }))}
                />
              </div>
            </div>
          )}
          
          {activeTab === 'plugins' && (
            <div className="settings-section">
              <h3>Plugin System</h3>
              
              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.plugins?.enabled !== false}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      plugins: { ...prev.plugins, enabled: e.target.checked }
                    }))}
                  />
                  Enable Plugins
                </label>
              </div>

              <div className="setting-item">
                <label>Plugin Directory</label>
                <div className="path-input">
                  <input
                    type="text"
                    value={settings.plugins?.directory || '../plugins'}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      plugins: { ...prev.plugins, directory: e.target.value }
                    }))}
                    disabled={settings.plugins?.enabled === false}
                  />
                  <button 
                    onClick={() => handleBrowsePath('plugins')}
                    disabled={settings.plugins?.enabled === false}
                  >
                    Browse
                  </button>
                </div>
              </div>

              <h3>Available Plugins</h3>
              <div className="plugin-list">
                <div className="plugin-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.plugins?.autoLoad?.includes('kimi-suggest-plugin.js')}
                      onChange={(e) => {
                        const autoLoad = settings.plugins?.autoLoad || [];
                        if (e.target.checked) {
                          setSettings(prev => ({
                            ...prev,
                            plugins: { 
                              ...prev.plugins, 
                              autoLoad: [...autoLoad, 'kimi-suggest-plugin.js']
                            }
                          }));
                        } else {
                          setSettings(prev => ({
                            ...prev,
                            plugins: { 
                              ...prev.plugins, 
                              autoLoad: autoLoad.filter(p => p !== 'kimi-suggest-plugin.js')
                            }
                          }));
                        }
                      }}
                      disabled={settings.plugins?.enabled === false}
                    />
                    <div className="plugin-info">
                      <span className="plugin-name">Kimi Suggest Plugin</span>
                      <span className="plugin-description">Suggests additional tags based on marker content</span>
                    </div>
                  </label>
                </div>

                <div className="plugin-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.plugins?.autoLoad?.includes('timestamp-plugin.js')}
                      onChange={(e) => {
                        const autoLoad = settings.plugins?.autoLoad || [];
                        if (e.target.checked) {
                          setSettings(prev => ({
                            ...prev,
                            plugins: { 
                              ...prev.plugins, 
                              autoLoad: [...autoLoad, 'timestamp-plugin.js']
                            }
                          }));
                        } else {
                          setSettings(prev => ({
                            ...prev,
                            plugins: { 
                              ...prev.plugins, 
                              autoLoad: autoLoad.filter(p => p !== 'timestamp-plugin.js')
                            }
                          }));
                        }
                      }}
                      disabled={settings.plugins?.enabled === false}
                    />
                    <div className="plugin-info">
                      <span className="plugin-name">Timestamp Plugin</span>
                      <span className="plugin-description">Adds processing timestamps to markers</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="info-box">
                <p>💡 Plugins extend the functionality of the marker validator</p>
                <p>Enable plugins to hook into validation, repair, and conversion processes</p>
              </div>
            </div>
          )}
        </div>

        <div className="settings-footer">
          <button className="action-button action-button--secondary" onClick={handleReset}>
            Reset to Defaults
          </button>
          <div className="footer-actions">
            <button className="action-button action-button--secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="action-button action-button--primary" onClick={handleSave}>
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsDialog; 
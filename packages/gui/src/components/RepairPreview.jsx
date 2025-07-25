import React, { useState, useEffect } from 'react';
import DiffViewer from './DiffViewer';
import '../styles/RepairPreview.css';

function RepairPreview({ file, repairs, onApply, onCancel, onClose }) {
  const [selectedRepairs, setSelectedRepairs] = useState({});
  
  useEffect(() => {
    // Initially select all repairs
    if (repairs && repairs.fixes) {
      const initialSelection = {};
      repairs.fixes.forEach((fix, index) => {
        initialSelection[index] = true;
      });
      setSelectedRepairs(initialSelection);
    }
  }, [repairs]);

  const handleToggleRepair = (index) => {
    setSelectedRepairs(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleSelectAll = () => {
    const newSelection = {};
    repairs.fixes.forEach((fix, index) => {
      newSelection[index] = true;
    });
    setSelectedRepairs(newSelection);
  };

  const handleDeselectAll = () => {
    setSelectedRepairs({});
  };

  const handleApply = () => {
    const selectedFixes = repairs.fixes.filter((fix, index) => selectedRepairs[index]);
    onApply(file, selectedFixes);
  };

  const getFixIcon = (type) => {
    switch (type) {
      case 'typo': return '✏️';
      case 'prefix': return '🏷️';
      case 'default': return '➕';
      case 'normalize': return '🔄';
      case 'migrate': return '🚀';
      default: return '🔧';
    }
  };

  const getFixType = (fix) => {
    if (fix.includes('typo') || fix.includes('renamed')) return 'typo';
    if (fix.includes('prefix') || fix.includes('ID')) return 'prefix';
    if (fix.includes('Added default')) return 'default';
    if (fix.includes('Normalized') || fix.includes('Converted')) return 'normalize';
    if (fix.includes('Migrated')) return 'migrate';
    return 'general';
  };

  if (!repairs) return null;

  const selectedCount = Object.values(selectedRepairs).filter(Boolean).length;

  return (
    <div className="repair-preview-overlay">
      <div className="repair-preview">
        <div className="repair-preview-header">
          <h2>🔧 Repair Preview: {file.name}</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="repair-preview-content">
          <div className="repair-info">
            <p className="repair-summary">
              Found {repairs.fixes.length} issues that can be automatically fixed.
              {selectedCount > 0 && ` (${selectedCount} selected)`}
            </p>

            <div className="repair-actions">
              <button className="select-button" onClick={handleSelectAll}>
                Select All
              </button>
              <button className="select-button" onClick={handleDeselectAll}>
                Deselect All
              </button>
            </div>

            <div className="repair-list">
              <h3>Available Fixes:</h3>
              {repairs.fixes.map((fix, index) => {
                const fixType = getFixType(fix);
                return (
                  <label key={index} className={`repair-item repair-item--${fixType}`}>
                    <input
                      type="checkbox"
                      checked={selectedRepairs[index] || false}
                      onChange={() => handleToggleRepair(index)}
                    />
                    <span className="repair-icon">{getFixIcon(fixType)}</span>
                    <span className="repair-description">{fix}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="diff-section">
            <h3>Preview Changes:</h3>
            <DiffViewer
              original={repairs.originalYaml}
              modified={repairs.repairedYaml}
              language="yaml"
            />
          </div>
        </div>

        <div className="repair-preview-footer">
          <button 
            className="action-button action-button--secondary" 
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            className="action-button action-button--primary"
            onClick={handleApply}
            disabled={selectedCount === 0}
          >
            Apply {selectedCount} {selectedCount === 1 ? 'Fix' : 'Fixes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RepairPreview; 
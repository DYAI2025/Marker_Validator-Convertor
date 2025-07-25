import React from 'react';
import '../styles/ActionBar.css';

function ActionBar({ 
  fileCount, 
  command, 
  onCommandChange, 
  onProcess, 
  onClear, 
  processing,
  interactiveMode,
  onInteractiveModeChange,
  showInteractiveOption,
  selectedSchema,
  onSchemaChange,
  availableSchemas
}) {
  return (
    <div className="action-bar">
      <div className="action-bar-left">
        <label htmlFor="command-select">Command:</label>
        <select
          id="command-select"
          value={command}
          onChange={(e) => onCommandChange(e.target.value)}
          disabled={processing}
          className="command-select"
        >
          <option value="convert">Convert</option>
          <option value="validate">Validate</option>
          <option value="repair">Repair</option>
        </select>
        
        {(command === 'convert' || command === 'validate') && availableSchemas && availableSchemas.length > 0 && (
          <>
            <label htmlFor="schema-select">Schema:</label>
            <select
              id="schema-select"
              value={selectedSchema}
              onChange={(e) => onSchemaChange(e.target.value)}
              disabled={processing}
              className="schema-select"
            >
              {availableSchemas.map(schema => (
                <option key={schema} value={schema}>
                  {schema.charAt(0).toUpperCase() + schema.slice(1)}
                </option>
              ))}
            </select>
          </>
        )}
        
        {showInteractiveOption && (
          <label className="interactive-toggle">
            <input
              type="checkbox"
              checked={interactiveMode}
              onChange={(e) => onInteractiveModeChange(e.target.checked)}
              disabled={processing}
            />
            Interactive Mode
          </label>
        )}
        
        <span className="file-count">
          {fileCount} {fileCount === 1 ? 'file' : 'files'} selected
        </span>
      </div>
      
      <div className="action-bar-right">
        <button
          className="action-button action-button--secondary"
          onClick={onClear}
          disabled={processing || fileCount === 0}
        >
          Clear All
        </button>
        
        <button
          className="action-button action-button--primary"
          onClick={onProcess}
          disabled={processing || fileCount === 0}
        >
          {processing ? 'Processing...' : `${command} Files`}
        </button>
      </div>
    </div>
  );
}

export default ActionBar; 
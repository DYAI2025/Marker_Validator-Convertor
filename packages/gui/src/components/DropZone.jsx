import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import '../styles/DropZone.css';

function DropZone({ onFilesAdded }) {
  const onDrop = useCallback((acceptedFiles) => {
    // Filter für YAML und JSON Dateien
    const validFiles = acceptedFiles.filter(file => {
      const extension = file.name.toLowerCase();
      return extension.endsWith('.yaml') || 
             extension.endsWith('.yml') || 
             extension.endsWith('.json');
    });
    
    if (validFiles.length > 0) {
      onFilesAdded(validFiles);
    }
  }, [onFilesAdded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/yaml': ['.yaml', '.yml'],
      'application/json': ['.json']
    },
    multiple: true
  });

  const handleBrowse = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.yaml,.yml,.json';
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      onFilesAdded(files);
    };
    input.click();
  };

  return (
    <div className="dropzone-container">
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'dropzone--active' : ''}`}>
        <input {...getInputProps()} />
        <div className="dropzone-content">
          <div className="dropzone-icon">📁</div>
          <div className="dropzone-text">
            {isDragActive ? 'Drop files here...' : 'Drag & drop YAML/JSON files here'}
          </div>
          <div className="dropzone-hint">or</div>
          <button type="button" className="dropzone-button" onClick={handleBrowse}>
            Browse Files
          </button>
        </div>
      </div>
    </div>
  );
}

export default DropZone; 
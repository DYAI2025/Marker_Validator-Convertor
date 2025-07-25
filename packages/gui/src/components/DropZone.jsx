import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import '../styles/DropZone.css';

function DropZone({ onFilesAdded }) {
  const onDrop = useCallback(async (acceptedFiles) => {
    // For Electron, we need full paths
    const filePaths = acceptedFiles.map(file => file.path);
    onFilesAdded(filePaths);
  }, [onFilesAdded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/x-yaml': ['.yaml', '.yml'],
      'application/json': ['.json']
    },
    multiple: true
  });

  const handleBrowse = async () => {
    const files = await window.electronAPI.openFiles();
    if (files.length > 0) {
      onFilesAdded(files);
    }
  };

  return (
    <div 
      {...getRootProps()} 
      className={`dropzone ${isDragActive ? 'dropzone--active' : ''}`}
    >
      <input {...getInputProps()} />
      <div className="dropzone-content">
        <div className="dropzone-icon">📁</div>
        <p className="dropzone-text">
          {isDragActive
            ? 'Drop the files here...'
            : 'Drag & drop marker files here'}
        </p>
        <p className="dropzone-hint">
          Supports .yaml, .yml, and .json files
        </p>
        <button 
          className="dropzone-button"
          onClick={(e) => {
            e.stopPropagation();
            handleBrowse();
          }}
        >
          Browse Files
        </button>
      </div>
    </div>
  );
}

export default DropZone; 
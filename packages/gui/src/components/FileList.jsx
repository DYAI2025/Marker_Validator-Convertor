import React from 'react';
import '../styles/FileList.css';

function FileList({ files, onRemoveFile, processing }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'processing':
        return '⏳';
      default:
        return '📄';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="file-list">
      <h3>Selected Files ({files.length})</h3>
      <div className="file-list-header">
        <span>File</span>
        <span>Type</span>
        <span>Size</span>
        <span>Status</span>
        <span>Actions</span>
      </div>
      <div className="file-list-items">
        {files.map(file => (
          <div key={file.id} className={`file-item file-item--${file.status}`}>
            <span className="file-name" title={file.path}>
              {getStatusIcon(file.status)} {file.name}
            </span>
            <span className="file-type">{file.type.toUpperCase()}</span>
            <span className="file-size">{formatFileSize(file.size)}</span>
            <span className="file-status">
              {file.status === 'error' && file.error ? (
                <span title={file.error}>Error</span>
              ) : (
                file.status
              )}
            </span>
            <span className="file-actions">
              <button
                className="remove-button"
                onClick={() => onRemoveFile(file.id)}
                disabled={processing}
                title="Remove file"
              >
                ✕
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FileList; 
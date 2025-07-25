import React from 'react';
import '../styles/ResultsTable.css';

function ResultsTable({ results }) {
  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  return (
    <div className="results-table">
      <div className="results-summary">
        <span className="summary-item summary-item--success">
          ✅ Success: {successCount}
        </span>
        <span className="summary-item summary-item--error">
          ❌ Errors: {errorCount}
        </span>
        <span className="summary-item">
          Total: {results.length}
        </span>
      </div>
      
      <table className="results-data">
        <thead>
          <tr>
            <th>File</th>
            <th>Type</th>
            <th>Status</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {results.map(result => (
            <tr key={result.id} className={`result-row result-row--${result.status}`}>
              <td className="result-file">{result.name}</td>
              <td className="result-type">{result.type.toUpperCase()}</td>
              <td className="result-status">
                {result.status === 'success' ? '✅ Success' : '❌ Error'}
              </td>
              <td className="result-details">
                {result.error || 'Processed successfully'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ResultsTable; 
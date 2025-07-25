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
            <th>Input File</th>
            <th>Type</th>
            <th>Status</th>
            <th>Output File</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => (
            <tr key={index} className={`result-row result-row--${result.status}`}>
              <td className="result-file">{result.file}</td>
              <td className="result-type">{result.type.toUpperCase()}</td>
              <td className="result-status">
                {result.status === 'success' ? '✅ Success' : '❌ Error'}
              </td>
              <td className="result-output">
                {result.status === 'success' && result.outputFile ? (
                  <span className="output-filename">{result.outputFile}</span>
                ) : (
                  <span className="no-output">-</span>
                )}
              </td>
              <td className="result-details">
                {result.status === 'success' ? result.details : result.details}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ResultsTable; 
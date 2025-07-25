import React, { useMemo } from 'react';
import { diffLines } from 'diff';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-yaml';
import '../styles/DiffViewer.css';

function DiffViewer({ original, modified, language = 'yaml' }) {
  const diffResult = useMemo(() => {
    if (!original || !modified) return [];
    return diffLines(original, modified);
  }, [original, modified]);

  const renderLine = (line, type) => {
    const highlighted = Prism.highlight(line, Prism.languages[language] || Prism.languages.plain, language);
    return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
  };

  return (
    <div className="diff-viewer">
      <div className="diff-panel diff-panel--before">
        <div className="diff-panel-header">
          <span className="diff-panel-title">Before</span>
          <span className="diff-panel-badge diff-panel-badge--original">Original</span>
        </div>
        <pre className="diff-content">
          <code>
            {diffResult.map((part, index) => {
              if (part.removed || !part.added) {
                return (
                  <div
                    key={index}
                    className={`diff-line ${part.removed ? 'diff-line--removed' : ''}`}
                  >
                    <span className="diff-line-number">{index + 1}</span>
                    <span className="diff-line-content">
                      {renderLine(part.value.trimEnd(), language)}
                    </span>
                  </div>
                );
              }
              return null;
            })}
          </code>
        </pre>
      </div>

      <div className="diff-panel diff-panel--after">
        <div className="diff-panel-header">
          <span className="diff-panel-title">After</span>
          <span className="diff-panel-badge diff-panel-badge--modified">Repaired</span>
        </div>
        <pre className="diff-content">
          <code>
            {diffResult.map((part, index) => {
              if (part.added || !part.removed) {
                return (
                  <div
                    key={index}
                    className={`diff-line ${part.added ? 'diff-line--added' : ''}`}
                  >
                    <span className="diff-line-number">{index + 1}</span>
                    <span className="diff-line-content">
                      {renderLine(part.value.trimEnd(), language)}
                    </span>
                  </div>
                );
              }
              return null;
            })}
          </code>
        </pre>
      </div>
    </div>
  );
}

export default DiffViewer; 
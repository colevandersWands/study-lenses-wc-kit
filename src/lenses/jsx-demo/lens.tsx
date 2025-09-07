/**
 * JSX Demo Lens Function
 * Demonstrates JSX/Preact component rendering in lenses
 */

import type { Snippet, LensOutput } from '../../types.js';
import _config from './config.js';

/**
 * Creates a JSX component that displays code analysis
 */
export const lens = async (snippet: Snippet, config = _config()): Promise<LensOutput> => {
  const lines = snippet.code.split('\n');
  const wordCount = snippet.code.split(/\s+/).filter((word) => word.length > 0).length;
  const charCount = snippet.code.length;

  return {
    snippet, // Pass through unchanged
    ui: (
      <div
        style={{
          padding: '16px',
          border: '2px solid #007acc',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <h3
          style={{
            margin: '0 0 12px 0',
            color: '#007acc',
            fontSize: '18px',
          }}
        >
          📊 JSX Code Analysis
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              padding: '8px',
              backgroundColor: '#fff',
              borderRadius: '4px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
              {lines.length}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Lines</div>
          </div>

          <div
            style={{
              padding: '8px',
              backgroundColor: '#fff',
              borderRadius: '4px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
              {wordCount}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Words</div>
          </div>

          <div
            style={{
              padding: '8px',
              backgroundColor: '#fff',
              borderRadius: '4px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
              {charCount}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Characters</div>
          </div>
        </div>

        <details style={{ marginBottom: '12px' }}>
          <summary
            style={{
              cursor: 'pointer',
              fontWeight: 'bold',
              marginBottom: '8px',
            }}
          >
            📝 Code Preview
          </summary>
          <pre
            style={{
              backgroundColor: '#fff',
              padding: '12px',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '14px',
              margin: '0',
            }}
          >
            {snippet.code}
          </pre>
        </details>

        <div
          style={{
            fontSize: '12px',
            color: '#666',
            fontStyle: 'italic',
          }}
        >
          Language: {snippet.lang} | Test mode: {snippet.test ? 'ON' : 'OFF'}
        </div>
      </div>
    ),
  };
};

// Default export for convenience
export default lens;

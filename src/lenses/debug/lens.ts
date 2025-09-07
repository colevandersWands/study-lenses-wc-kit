/**
 * Debug Lens Function
 * Transform lens that wraps code with language-appropriate debugger statements
 */

import type { Snippet, LensOutput } from '../../types.js';
import _config from './config.js';

interface DebugConfig {
  enabled?: boolean;
  customPrefix?: string;
  customSuffix?: string;
  lineSpacing?: number;
}

/**
 * Wrap code with language-appropriate debugger statements
 * @param code - The code to wrap
 * @param lang - The programming language
 * @param config - Configuration options
 * @returns Wrapped code with debugger statements
 */
const wrapWithDebugger = (code: string, lang: string, config: DebugConfig): string => {
  const spacing = '\n'.repeat(config.lineSpacing || 3);
  
  // Handle custom prefix/suffix if provided
  if (config.customPrefix && config.customSuffix) {
    return `${config.customPrefix}${spacing}${code}${spacing}${config.customSuffix}`;
  }
  
  switch (lang.toLowerCase()) {
    case 'js':
    case 'mjs':
    case 'javascript':
    case 'ts':
    case 'tsx':
    case 'typescript':
      return `/* ----------------------------- */   debugger;${spacing}${code}${spacing}/* ----------------------------- */   debugger;`;
    
    case 'py':
    case 'python':
      return `# ----------------------------- #   \nimport pdb; pdb.set_trace()${spacing}${code}${spacing}# ----------------------------- #   \nimport pdb; pdb.set_trace()`;
    
    case 'java':
      return `/* ----------------------------- */\n// Add breakpoint here${spacing}${code}${spacing}/* ----------------------------- */\n// Add breakpoint here`;
    
    case 'c':
    case 'cpp':
    case 'cc':
    case 'cxx':
      return `/* ----------------------------- */\n// Add breakpoint here${spacing}${code}${spacing}/* ----------------------------- */\n// Add breakpoint here`;
    
    case 'go':
    case 'golang':
      return `/* ----------------------------- */\n// Add breakpoint here${spacing}${code}${spacing}/* ----------------------------- */\n// Add breakpoint here`;
    
    case 'rust':
    case 'rs':
      return `/* ----------------------------- */\n// Add breakpoint here${spacing}${code}${spacing}/* ----------------------------- */\n// Add breakpoint here`;
    
    case 'ruby':
    case 'rb':
      return `# ----------------------------- #\n# Add breakpoint here${spacing}${code}${spacing}# ----------------------------- #\n# Add breakpoint here`;
    
    default:
      // Default to JavaScript-style for unknown languages
      return `/* ----------------------------- */   debugger;${spacing}${code}${spacing}/* ----------------------------- */   debugger;`;
  }
};

/**
 * Debugger lens - wraps code with language-appropriate debugger statements
 * 
 * Features:
 * - Auto-detects programming language from snippet.lang
 * - Supports JavaScript, TypeScript, Python, Java, C/C++, Go, Rust, Ruby
 * - Configurable line spacing and enable/disable
 * - Falls back to JavaScript-style for unknown languages
 * 
 * @param snippet - Code snippet with content, language, and metadata
 * @param config - Debugger configuration options
 * @returns Lens output with wrapped code and null ui (transform-only lens)
 */
export const lens = (snippet: Snippet, config = _config()): LensOutput => {
  if (!config.enabled) {
    return {
      snippet,
      ui: null,
    };
  }

  const wrappedCode = wrapWithDebugger(snippet.code, snippet.lang, config);

  return {
    snippet: {
      ...snippet,
      code: wrappedCode,
    },
    ui: null,
  };
};

export default lens;
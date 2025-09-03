/**
 * Snippet Lens Function
 * Converts path or code into snippet object with metadata
 *
 * TODO: This is currently a STUB implementation that doesn't actually load files.
 * Real file loading with fetch() or fs integration needed for production use.
 * Current version only demonstrates the API contract and does basic language detection.
 */

import type { Snippet } from '../types.js';

export interface SnippetOptions {
  lang?: string;
  test?: boolean;
}

/**
 * Convert path or code into a snippet object
 * Shared signature with snippet.view
 *
 * @param pathOrCode - File path to load or inline code
 * @param options - Override lang/test detection
 * @returns Promise<Snippet> with code, lang, test
 */
export const parse = async (pathOrCode: string, options: SnippetOptions = {}): Promise<Snippet> => {
  // Stub implementation - just create basic snippet
  // TODO: Add real file loading and language detection

  const isFilePath =
    pathOrCode.includes('/') || pathOrCode.includes('\\') || pathOrCode.includes('.');

  if (isFilePath) {
    // Stub: simulate file loading
    console.warn(`[STUB] Would load file: ${pathOrCode}`);

    // Extract language from extension
    const ext = pathOrCode.split('.').pop()?.toLowerCase();
    const detectedLang = detectLanguageFromExtension(ext || '');
    const detectedTest = pathOrCode.includes('.test.') || pathOrCode.includes('.spec.');

    return {
      code: `// Stub content for ${pathOrCode}\nconsole.log('File loaded!');`,
      lang: options.lang || detectedLang,
      test: options.test !== undefined ? options.test : detectedTest,
    };
  } else {
    // Inline code
    return {
      code: pathOrCode,
      lang: options.lang || 'js',
      test: options.test || false,
    };
  }
};

/**
 * Detect language from file extension
 */
function detectLanguageFromExtension(ext: string): string {
  const langMap: Record<string, string> = {
    js: 'js',
    mjs: 'js',
    ts: 'js',
    jsx: 'js',
    tsx: 'js',
    py: 'python',
    rb: 'ruby',
    go: 'go',
    rs: 'rust',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    cs: 'csharp',
  };

  return langMap[ext] || 'js';
}

// Default export for convenience
export default parse;

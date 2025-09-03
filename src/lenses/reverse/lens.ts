/**
 * Reverse Lens Function
 * Pure function that reverses code
 */

import type { Snippet, LensOutput } from '../../types.js';
import _config from './config.js';

/**
 * Reverses the code string character by character
 */
export const lens = (snippet: Snippet, config = _config()): LensOutput => ({
  snippet: {
    ...snippet,
    code: snippet.code.split('').reverse().join(''),
  },
  view: null,
});

// Default export for convenience
export default lens;

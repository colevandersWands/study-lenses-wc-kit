/**
 * Loop Guard Lens - Transform lens that prevents infinite loops
 *
 * Injects safety counters into JavaScript loops to prevent browser freezing
 * in educational environments. Supports all 6 JavaScript loop types with
 * configurable protection and optional code formatting.
 */

import type { Snippet, LensOutput } from '../../types.js';
import type { LoopGuardConfig, LoopType } from './config.js';
import _config from './config.js';

// Import loop guard functionality from utils
import { insertLoopGuards } from './utils/ast-transform.js';

/**
 * Loop Guard Lens Function
 *
 * Transforms JavaScript code to include loop guards that prevent infinite loops.
 * Configurable to protect specific loop types and optionally format output.
 */
export const lens = (snippet: Snippet, config: LoopGuardConfig = _config()): LensOutput => {
  try {
    // Insert loop guards based on configuration
    const guardedCode = insertLoopGuards(snippet.code, config);

    return {
      snippet: { ...snippet, code: guardedCode },
      view: null, // Transform lens - no view component
    };
  } catch (error) {
    // Return original snippet on any processing error
    console.warn('Loop guard lens failed:', error);
    return { snippet, view: null };
  }
};

export default lens;

/**
 * Lowercase Lens Function
 * Pure function that converts code to lowercase
 */

import type { Snippet, LensOutput } from '../../types.js';
import _config from './config.js';

/**
 * Converts the code string to lowercase
 */
export const lens = (snippet: Snippet, config = _config()): LensOutput => ({
	snippet: {
		...snippet,
		code: snippet.code.toLowerCase(),
	},
	ui: null,
});

// Default export for convenience
export default lens;

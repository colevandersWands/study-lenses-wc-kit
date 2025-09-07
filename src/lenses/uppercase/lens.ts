/**
 * Uppercase Lens Function
 * Pure function that converts code to uppercase
 */

import type { Snippet, LensOutput } from '../../types.js';
import _config from './config.js';

/**
 * Converts the code string to uppercase
 */
export const lens = (snippet: Snippet, config = _config()): LensOutput => ({
	snippet: {
		...snippet,
		code: snippet.code.toUpperCase(),
	},
	ui: null,
});

// Default export for convenience
export default lens;

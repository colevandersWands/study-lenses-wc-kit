/**
 * Format Lens Function
 * Transform lens that formats JavaScript/TypeScript code using Prettier
 */

import type { Snippet, LensOutput } from '../../types.js';
import { formatJavaScript, selectParser, canFormat } from './format-utils.js';
import _config from './config.js';

/**
 * Format lens - transforms code using Prettier with classic tab-based defaults
 *
 * Features:
 * - Automatic parser selection based on snippet.lang (js, mjs, ts, etc.)
 * - Graceful degradation - returns original code with comment on formatting failure
 * - Full Prettier configuration support via config parameter
 * - Self-contained - no external utility dependencies
 *
 * @param snippet - Code snippet with content, language, and metadata
 * @param config - Prettier configuration options (uses classic defaults if not provided)
 * @returns Lens output with formatted code and null view (transform-only lens)
 */
export const lens = async (
	snippet: Snippet,
	config = _config()
): Promise<LensOutput> => {
	// Basic validation
	if (!canFormat(snippet.code)) {
		return {
			snippet,
			ui: null,
		};
	}

	// Auto-select parser based on snippet language
	const parser = selectParser(snippet.lang);
	const finalConfig = {
		...config,
		parser, // Override parser based on language detection
	};

	try {
		// Format the code using our self-contained utility
		const formattedCode = await formatJavaScript(snippet.code, finalConfig);

		return {
			snippet: {
				...snippet,
				code: formattedCode,
			},
			ui: null, // Transform-only lens - no visual output
		};
	} catch (error) {
		// This should be rare since formatJavaScript handles its own errors,
		// but we'll catch any unexpected errors here
		const errorMessage =
			error instanceof Error ? error.message : String(error);
		console.error(
			'Format lens: Unexpected error during formatting:',
			errorMessage
		);

		// Return original code with error comment
		return {
			snippet: {
				...snippet,
				code:
					snippet.code +
					'\n// Format lens: Unexpected formatting error occurred',
			},
			ui: null,
		};
	}
};

// Default export for convenience
export default lens;

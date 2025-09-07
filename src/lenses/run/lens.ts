/**
 * Run Lens - Terminal lens that executes code with side effects
 * Supports JavaScript (.js) and ES Modules (.mjs)
 * Returns undefined snippet to signal pipeline termination
 */

import type { Snippet, LensConfig, LensOutput } from '../../types.js';
import { runJavaScript } from './runnings/javascript/index.js';
import { config as _config } from './config.js';

export const lens = async (
	snippet: Snippet,
	config: LensConfig = _config()
): Promise<LensOutput> => {
	try {
		// Language support: js, mjs, javascript
		if (
			snippet.lang !== 'js' &&
			snippet.lang !== 'mjs' &&
			snippet.lang !== 'javascript'
		) {
			console.warn(
				`Run lens: Unsupported language "${snippet.lang}". Only JavaScript (.js, .mjs) supported.`
			);
			return { snippet: undefined, ui: null };
		}

		// Deep merge config with type detection for .mjs files
		const executionConfig = _config({
			...config,
			// .mjs files should run as modules, others as scripts unless specified
			type: snippet.lang === 'mjs' ? 'module' : config.type || 'script',
			test: snippet.test,
		});

		// Execute JavaScript with side effects - no DOM feedback
		await runJavaScript(snippet.code, executionConfig);

		// Terminal behavior - return undefined snippet to end pipeline
		return { snippet: undefined, ui: null };
	} catch (error) {
		console.error('Run lens execution failed:', error);
		// Still terminal behavior even on error
		return { snippet: undefined, ui: null };
	}
};

export default lens;

/**
 * Pure JavaScript execution utility
 * Executes JavaScript code in a sandboxed iframe with optional loop guards and debugging
 */

// TODO this can be dynamic
import './jest-matchers.js';

import { describeIt } from './describe-it/sync.js';
import type { ExecutionConfig } from './types.js';

// =============================================================================
// Constants
// =============================================================================

/**
 * CSS styles for hidden iframe (offscreen positioning)
 */
const IFRAME_HIDDEN_STYLES = `
  position: absolute;
  top: -9999px;
  left: -9999px;
  width: 1px;
  height: 1px;
  border: none;
  visibility: hidden;
  pointer-events: none;
  z-index: -1;
`;

/**
 * Default configuration for JavaScript execution
 */
const DEFAULT_CONFIG: Required<ExecutionConfig> = {
	debug: false,
	type: 'script', // 'script' or 'module'
	test: false,
	loopGuard: {
		active: false,
		max: 100,
	},
	globals: {},
};

// =============================================================================
// Container Setup
// =============================================================================

/**
 * Default container passed to `runJavaScript` as a sandbox container
 */
const runContainer = document.createElement('div');
document.body.appendChild(runContainer);

// =============================================================================
// Core Functions
// =============================================================================

/**
 * Execute JavaScript code in a container element with sandboxed iframe
 */
export async function runJavaScript(
	code: string,
	config: ExecutionConfig = {},
	container: HTMLElement = runContainer
): Promise<void> {
	// Validate inputs
	if (!container) {
		console.warn('No container provided for JavaScript execution');
		return;
	}

	if (!code?.trim()) {
		console.warn('No code to execute');
		return;
	}

	// Clean up container
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}

	// Merge config with defaults
	const finalConfig: Required<ExecutionConfig> = {
		...DEFAULT_CONFIG,
		...config,
		loopGuard: {
			...DEFAULT_CONFIG.loopGuard,
			...config.loopGuard,
		},
		globals: {
			...DEFAULT_CONFIG.globals,
			...config.globals,
		},
	};

	try {
		// Process code with optional modifications
		let finalCode = code;

		// Add debugging breakpoints if enabled
		if (finalConfig.debug) {
			finalCode = `/* ----------------------------- */   debugger;\n\n\n\n${finalCode}\n\n\n/* ----------------------------- */   debugger;`;
		}

		// Create iframe for execution
		const iframe = document.createElement('iframe');
		iframe.style.cssText = IFRAME_HIDDEN_STYLES;

		// Set up iframe load handler
		iframe.onload = () => {
			try {
				const iframeWindow = iframe.contentWindow;
				const iframeDocument = iframe.contentDocument;

				if (!iframeWindow || !iframeDocument) {
					throw new Error(
						'Failed to access iframe window or document'
					);
				}

				// Set up testing framework if enabled
				if (finalConfig.test) {
					try {
						// Get testing framework functions
						const testingGlobals = {
							expect,
							...describeIt(iframeWindow),
						};

						// Merge testing globals with user globals
						finalConfig.globals = Object.assign(
							finalConfig.globals,
							testingGlobals
						);
					} catch (error) {
						console.warn(
							'Failed to set up testing framework:',
							error
						);
					}
				}

				// Add user globals to iframe
				Object.assign(iframeWindow, finalConfig.globals);

				// Set up error handling for testing framework issues
				iframeWindow.addEventListener('error', (event: ErrorEvent) => {
					// Check for common testing framework errors
					if (
						event.message.includes('describe is not defined') ||
						event.message.includes('it is not defined') ||
						event.message.includes('expect is not defined')
					) {
						console.warn(
							`💡 TESTING FRAMEWORK ERROR\n\nIt looks like you're trying to use unit tests (describe, it, expect) but the "Unit Tests" option is not enabled.\n\nTo fix this:\n1. toggle "Unit Tests"\n2. Try running your code again\n\nYour testing functions should then be available!`
						);
					}
					// Note: Removed console.error to avoid spam - errors are handled by the iframe
				});

				// Create and execute script
				const script = document.createElement('script');
				script.innerHTML = finalCode;

				if (finalConfig.type === 'module') {
					script.type = 'module';
				}

				// Execute the script
				iframeDocument.body.appendChild(script);
			} catch (error) {
				console.error('❌ Iframe execution error:', error);
			}
		};

		// Add iframe to container to trigger loading
		container.appendChild(iframe);
	} catch (error) {
		console.error('❌ JavaScript execution setup error:', error);
		throw error;
	}
}

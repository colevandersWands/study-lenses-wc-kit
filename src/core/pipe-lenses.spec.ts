/**
 * Core Pipeline Function Tests
 * Comprehensive tests for sl.core.pipeLenses functionality
 */

import { describe, it, expect } from 'vitest';
import { pipeLenses } from './pipe-lenses.js';
import type {
	Snippet,
	LensOutput,
	LensFunction,
	LensObject,
} from '../types.js';

// Type guard helper for testing
const expectSnippet = (output: LensOutput): Snippet => {
	expect(output.snippet).toBeTruthy();
	expect(typeof output.snippet).toBe('object');
	return output.snippet as Snippet;
};

describe('core pipeLenses function', () => {
	const testSnippet: Snippet = {
		code: 'hello world',
		lang: 'js',
		test: false,
	};

	describe('basic pipeline processing', () => {
		it('should process single transform lens', async () => {
			const uppercaseLens: LensFunction = (snippet) => ({
				snippet: { ...snippet, code: snippet.code.toUpperCase() },
				ui: null,
			});

			const result = await pipeLenses(testSnippet, [uppercaseLens]);

			const snippet = expectSnippet(result);
			expect(snippet.code).toBe('HELLO WORLD');
			expect(snippet.lang).toBe('js');
			expect(snippet.test).toBe(false);
			expect(result.ui).toBeNull();
		});

		it('should process chain of transform lenses', async () => {
			const uppercaseLens: LensFunction = (snippet) => ({
				snippet: { ...snippet, code: snippet.code.toUpperCase() },
				ui: null,
			});

			const reverseLens: LensFunction = (snippet) => ({
				snippet: {
					...snippet,
					code: snippet.code.split('').reverse().join(''),
				},
				ui: null,
			});

			const result = await pipeLenses(testSnippet, [
				uppercaseLens,
				reverseLens,
			]);

			const snippet = expectSnippet(result);
			expect(snippet.code).toBe('DLROW OLLEH');
			expect(result.ui).toBeNull();
		});

		it('should terminate pipeline on visual lens', async () => {
			const transformLens: LensFunction = (snippet) => ({
				snippet: { ...snippet, code: snippet.code.toUpperCase() },
				ui: null,
			});

			const visualLens: LensFunction = (snippet) => {
				const div = document.createElement('div');
				div.textContent = `Visual: ${snippet.code}`;
				return {
					snippet,
					ui: div,
				};
			};

			const neverReachedLens: LensFunction = (snippet) => ({
				snippet: { ...snippet, code: 'NEVER REACHED' },
				ui: null,
			});

			const result = await pipeLenses(testSnippet, [
				transformLens,
				visualLens,
				neverReachedLens,
			]);

			expect(result.snippet).toBeTruthy();
			expect((result.snippet as Snippet).code).toBe('HELLO WORLD');
			expect(result.ui).toBeInstanceOf(HTMLElement);
			expect((result.ui as HTMLElement).textContent).toBe(
				'Visual: HELLO WORLD'
			);
		});

		it('should terminate pipeline on side effect lens', async () => {
			const transformLens: LensFunction = (snippet) => ({
				snippet: { ...snippet, code: snippet.code.toUpperCase() },
				ui: null,
			});

			const sideEffectLens: LensFunction = (snippet) => {
				// Simulate side effect (e.g., save to file, send to API)
				console.log('Side effect executed:', snippet.code);
				return {
					snippet: null, // Indicates side effect completion
					ui: null,
				};
			};

			const neverReachedLens: LensFunction = (snippet) => ({
				snippet: { ...snippet, code: 'NEVER REACHED' },
				ui: null,
			});

			const result = await pipeLenses(testSnippet, [
				transformLens,
				sideEffectLens,
				neverReachedLens,
			]);

			// Should return pre-side-effect snippet
			expect(result.snippet).toBeTruthy();
			expect((result.snippet as Snippet).code).toBe('HELLO WORLD');
			expect(result.ui).toBeNull();
		});
	});

	describe('flexible LensSpec patterns', () => {
		it('should handle simple function pattern', async () => {
			const testLens = (snippet: Snippet) => ({
				snippet: { ...snippet, code: `Function: ${snippet.code}` },
				ui: null,
			});

			const result = await pipeLenses(testSnippet, [testLens]);

			expect(expectSnippet(result).code).toBe('Function: hello world');
		});

		it('should handle lens object pattern', async () => {
			const lensObject: LensObject = {
				name: 'test-lens',
				lens: (snippet) => ({
					snippet: { ...snippet, code: `Object: ${snippet.code}` },
					ui: null,
				}),
				register: () => 'sl-test-lens',
				config: () => ({}),
			};

			const result = await pipeLenses(testSnippet, [lensObject]);

			expect(expectSnippet(result).code).toBe('Object: hello world');
		});

		it('should handle function with config pattern', async () => {
			const configurableLens = (snippet: Snippet, config: any = {}) => ({
				snippet: {
					...snippet,
					code: `${config.prefix || 'Default'}: ${snippet.code}`,
				},
				ui: null,
			});

			const result = await pipeLenses(testSnippet, [
				[configurableLens, { prefix: 'Custom' }],
			]);

			expect(expectSnippet(result).code).toBe('Custom: hello world');
		});

		it('should handle lens object with config override pattern', async () => {
			const defaultConfig = { prefix: 'Default' };

			const lensObject: LensObject = {
				name: 'configurable-lens',
				lens: (snippet, config: any = {}) => ({
					snippet: {
						...snippet,
						code: `${config.prefix}: ${snippet.code}`,
					},
					ui: null,
				}),
				register: () => 'sl-configurable-lens',
				config: (overrides = {}) => ({
					...defaultConfig,
					...overrides,
				}),
			};

			const result = await pipeLenses(testSnippet, [
				[lensObject, { prefix: 'Override' }],
			]);

			expect(expectSnippet(result).code).toBe('Override: hello world');
		});

		it('should handle mixed LensSpec patterns in single pipeline', async () => {
			// Pattern 1: Simple function
			const simpleLens = (snippet: Snippet) => ({
				snippet: { ...snippet, code: `1:${snippet.code}` },
				ui: null,
			});

			// Pattern 2: Lens object
			const lensObject: LensObject = {
				name: 'pattern2',
				lens: (snippet) => ({
					snippet: { ...snippet, code: `2:${snippet.code}` },
					ui: null,
				}),
				register: () => 'sl-pattern2',
				config: () => ({}),
			};

			// Pattern 3: Function with config
			const configLens = (snippet: Snippet, config: any = {}) => ({
				snippet: {
					...snippet,
					code: `${config.number}:${snippet.code}`,
				},
				ui: null,
			});

			const result = await pipeLenses(testSnippet, [
				simpleLens,
				lensObject,
				[configLens, { number: '3' }],
			]);

			expect(expectSnippet(result).code).toBe('3:2:1:hello world');
		});
	});

	describe('async lens support', () => {
		it('should handle async lens functions', async () => {
			const asyncLens: LensFunction = async (snippet) => {
				// Simulate async work
				await new Promise((resolve) => setTimeout(resolve, 10));

				return {
					snippet: { ...snippet, code: `Async: ${snippet.code}` },
					ui: null,
				};
			};

			const result = await pipeLenses(testSnippet, [asyncLens]);

			expect(expectSnippet(result).code).toBe('Async: hello world');
		});

		it('should handle mixed sync and async lenses', async () => {
			const syncLens: LensFunction = (snippet) => ({
				snippet: { ...snippet, code: `Sync: ${snippet.code}` },
				ui: null,
			});

			const asyncLens: LensFunction = async (snippet) => {
				await new Promise((resolve) => setTimeout(resolve, 10));
				return {
					snippet: { ...snippet, code: `Async: ${snippet.code}` },
					ui: null,
				};
			};

			const result = await pipeLenses(testSnippet, [syncLens, asyncLens]);

			expect(expectSnippet(result).code).toBe('Async: Sync: hello world');
		});
	});

	describe('error handling', () => {
		it('should throw descriptive error when lens fails', async () => {
			const failingLens: LensFunction = () => {
				throw new Error('Test error');
			};

			await expect(
				pipeLenses(testSnippet, [failingLens])
			).rejects.toThrow(/Lens.*failed.*Test error/);
		});

		it('should include lens name in error message', async () => {
			const namedLens = function namedTestLens() {
				throw new Error('Named lens error');
			} as LensFunction;

			await expect(pipeLenses(testSnippet, [namedLens])).rejects.toThrow(
				/namedTestLens.*failed/
			);
		});

		it('should stop pipeline on first error', async () => {
			let secondLensCalled = false;

			const failingLens: LensFunction = () => {
				throw new Error('First lens fails');
			};

			const secondLens: LensFunction = (snippet) => {
				secondLensCalled = true;
				return { snippet, ui: null };
			};

			await expect(
				pipeLenses(testSnippet, [failingLens, secondLens])
			).rejects.toThrow();

			expect(secondLensCalled).toBe(false);
		});
	});

	describe('empty and edge cases', () => {
		it('should handle empty lens array', async () => {
			const result = await pipeLenses(testSnippet, []);

			expect(result.snippet).toEqual(testSnippet);
			expect(result.ui).toBeNull();
		});

		it('should handle lens returning undefined snippet', async () => {
			const undefinedLens: LensFunction = () => ({
				snippet: undefined as any,
				ui: null,
			});

			const result = await pipeLenses(testSnippet, [undefinedLens]);

			expect(result.snippet).toEqual(testSnippet);
			expect(result.ui).toBeNull();
		});

		it('should handle lens returning false snippet', async () => {
			const falseLens: LensFunction = () => ({
				snippet: false as any,
				ui: null,
			});

			const result = await pipeLenses(testSnippet, [falseLens]);

			expect(result.snippet).toEqual(testSnippet);
			expect(result.ui).toBeNull();
		});
	});
});

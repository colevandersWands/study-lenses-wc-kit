/**
 * Format Lens Unit Tests
 * Basic tests for the format lens function
 */

import { describe, it, expect } from 'vitest';
import { lens } from './lens.js';
import config from './config.js';
import type { Snippet } from '../../types.js';

// Helper function to assert result has valid snippet
const expectValidSnippet = (result: any): Snippet => {
	expect(result.snippet).toBeTruthy();
	expect(typeof result.snippet).toBe('object');
	expect(typeof (result.snippet as Snippet).code).toBe('string');
	expect(typeof (result.snippet as Snippet).lang).toBe('string');
	expect(typeof (result.snippet as Snippet).test).toBe('boolean');
	return result.snippet as Snippet;
};

describe('format lens', () => {
	const basicSnippet = {
		code: 'const x=1;console.log(x);',
		lang: 'js',
		test: false,
	};

	describe('basic functionality', () => {
		it('should format simple JavaScript code with classic defaults', async () => {
			const result = await lens(basicSnippet, config());
			const snippet = expectValidSnippet(result);

			expect(snippet.code).toContain('const x = 1');
			expect(snippet.code).toContain('console.log(x)');
			expect(snippet.lang).toBe('js');
			expect(snippet.test).toBe(false);
			expect(result.ui).toBeNull();
		});

		it('should return null view (transform-only lens)', async () => {
			const result = await lens(basicSnippet, config());
			expect(result.ui).toBeNull();
		});

		it('should preserve snippet metadata', async () => {
			const testSnippet = {
				code: 'const x=1;',
				lang: 'mjs',
				test: true,
			};

			const result = await lens(testSnippet, config());
			const snippet = expectValidSnippet(result);

			expect(snippet.lang).toBe('mjs');
			expect(snippet.test).toBe(true);
		});
	});

	describe('configuration', () => {
		it('should accept default configuration', async () => {
			const defaultConfig = config();
			expect(defaultConfig.useTabs).toBe(true);
			expect(defaultConfig.singleQuote).toBe(false);
		});

		it('should accept custom configuration', async () => {
			const customConfig = config({
				singleQuote: true,
				useTabs: false,
			});

			expect(customConfig.singleQuote).toBe(true);
			expect(customConfig.useTabs).toBe(false);
		});
	});

	describe('edge cases', () => {
		it('should handle empty code', async () => {
			const emptySnippet = { code: '', lang: 'js', test: false };
			const result = await lens(emptySnippet, config());
			const snippet = expectValidSnippet(result);

			expect(snippet.code).toBe('');
		});

		it('should handle whitespace-only code', async () => {
			const whitespaceSnippet = {
				code: '   \n\t  \n  ',
				lang: 'js',
				test: false,
			};
			const result = await lens(whitespaceSnippet, config());
			const snippet = expectValidSnippet(result);

			expect(snippet.code).toBe('   \n\t  \n  ');
		});
	});
});

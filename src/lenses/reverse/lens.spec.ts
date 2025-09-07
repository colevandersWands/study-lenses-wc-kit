/**
 * Unit tests for reverse lens function
 * Tests basic code transformation functionality
 */

import { describe, it, expect } from 'vitest';
import { lens } from './lens.js';
import config from './config.js';
import type { Snippet, LensOutput } from '../../types.js';

// Type guard helper for testing
const expectSnippet = (output: LensOutput): Snippet => {
	expect(output.snippet).toBeTruthy();
	expect(typeof output.snippet).toBe('object');
	return output.snippet as Snippet;
};

describe('reverse lens', () => {
	const testSnippet = {
		code: 'function test() { return 42; }',
		lang: 'js',
		test: false,
	};

	it('should reverse code string character by character', () => {
		const result = lens(testSnippet, config());

		expect(expectSnippet(result).code).toBe(
			'} ;24 nruter { )(tset noitcnuf'
		);
		expect(expectSnippet(result).lang).toBe('js');
		expect(expectSnippet(result).test).toBe(false);
		expect(result.ui).toBeNull(); // Transform lens
	});

	it('should handle empty code', () => {
		const emptySnippet = { code: '', lang: 'js', test: false };
		const result = lens(emptySnippet, config());

		expect(expectSnippet(result).code).toBe('');
		expect(result.ui).toBeNull();
	});

	it('should handle single character', () => {
		const singleChar = { code: 'x', lang: 'js', test: false };
		const result = lens(singleChar, config());

		expect(expectSnippet(result).code).toBe('x');
		expect(result.ui).toBeNull();
	});

	it('should preserve snippet metadata', () => {
		const testSnippet = { code: 'hello', lang: 'python', test: true };
		const result = lens(testSnippet, config());

		expect(expectSnippet(result).code).toBe('olleh');
		expect(expectSnippet(result).lang).toBe('python');
		expect(expectSnippet(result).test).toBe(true);
	});

	it('should work with special characters', () => {
		const specialChars = { code: 'a!@#$%^&*()z', lang: 'js', test: false };
		const result = lens(specialChars, config());

		expect(expectSnippet(result).code).toBe('z)(*&^%$#@!a');
	});

	it('should work with multiline code', () => {
		const multiline = {
			code: 'line1\nline2\nline3',
			lang: 'js',
			test: false,
		};
		const result = lens(multiline, config());

		expect(expectSnippet(result).code).toBe('3enil\n2enil\n1enil');
	});

	it('should respect configuration (even though reverse has no config)', () => {
		// Reverse lens doesn't use config, but should accept it gracefully
		const customConfig = config({ someOption: 'custom-value' });
		const result = lens(testSnippet, customConfig);

		expect(expectSnippet(result).code).toBe(
			'} ;24 nruter { )(tset noitcnuf'
		);
		expect(result.ui).toBeNull();
	});

	it('should handle whitespace and tabs', () => {
		const whitespace = { code: 'a\t b  \n  c', lang: 'js', test: false };
		const result = lens(whitespace, config());

		expect(expectSnippet(result).code).toBe('c  \n  b \ta');
	});
});

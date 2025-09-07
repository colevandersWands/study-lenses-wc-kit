/**
 * Main Export Structure Tests
 * Tests for the sl export object and core namespace
 */

import { describe, it, expect } from 'vitest';
import { sl } from './index.js';
import type { Snippet, LensOutput } from './types.js';

// Type guard helper for testing
const expectSnippet = (output: LensOutput): Snippet => {
	expect(output.snippet).toBeTruthy();
	expect(typeof output.snippet).toBe('object');
	return output.snippet as Snippet;
};

describe('Study Lenses main export structure', () => {
	describe('export structure', () => {
		it('should export sl object with all required namespaces', () => {
			expect(sl).toBeDefined();
			expect(typeof sl).toBe('object');

			// Core namespaces
			expect(sl.core).toBeDefined();
			expect(sl.lenses).toBeDefined();
			expect(sl.snippet).toBeDefined();
			expect(sl.ui).toBeDefined();
		});

		it('should have core namespace as priority', () => {
			// sl.core should be first in object (priority namespace)
			const keys = Object.keys(sl);
			expect(keys[0]).toBe('core');
		});
	});

	describe('sl.core namespace', () => {
		it('should export essential functions', () => {
			expect(sl.core).toBeDefined();
			expect(typeof sl.core).toBe('object');

			// Primary pipeline function
			expect(sl.core.pipeLenses).toBeDefined();
			expect(typeof sl.core.pipeLenses).toBe('function');

			// Load function
			expect(sl.core.load).toBeDefined();
			expect(typeof sl.core.load).toBe('function');
		});

		it('should have pipeLenses as primary function', async () => {
			const testSnippet: Snippet = {
				code: 'test code',
				lang: 'js',
				test: false,
			};

			const testLens = (snippet: Snippet) => ({
				snippet: { ...snippet, code: `Processed: ${snippet.code}` },
				ui: null,
			});

			// Should be able to call sl.core.pipeLenses directly
			const result = await sl.core.pipeLenses(testSnippet, [testLens]);

			const snippet = expectSnippet(result);
			expect(snippet.code).toBe('Processed: test code');
			expect(result.ui).toBeNull();
		});

		it('should have load function working', () => {
			const validLensObj = {
				name: 'test-lens',
				lens: (snippet: Snippet) => ({ snippet, ui: null }),
			};

			const result = sl.core.load(validLensObj);
			expect(typeof result).toBe('boolean');
		});
	});

	describe('sl.lenses namespace', () => {
		it('should export lens collection', () => {
			expect(sl.lenses).toBeDefined();
			expect(typeof sl.lenses).toBe('object');

			// Should have some built-in lenses
			expect(Object.keys(sl.lenses).length).toBeGreaterThan(0);
		});

		it('should have lenses with proper structure', () => {
			// Check that lenses follow the expected structure
			const lensNames = Object.keys(sl.lenses);
			expect(lensNames.length).toBeGreaterThan(0);

			// Test first lens structure
			const firstLensName = lensNames[0];
			const firstLens = sl.lenses[firstLensName];

			expect(firstLens).toBeDefined();
			expect(typeof firstLens).toBe('object');

			// Should have core properties
			expect(firstLens.name).toBeDefined();
			expect(firstLens.lens).toBeDefined();
			expect(typeof firstLens.lens).toBe('function');
			expect(firstLens.register).toBeDefined();
			expect(typeof firstLens.register).toBe('function');
			expect(firstLens.config).toBeDefined();
			expect(typeof firstLens.config).toBe('function');
		});
	});

	describe('sl.snippet namespace', () => {
		it('should export snippet utilities', () => {
			expect(sl.snippet).toBeDefined();
			expect(typeof sl.snippet).toBe('object');

			// Should have snippet creation utilities
			expect(Object.keys(sl.snippet).length).toBeGreaterThan(0);
		});
	});

	describe('sl.ui namespace', () => {
		it('should export UI components', () => {
			expect(sl.ui).toBeDefined();
			expect(typeof sl.ui).toBe('object');

			// Should have UI component collection
			expect(Object.keys(sl.ui).length).toBeGreaterThan(0);
		});
	});

	describe('API consistency', () => {
		it('should maintain consistent function signatures', async () => {
			const testSnippet: Snippet = {
				code: 'consistency test',
				lang: 'js',
				test: false,
			};

			// Core pipeline should work with various lens patterns
			const simpleLens = (snippet: Snippet) => ({
				snippet: { ...snippet, code: `Simple: ${snippet.code}` },
				ui: null,
			});

			// Should work with all core functions
			const result = await sl.core.pipeLenses(testSnippet, [simpleLens]);
			expect(result).toBeDefined();
			expect(result.snippet).toBeDefined();
			expect('ui' in result).toBe(true);
		});

		it('should have stable core API surface', () => {
			// Core API should be minimal and stable
			const coreKeys = Object.keys(sl.core);
			expect(coreKeys).toContain('pipeLenses');
			expect(coreKeys).toContain('load');

			// Should not have too many functions (keep focused)
			expect(coreKeys.length).toBeLessThanOrEqual(5);
		});
	});

	describe('backwards compatibility', () => {
		it('should maintain all major namespaces', () => {
			// All major namespaces should be preserved
			expect(sl.core).toBeDefined();
			expect(sl.lenses).toBeDefined();
			expect(sl.snippet).toBeDefined();
			expect(sl.ui).toBeDefined();
		});
	});

	describe('type safety', () => {
		it('should have proper TypeScript types', () => {
			// TypeScript should infer correct types
			const coreType = typeof sl.core;
			expect(coreType).toBe('object');

			const pipeLensesType = typeof sl.core.pipeLenses;
			expect(pipeLensesType).toBe('function');
		});

		it('should work with typed snippets', async () => {
			const typedSnippet: Snippet = {
				code: 'typed test',
				lang: 'js',
				test: false,
			};

			const typedLens = (snippet: Snippet) => ({
				snippet: { ...snippet, code: snippet.code.toUpperCase() },
				ui: null,
			});

			// Should compile and run without type errors
			const result = await sl.core.pipeLenses(typedSnippet, [typedLens]);

			const snippet = expectSnippet(result);
			expect(snippet.code).toBe('TYPED TEST');
		});
	});

	describe('performance characteristics', () => {
		it('should handle empty pipeline efficiently', async () => {
			const testSnippet: Snippet = {
				code: 'performance test',
				lang: 'js',
				test: false,
			};

			const start = Date.now();
			const result = await sl.core.pipeLenses(testSnippet, []);
			const duration = Date.now() - start;

			// Should complete quickly
			expect(duration).toBeLessThan(100);
			expect(result.snippet).toEqual(testSnippet);
		});

		it('should handle large lens chains', async () => {
			const testSnippet: Snippet = {
				code: 'chain test',
				lang: 'js',
				test: false,
			};

			// Create a large chain of simple lenses
			const lenses = Array.from(
				{ length: 50 },
				(_, i) => (snippet: Snippet) => ({
					snippet: { ...snippet, code: `${i}:${snippet.code}` },
					ui: null,
				})
			);

			const start = Date.now();
			const result = await sl.core.pipeLenses(testSnippet, lenses);
			const duration = Date.now() - start;

			// Should complete in reasonable time
			expect(duration).toBeLessThan(1000);
			const snippet = expectSnippet(result);
			expect(snippet.code).toContain('chain test');
			expect(snippet.code).toContain('49:'); // Last lens in chain
		});
	});
});

/**
 * Core Module Tests
 * Tests for the core namespace module structure and exports
 */

import { describe, it, expect } from 'vitest';
import core from './index.js';
import type { Snippet, LensFunction } from '../types.js';

describe('core module', () => {
	it('should export core object as default', () => {
		expect(core).toBeDefined();
		expect(typeof core).toBe('object');
	});

	it('should export pipeLenses function', () => {
		expect(core.pipeLenses).toBeDefined();
		expect(typeof core.pipeLenses).toBe('function');
	});

	it('should export load function', () => {
		expect(core.load).toBeDefined();
		expect(typeof core.load).toBe('function');
	});

	it('should have working pipeLenses function', async () => {
		const snippet: Snippet = { code: 'test', lang: 'js', test: false };
		const testLens: LensFunction = (s) => ({
			snippet: { ...s, code: 'tested' },
			ui: null,
		});

		const result = await core.pipeLenses(snippet, [testLens]);

		expect(result).toBeDefined();
		expect(result.snippet).toBeDefined();
		expect((result.snippet as Snippet).code).toBe('tested');
	});

	it('should have working load function', () => {
		const mockLens = {
			name: 'test-load',
			lens: (s: Snippet) => ({ snippet: s, ui: null }),
			register: () => 'sl-test-load',
			config: () => ({}),
		};

		const result = core.load(mockLens);

		expect(typeof result).toBe('boolean');
	});
});

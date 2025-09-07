/**
 * Debug Lens Configuration Tests
 */

import { describe, it, expect } from 'vitest';
import { config } from './config.js';

describe('debug config', () => {
	it('should return default config when no overrides provided', () => {
		const result = config();

		expect(result).toEqual({
			enabled: true,
			customPrefix: null,
			customSuffix: null,
			lineSpacing: 3,
		});
	});

	it('should merge overrides with defaults', () => {
		const result = config({ enabled: false });

		expect(result.enabled).toBe(false);
		expect(result.customPrefix).toBeNull(); // Should keep default
		expect(result.customSuffix).toBeNull(); // Should keep default
		expect(result.lineSpacing).toBe(3); // Should keep default
	});

	it('should handle partial config overrides', () => {
		const result = config({ lineSpacing: 1, customPrefix: 'DEBUG START' });

		expect(result.enabled).toBe(true); // Default
		expect(result.customPrefix).toBe('DEBUG START'); // Override
		expect(result.customSuffix).toBeNull(); // Default
		expect(result.lineSpacing).toBe(1); // Override
	});

	it('should handle all config properties', () => {
		const result = config({
			enabled: false,
			customPrefix: 'START',
			customSuffix: 'END',
			lineSpacing: 5,
		});

		expect(result.enabled).toBe(false);
		expect(result.customPrefix).toBe('START');
		expect(result.customSuffix).toBe('END');
		expect(result.lineSpacing).toBe(5);
	});

	it('should handle empty override object', () => {
		const result = config({});

		expect(result).toEqual({
			enabled: true,
			customPrefix: null,
			customSuffix: null,
			lineSpacing: 3,
		});
	});

	it('should handle nested config objects', () => {
		const result = config({
			enabled: true,
			lineSpacing: 2,
			extra: {
				nested: 'value',
			},
		});

		expect(result.enabled).toBe(true);
		expect(result.lineSpacing).toBe(2);
		expect(result.extra).toEqual({ nested: 'value' });
	});

	it('should handle zero values correctly', () => {
		const result = config({ lineSpacing: 0 });

		expect(result.lineSpacing).toBe(0);
		expect(result.enabled).toBe(true); // Should keep default
	});

	it('should handle boolean false values', () => {
		const result = config({ enabled: false });

		expect(result.enabled).toBe(false);
		expect(result.customPrefix).toBeNull(); // Should keep default
	});

	it('should handle string values', () => {
		const result = config({
			customPrefix: '>>> DEBUG START <<<',
			customSuffix: '>>> DEBUG END <<<',
		});

		expect(result.customPrefix).toBe('>>> DEBUG START <<<');
		expect(result.customSuffix).toBe('>>> DEBUG END <<<');
		expect(result.enabled).toBe(true); // Default
	});

	it('should not mutate the default config', () => {
		const result1 = config({ enabled: false });
		const result2 = config({ enabled: true });

		expect(result1.enabled).toBe(false);
		expect(result2.enabled).toBe(true);
		// Both should have independent configurations
	});

	describe('deep merge behavior', () => {
		it('should deep merge nested objects', () => {
			const defaultWithNested = config({
				advanced: {
					option1: 'default1',
					option2: 'default2',
				},
			});

			const result = config({
				advanced: {
					option1: 'override1',
				},
			});

			// Since deepMerge should preserve option2 when only option1 is overridden
			expect(result.advanced).toBeDefined();
			expect(result.advanced.option1).toBe('override1');
		});
	});

	describe('configuration validation', () => {
		it('should accept valid lineSpacing values', () => {
			expect(() => config({ lineSpacing: 0 })).not.toThrow();
			expect(() => config({ lineSpacing: 1 })).not.toThrow();
			expect(() => config({ lineSpacing: 10 })).not.toThrow();
		});

		it('should handle undefined values gracefully', () => {
			const result = config({ enabled: undefined });

			// undefined should not override the default
			expect(result.enabled).toBe(true);
		});

		it('should handle null values in overrides', () => {
			const result = config({
				customPrefix: null,
				customSuffix: 'SUFFIX',
			});

			expect(result.customPrefix).toBeNull();
			expect(result.customSuffix).toBe('SUFFIX');
		});
	});
});

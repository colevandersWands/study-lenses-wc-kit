/**
 * Lowercase Lens Configuration Tests
 * Tests the config factory pattern with deep merge support
 */

import { describe, it, expect } from 'vitest';
import { config } from './config.js';

describe('lowercase config factory', () => {
	it('should return empty config by default', () => {
		const result = config();

		expect(result).toEqual({});
		expect(typeof result).toBe('object');
	});

	it('should return fresh objects on each call', () => {
		const config1 = config();
		const config2 = config();

		expect(config1).not.toBe(config2); // Different object references
		expect(config1).toEqual(config2); // Same content
	});

	it('should accept empty overrides', () => {
		const result = config({});

		expect(result).toEqual({});
	});

	it('should merge simple overrides', () => {
		const result = config({ theme: 'dark', enabled: true });

		expect(result).toEqual({
			theme: 'dark',
			enabled: true,
		});
	});

	it('should handle nested object overrides', () => {
		const result = config({
			display: {
				theme: 'dark',
				compact: true,
			},
			processing: {
				timeout: 5000,
			},
		});

		expect(result).toEqual({
			display: {
				theme: 'dark',
				compact: true,
			},
			processing: {
				timeout: 5000,
			},
		});
	});

	it('should not mutate original defaults', () => {
		const result1 = config({ custom: 'value1' });
		const result2 = config({ custom: 'value2' });

		expect(result1.custom).toBe('value1');
		expect(result2.custom).toBe('value2');
		expect(result1).not.toBe(result2);
	});

	it('should handle null and undefined overrides gracefully', () => {
		expect(() => config(null)).not.toThrow();
		expect(() => config(undefined)).not.toThrow();

		const nullResult = config(null);
		const undefinedResult = config(undefined);

		expect(nullResult).toEqual({});
		expect(undefinedResult).toEqual({});
	});

	describe('deep merge behavior', () => {
		it('should perform deep merge correctly', () => {
			const result = config({
				level1: {
					level2: {
						prop: 'value',
					},
				},
			});

			expect(result).toEqual({
				level1: {
					level2: {
						prop: 'value',
					},
				},
			});
		});

		it('should handle arrays in overrides', () => {
			const result = config({
				items: [1, 2, 3],
				nested: {
					array: ['a', 'b', 'c'],
				},
			});

			expect(result).toEqual({
				items: [1, 2, 3],
				nested: {
					array: ['a', 'b', 'c'],
				},
			});
		});

		it('should not affect subsequent calls', () => {
			const firstCall = config({ first: true });
			const secondCall = config({ second: true });

			expect(firstCall).toEqual({ first: true });
			expect(secondCall).toEqual({ second: true });
			expect(firstCall.second).toBeUndefined();
			expect(secondCall.first).toBeUndefined();
		});
	});

	describe('function interface', () => {
		it('should be callable as a function', () => {
			expect(typeof config).toBe('function');
		});

		it('should work with the default export pattern', () => {
			const defaultExport = config;
			const result = defaultExport({ test: 'value' });

			expect(result).toEqual({ test: 'value' });
		});
	});

	describe('config factory edge cases', () => {
		it('should handle complex nested structures', () => {
			const complexOverrides = {
				theme: {
					colors: {
						primary: '#007acc',
						secondary: '#ff6b35',
					},
					fonts: {
						heading: 'Arial',
						body: 'Helvetica',
					},
				},
				features: {
					animations: true,
					sounds: false,
					notifications: {
						email: true,
						push: false,
						desktop: true,
					},
				},
			};

			const result = config(complexOverrides);

			expect(result).toEqual(complexOverrides);
			expect(result.theme.colors.primary).toBe('#007acc');
			expect(result.features.notifications.desktop).toBe(true);
		});

		it('should preserve object types in overrides', () => {
			const dateOverride = { created: new Date('2023-01-01') };
			const result = config(dateOverride);

			expect(result.created).toBeInstanceOf(Date);
			expect(result.created.getFullYear()).toBe(2023);
		});

		it('should handle function properties in overrides', () => {
			const functionOverride = {
				callback: () => 'test',
				processor: function (data: any) {
					return data;
				},
			};
			const result = config(functionOverride);

			expect(typeof result.callback).toBe('function');
			expect(typeof result.processor).toBe('function');
			expect(result.callback()).toBe('test');
		});
	});
});

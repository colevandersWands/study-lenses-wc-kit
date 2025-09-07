/**
 * JSX Demo Lens Configuration Tests
 * Tests the config factory pattern with deep merge support for JSX demo lens
 */

import { describe, it, expect } from 'vitest';
import { config } from './config.js';

describe('jsx-demo config factory', () => {
	it('should return default config', () => {
		const result = config();

		expect(result).toEqual({
			showDetails: true,
			showStats: true,
			theme: 'light',
		});
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

		expect(result).toEqual({
			showDetails: true,
			showStats: true,
			theme: 'light',
		});
	});

	it('should merge simple overrides', () => {
		const result = config({ theme: 'dark' });

		expect(result).toEqual({
			showDetails: true,
			showStats: true,
			theme: 'dark',
		});
	});

	it('should override showDetails', () => {
		const result = config({ showDetails: false });

		expect(result).toEqual({
			showDetails: false,
			showStats: true,
			theme: 'light',
		});
	});

	it('should override showStats', () => {
		const result = config({ showStats: false });

		expect(result).toEqual({
			showDetails: true,
			showStats: false,
			theme: 'light',
		});
	});

	it('should override multiple properties', () => {
		const result = config({
			showDetails: false,
			showStats: false,
			theme: 'dark',
		});

		expect(result).toEqual({
			showDetails: false,
			showStats: false,
			theme: 'dark',
		});
	});

	it('should add new properties via overrides', () => {
		const result = config({
			customProperty: 'value',
			animations: true,
		});

		expect(result).toEqual({
			showDetails: true,
			showStats: true,
			theme: 'light',
			customProperty: 'value',
			animations: true,
		});
	});

	it('should handle nested object overrides', () => {
		const result = config({
			display: {
				border: true,
				padding: '16px',
			},
			analysis: {
				includeComments: false,
				highlightKeywords: true,
			},
		});

		expect(result).toEqual({
			showDetails: true,
			showStats: true,
			theme: 'light',
			display: {
				border: true,
				padding: '16px',
			},
			analysis: {
				includeComments: false,
				highlightKeywords: true,
			},
		});
	});

	it('should not mutate original defaults', () => {
		const result1 = config({ theme: 'dark' });
		const result2 = config({ theme: 'light' });
		const result3 = config({ showDetails: false });

		expect(result1.theme).toBe('dark');
		expect(result2.theme).toBe('light');
		expect(result3.theme).toBe('light'); // Should still be default
		expect(result3.showDetails).toBe(false);
	});

	it('should handle null and undefined overrides gracefully', () => {
		expect(() => config(null)).not.toThrow();
		expect(() => config(undefined)).not.toThrow();

		const nullResult = config(null);
		const undefinedResult = config(undefined);

		expect(nullResult).toEqual({
			showDetails: true,
			showStats: true,
			theme: 'light',
		});
		expect(undefinedResult).toEqual({
			showDetails: true,
			showStats: true,
			theme: 'light',
		});
	});

	describe('deep merge behavior', () => {
		it('should perform deep merge correctly', () => {
			const result = config({
				styling: {
					colors: {
						primary: '#007acc',
						secondary: '#ff6b35',
					},
					typography: {
						fontSize: '14px',
						fontFamily: 'monospace',
					},
				},
			});

			expect(result.styling.colors.primary).toBe('#007acc');
			expect(result.styling.typography.fontSize).toBe('14px');
		});

		it('should handle arrays in overrides', () => {
			const result = config({
				visibleStats: ['lines', 'words', 'characters'],
				hiddenElements: ['details', 'summary'],
			});

			expect(result.visibleStats).toEqual([
				'lines',
				'words',
				'characters',
			]);
			expect(result.hiddenElements).toEqual(['details', 'summary']);
		});

		it('should not affect subsequent calls', () => {
			const firstCall = config({ showDetails: false });
			const secondCall = config({ showStats: false });
			const thirdCall = config(); // Default

			expect(firstCall.showDetails).toBe(false);
			expect(firstCall.showStats).toBe(true); // Should remain default
			expect(secondCall.showDetails).toBe(true); // Should remain default
			expect(secondCall.showStats).toBe(false);
			expect(thirdCall.showDetails).toBe(true);
			expect(thirdCall.showStats).toBe(true);
		});
	});

	describe('jsx-demo specific configuration', () => {
		it('should support theme variations', () => {
			const lightTheme = config({ theme: 'light' });
			const darkTheme = config({ theme: 'dark' });
			const customTheme = config({ theme: 'custom' });

			expect(lightTheme.theme).toBe('light');
			expect(darkTheme.theme).toBe('dark');
			expect(customTheme.theme).toBe('custom');
		});

		it('should support details visibility configuration', () => {
			const withDetails = config({ showDetails: true });
			const withoutDetails = config({ showDetails: false });

			expect(withDetails.showDetails).toBe(true);
			expect(withoutDetails.showDetails).toBe(false);
		});

		it('should support stats visibility configuration', () => {
			const withStats = config({ showStats: true });
			const withoutStats = config({ showStats: false });

			expect(withStats.showStats).toBe(true);
			expect(withoutStats.showStats).toBe(false);
		});

		it('should support complex jsx-demo configurations', () => {
			const complexConfig = config({
				theme: 'dark',
				showDetails: false,
				showStats: true,
				customization: {
					headerText: 'Custom Code Analysis',
					showLanguageInfo: true,
					showTestModeInfo: false,
					statsLayout: 'horizontal',
				},
				styling: {
					borderColor: '#333',
					backgroundColor: '#1e1e1e',
					textColor: '#fff',
				},
			});

			expect(complexConfig.theme).toBe('dark');
			expect(complexConfig.customization.headerText).toBe(
				'Custom Code Analysis'
			);
			expect(complexConfig.styling.borderColor).toBe('#333');
		});
	});

	describe('function interface', () => {
		it('should be callable as a function', () => {
			expect(typeof config).toBe('function');
		});

		it('should work with the default export pattern', () => {
			const defaultExport = config;
			const result = defaultExport({ theme: 'dark' });

			expect(result.theme).toBe('dark');
			expect(result.showDetails).toBe(true);
			expect(result.showStats).toBe(true);
		});
	});

	describe('config factory edge cases', () => {
		it('should handle boolean override edge cases', () => {
			const falsyOverrides = config({
				showDetails: false,
				showStats: 0,
				enabled: null,
				visible: undefined,
			});

			expect(falsyOverrides.showDetails).toBe(false);
			expect(falsyOverrides.showStats).toBe(0);
			expect(falsyOverrides.enabled).toBeNull();
			expect(falsyOverrides.visible).toBeUndefined();
		});

		it('should preserve object types in overrides', () => {
			const dateOverride = config({
				lastUpdated: new Date('2023-01-01'),
				pattern: /test/g,
			});

			expect(dateOverride.lastUpdated).toBeInstanceOf(Date);
			expect(dateOverride.pattern).toBeInstanceOf(RegExp);
		});

		it('should handle function properties in overrides', () => {
			const functionOverride = config({
				customAnalyzer: (code: string) => ({
					lines: code.split('\n').length,
				}),
				formatter: function (stats: any) {
					return `${stats.lines} lines`;
				},
			});

			expect(typeof functionOverride.customAnalyzer).toBe('function');
			expect(typeof functionOverride.formatter).toBe('function');
			expect(functionOverride.customAnalyzer('a\nb\nc')).toEqual({
				lines: 3,
			});
		});
	});
});

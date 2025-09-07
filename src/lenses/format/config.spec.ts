/**
 * Format Lens Configuration Tests
 * Tests for configuration factory function and deep merge behavior
 */

import { describe, it, expect } from 'vitest';
import { config } from './config.js';

describe('format lens config factory', () => {
	describe('default configuration', () => {
		it('should return classic tab-based defaults when called with no arguments', () => {
			const defaultConfig = config();

			expect(defaultConfig).toEqual({
				parser: 'babel',
				useTabs: true,
				tabWidth: 4,
				semi: true,
				singleQuote: false,
				trailingComma: 'none',
				bracketSpacing: true,
				arrowParens: 'always',
				printWidth: 80,
				endOfLine: 'lf',
				quoteProps: 'as-needed',
				jsxSingleQuote: false,
				bracketSameLine: false,
			});
		});

		it('should use classic tab-based formatting preferences', () => {
			const defaultConfig = config();

			// Classic formatting characteristics
			expect(defaultConfig.useTabs).toBe(true);
			expect(defaultConfig.singleQuote).toBe(false); // Double quotes
			expect(defaultConfig.trailingComma).toBe('none'); // No trailing commas
			expect(defaultConfig.arrowParens).toBe('always'); // Always parentheses
			expect(defaultConfig.semi).toBe(true); // Always semicolons
		});
	});

	describe('configuration overrides', () => {
		it('should merge simple overrides with defaults', () => {
			const customConfig = config({
				useTabs: false,
				tabWidth: 2,
			});

			expect(customConfig.useTabs).toBe(false);
			expect(customConfig.tabWidth).toBe(2);
			// Other defaults should be preserved
			expect(customConfig.singleQuote).toBe(false);
			expect(customConfig.trailingComma).toBe('none');
			expect(customConfig.semi).toBe(true);
		});

		it('should handle modern formatting preferences', () => {
			const modernConfig = config({
				useTabs: false,
				tabWidth: 2,
				singleQuote: true,
				trailingComma: 'es5',
				arrowParens: 'avoid',
			});

			expect(modernConfig.useTabs).toBe(false);
			expect(modernConfig.tabWidth).toBe(2);
			expect(modernConfig.singleQuote).toBe(true);
			expect(modernConfig.trailingComma).toBe('es5');
			expect(modernConfig.arrowParens).toBe('avoid');
			// Unmodified defaults should remain
			expect(modernConfig.semi).toBe(true);
			expect(modernConfig.bracketSpacing).toBe(true);
		});

		it('should handle partial overrides', () => {
			const partialConfig = config({
				printWidth: 120,
			});

			expect(partialConfig.printWidth).toBe(120);
			// All other defaults should be preserved
			expect(partialConfig.useTabs).toBe(true);
			expect(partialConfig.singleQuote).toBe(false);
			expect(partialConfig.trailingComma).toBe('none');
		});
	});

	describe('factory function behavior', () => {
		it('should return independent objects on each call', () => {
			const config1 = config({ useTabs: false });
			const config2 = config({ useTabs: true });

			expect(config1.useTabs).toBe(false);
			expect(config2.useTabs).toBe(true);

			// Modify one, other should be unaffected
			config1.printWidth = 120;
			expect(config2.printWidth).toBe(80);
		});

		it('should not mutate defaults when modifying returned config', () => {
			const config1 = config();
			const config2 = config();

			config1.useTabs = false;
			config1.singleQuote = true;

			// Second config should still have defaults
			expect(config2.useTabs).toBe(true);
			expect(config2.singleQuote).toBe(false);
		});

		it('should handle null and undefined overrides gracefully', () => {
			const configNull = config(null as any);
			const configUndefined = config(undefined);
			const configEmpty = config({});

			// All should return default configuration
			expect(configNull).toEqual(config());
			expect(configUndefined).toEqual(config());
			expect(configEmpty).toEqual(config());
		});
	});

	describe('prettier option validation', () => {
		it('should accept all valid Prettier options', () => {
			const allOptions = config({
				parser: 'typescript',
				useTabs: false,
				tabWidth: 2,
				semi: false,
				singleQuote: true,
				trailingComma: 'all',
				bracketSpacing: false,
				arrowParens: 'avoid',
				printWidth: 100,
				endOfLine: 'crlf',
				quoteProps: 'consistent',
				jsxSingleQuote: true,
				bracketSameLine: true,
			});

			expect(allOptions.parser).toBe('typescript');
			expect(allOptions.useTabs).toBe(false);
			expect(allOptions.tabWidth).toBe(2);
			expect(allOptions.semi).toBe(false);
			expect(allOptions.singleQuote).toBe(true);
			expect(allOptions.trailingComma).toBe('all');
			expect(allOptions.bracketSpacing).toBe(false);
			expect(allOptions.arrowParens).toBe('avoid');
			expect(allOptions.printWidth).toBe(100);
			expect(allOptions.endOfLine).toBe('crlf');
			expect(allOptions.quoteProps).toBe('consistent');
			expect(allOptions.jsxSingleQuote).toBe(true);
			expect(allOptions.bracketSameLine).toBe(true);
		});

		it('should handle edge case values', () => {
			const edgeCaseConfig = config({
				tabWidth: 0,
				printWidth: 1,
				trailingComma: 'none',
			});

			expect(edgeCaseConfig.tabWidth).toBe(0);
			expect(edgeCaseConfig.printWidth).toBe(1);
			expect(edgeCaseConfig.trailingComma).toBe('none');
		});
	});

	describe('configuration scenarios', () => {
		it('should support common team formatting standards', () => {
			// Airbnb-style config
			const airbnbStyle = config({
				useTabs: false,
				tabWidth: 2,
				singleQuote: true,
				trailingComma: 'all',
				arrowParens: 'avoid',
			});

			// Google-style config
			const googleStyle = config({
				useTabs: false,
				tabWidth: 2,
				singleQuote: true,
				trailingComma: 'es5',
				arrowParens: 'always',
			});

			// Prettier default-style config
			const prettierStyle = config({
				useTabs: false,
				tabWidth: 2,
				singleQuote: false,
				trailingComma: 'es5',
				arrowParens: 'always',
			});

			expect(airbnbStyle.singleQuote).toBe(true);
			expect(airbnbStyle.trailingComma).toBe('all');
			expect(googleStyle.trailingComma).toBe('es5');
			expect(prettierStyle.singleQuote).toBe(false);
		});

		it('should maintain classic defaults for legacy codebases', () => {
			const classicConfig = config();

			// Classic characteristics that differ from modern defaults
			expect(classicConfig.useTabs).toBe(true); // vs spaces
			expect(classicConfig.tabWidth).toBe(4); // vs 2
			expect(classicConfig.singleQuote).toBe(false); // vs true
			expect(classicConfig.trailingComma).toBe('none'); // vs 'es5'
			expect(classicConfig.arrowParens).toBe('always'); // vs 'avoid'
		});
	});
});

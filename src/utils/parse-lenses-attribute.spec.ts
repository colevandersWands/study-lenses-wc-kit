/**
 * Parse Lenses Attribute Tests
 * Tests lens name extraction from lenses attribute with space and comma support
 */

import { describe, it, expect } from 'vitest';
import { parseLensesAttribute } from './parse-lenses-attribute.js';

describe('parseLensesAttribute', () => {
	describe('basic functionality', () => {
		it('should return empty array for null input', () => {
			const result = parseLensesAttribute(null);

			expect(result).toEqual([]);
		});

		it('should return empty array for undefined input', () => {
			const result = parseLensesAttribute(undefined as any);

			expect(result).toEqual([]);
		});

		it('should return empty array for empty string', () => {
			const result = parseLensesAttribute('');

			expect(result).toEqual([]);
		});

		it('should return empty array for whitespace-only string', () => {
			const result = parseLensesAttribute('   \n\t   ');

			expect(result).toEqual([]);
		});
	});

	describe('space separation', () => {
		it('should split simple space-separated lens names', () => {
			const result = parseLensesAttribute('reverse uppercase');

			expect(result).toEqual(['reverse', 'uppercase']);
		});

		it('should handle multiple spaces', () => {
			const result = parseLensesAttribute(
				'reverse     uppercase     lowercase'
			);

			expect(result).toEqual(['reverse', 'uppercase', 'lowercase']);
		});

		it('should handle leading and trailing spaces', () => {
			const result = parseLensesAttribute('  reverse uppercase  ');

			expect(result).toEqual(['reverse', 'uppercase']);
		});

		it('should handle single lens with spaces', () => {
			const result = parseLensesAttribute('  jsx-demo  ');

			expect(result).toEqual(['jsx-demo']);
		});

		it('should handle tabs as separators', () => {
			const result = parseLensesAttribute(
				'reverse\tuppercase\tlowercase'
			);

			expect(result).toEqual(['reverse', 'uppercase', 'lowercase']);
		});

		it('should handle newlines as separators', () => {
			const result = parseLensesAttribute(
				'reverse\nuppercase\nlowercase'
			);

			expect(result).toEqual(['reverse', 'uppercase', 'lowercase']);
		});

		it('should handle mixed whitespace separators', () => {
			const result = parseLensesAttribute(
				'reverse \t\n uppercase   \n\t lowercase'
			);

			expect(result).toEqual(['reverse', 'uppercase', 'lowercase']);
		});
	});

	describe('comma separation', () => {
		it('should split comma-separated lens names', () => {
			const result = parseLensesAttribute('reverse,uppercase,lowercase');

			expect(result).toEqual(['reverse', 'uppercase', 'lowercase']);
		});

		it('should handle comma with spaces', () => {
			const result = parseLensesAttribute(
				'reverse, uppercase, lowercase'
			);

			expect(result).toEqual(['reverse', 'uppercase', 'lowercase']);
		});

		it('should handle comma with various whitespace', () => {
			const result = parseLensesAttribute(
				'reverse,\t\nuppercase  ,   lowercase'
			);

			expect(result).toEqual(['reverse', 'uppercase', 'lowercase']);
		});

		it('should handle trailing commas', () => {
			const result = parseLensesAttribute('reverse, uppercase,');

			expect(result).toEqual(['reverse', 'uppercase']);
		});

		it('should handle leading commas', () => {
			const result = parseLensesAttribute(',reverse, uppercase');

			expect(result).toEqual(['reverse', 'uppercase']);
		});

		it('should handle multiple consecutive commas', () => {
			const result = parseLensesAttribute(
				'reverse,,,uppercase,,lowercase'
			);

			expect(result).toEqual(['reverse', 'uppercase', 'lowercase']);
		});
	});

	describe('mixed separators', () => {
		it('should handle both spaces and commas together', () => {
			const result = parseLensesAttribute(
				'reverse uppercase, lowercase jsx-demo'
			);

			expect(result).toEqual([
				'reverse',
				'uppercase',
				'lowercase',
				'jsx-demo',
			]);
		});

		it('should handle complex mixed separators', () => {
			const result = parseLensesAttribute(
				'reverse,\t uppercase \n lowercase, jsx-demo   trace-table'
			);

			expect(result).toEqual([
				'reverse',
				'uppercase',
				'lowercase',
				'jsx-demo',
				'trace-table',
			]);
		});

		it('should handle all types of whitespace and commas', () => {
			const result = parseLensesAttribute(
				'  reverse,\t\n  uppercase   ,   lowercase \n jsx-demo  '
			);

			expect(result).toEqual([
				'reverse',
				'uppercase',
				'lowercase',
				'jsx-demo',
			]);
		});
	});

	describe('lens name formats', () => {
		it('should handle simple lens names', () => {
			const result = parseLensesAttribute('reverse uppercase lowercase');

			expect(result).toEqual(['reverse', 'uppercase', 'lowercase']);
		});

		it('should handle hyphenated lens names', () => {
			const result = parseLensesAttribute('jsx-demo trace-table');

			expect(result).toEqual(['jsx-demo', 'trace-table']);
		});

		it('should handle underscored lens names', () => {
			const result = parseLensesAttribute('my_lens another_lens');

			expect(result).toEqual(['my_lens', 'another_lens']);
		});

		it('should handle numeric lens names', () => {
			const result = parseLensesAttribute('lens1 lens2 lens3');

			expect(result).toEqual(['lens1', 'lens2', 'lens3']);
		});

		it('should handle mixed format lens names', () => {
			const result = parseLensesAttribute(
				'simple-lens complex_lens_name SimpleLens lens123'
			);

			expect(result).toEqual([
				'simple-lens',
				'complex_lens_name',
				'SimpleLens',
				'lens123',
			]);
		});

		it('should handle single character lens names', () => {
			const result = parseLensesAttribute('a b c');

			expect(result).toEqual(['a', 'b', 'c']);
		});

		it('should handle very long lens names', () => {
			const longName = 'very-long-complex-lens-name-with-many-parts';
			const result = parseLensesAttribute(`${longName} short`);

			expect(result).toEqual([longName, 'short']);
		});
	});

	describe('edge cases', () => {
		it('should handle single lens name', () => {
			const result = parseLensesAttribute('reverse');

			expect(result).toEqual(['reverse']);
		});

		it('should filter out empty strings from multiple separators', () => {
			const result = parseLensesAttribute(
				'   ,  ,  reverse  ,  ,  ,  uppercase  ,  ,  '
			);

			expect(result).toEqual(['reverse', 'uppercase']);
		});

		it('should handle only separators', () => {
			const result = parseLensesAttribute('  ,  ,  \t\n  ,  ');

			expect(result).toEqual([]);
		});

		it('should preserve exact lens names without trimming internal spaces', () => {
			// Note: lens names themselves shouldn't contain spaces, but testing the parser
			const result = parseLensesAttribute('reverse uppercase');

			expect(result).toEqual(['reverse', 'uppercase']);
		});

		it('should handle very large number of lens names', () => {
			const lensNames = Array.from({ length: 100 }, (_, i) => `lens${i}`);
			const input = lensNames.join(' ');
			const result = parseLensesAttribute(input);

			expect(result).toEqual(lensNames);
			expect(result).toHaveLength(100);
		});
	});

	describe('real-world scenarios', () => {
		it('should handle typical pipeline definitions', () => {
			const scenarios = [
				{
					input: 'reverse uppercase',
					expected: ['reverse', 'uppercase'],
				},
				{
					input: 'reverse, uppercase, lowercase',
					expected: ['reverse', 'uppercase', 'lowercase'],
				},
				{ input: 'jsx-demo', expected: ['jsx-demo'] },
				{
					input: 'format trace-table jsx-demo',
					expected: ['format', 'trace-table', 'jsx-demo'],
				},
				{
					input: 'reverse,uppercase,jsx-demo,trace-table',
					expected: [
						'reverse',
						'uppercase',
						'jsx-demo',
						'trace-table',
					],
				},
			];

			scenarios.forEach(({ input, expected }) => {
				const result = parseLensesAttribute(input);
				expect(result).toEqual(expected);
			});
		});

		it('should handle user-friendly formatting', () => {
			const userInput = `
        reverse,
        uppercase,
        jsx-demo
      `;
			const result = parseLensesAttribute(userInput);

			expect(result).toEqual(['reverse', 'uppercase', 'jsx-demo']);
		});

		it('should handle copy-pasted lists', () => {
			const copyPasted = 'reverse\nuppercase\nlowercase\njsx-demo';
			const result = parseLensesAttribute(copyPasted);

			expect(result).toEqual([
				'reverse',
				'uppercase',
				'lowercase',
				'jsx-demo',
			]);
		});

		it('should handle HTML attribute formatting', () => {
			// Simulating how HTML attributes might be formatted
			const htmlFormatted = 'reverse    uppercase    jsx-demo';
			const result = parseLensesAttribute(htmlFormatted);

			expect(result).toEqual(['reverse', 'uppercase', 'jsx-demo']);
		});
	});

	describe('consistency and immutability', () => {
		it('should return same result for same input', () => {
			const input = 'reverse uppercase lowercase';
			const result1 = parseLensesAttribute(input);
			const result2 = parseLensesAttribute(input);

			expect(result1).toEqual(result2);
			expect(result1).not.toBe(result2); // Different array instances
		});

		it('should not modify input string', () => {
			const input = '  reverse  ,  uppercase  ';
			const originalInput = input;

			parseLensesAttribute(input);

			expect(input).toBe(originalInput);
		});

		it('should return new array instances each time', () => {
			const input = 'reverse uppercase';
			const result1 = parseLensesAttribute(input);
			const result2 = parseLensesAttribute(input);

			expect(result1).not.toBe(result2);
			result1.push('modified');
			expect(result2).not.toContain('modified');
		});
	});

	describe('performance characteristics', () => {
		it('should handle empty and null inputs efficiently', () => {
			const start = performance.now();

			for (let i = 0; i < 1000; i++) {
				parseLensesAttribute(null);
				parseLensesAttribute('');
				parseLensesAttribute('   ');
			}

			const end = performance.now();
			expect(end - start).toBeLessThan(100); // Should be very fast
		});

		it('should handle large inputs efficiently', () => {
			const largeInput = Array.from(
				{ length: 1000 },
				(_, i) => `lens${i}`
			).join(' ');

			const start = performance.now();
			const result = parseLensesAttribute(largeInput);
			const end = performance.now();

			expect(result).toHaveLength(1000);
			expect(end - start).toBeLessThan(50); // Should complete quickly
		});
	});
});

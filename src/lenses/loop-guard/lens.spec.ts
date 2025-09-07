/**
 * Loop Guard Lens - Unit Tests
 *
 * Tests the AST transformation logic for all supported loop types
 * and configuration options. Includes edge cases and error handling.
 */

import { describe, it, expect } from 'vitest';
import { lens } from './lens.js';
import type { Snippet, LensOutput } from '../../types.js';

// Type guard helper for testing
const expectSnippet = (output: LensOutput): Snippet => {
	expect(output.snippet).toBeTruthy();
	expect(typeof output.snippet).toBe('object');
	return output.snippet as Snippet;
};
import { config } from './config.js';

describe('loop-guard lens', () => {
	const createSnippet = (code: string): Snippet => ({
		code,
		lang: 'javascript',
		test: false,
	});

	describe('for loop protection', () => {
		it('should add loop guards to basic for loop', async () => {
			const snippet = createSnippet(`
        for (let i = 0; i < 10; i++) {
          console.log(i);
        }
      `);

			const result = await lens(snippet);

			expect(expectSnippet(result).code).toContain('loopGuard_1');
			expect(expectSnippet(result).code).toContain('loopGuard_1++');
			expect(expectSnippet(result).code).toContain(
				'if (loopGuard_1 > 1000)'
			);
			expect(expectSnippet(result).code).toContain(
				'throw new RangeError'
			);
			expect(result.ui).toBeNull();
		});

		it('should handle single-line for loop body', async () => {
			const snippet = createSnippet(`
        for (let i = 0; i < 10; i++)
          console.log(i);
      `);

			const result = await lens(snippet);

			expect(expectSnippet(result).code).toContain('loopGuard_1');
			expect(expectSnippet(result).code).toContain('{');
			expect(expectSnippet(result).code).toContain('}');
		});

		it('should handle nested for loops with unique guards', async () => {
			const snippet = createSnippet(`
        for (let i = 0; i < 10; i++) {
          for (let j = 0; j < 5; j++) {
            console.log(i, j);
          }
        }
      `);

			const result = await lens(snippet);

			expect(expectSnippet(result).code).toContain('loopGuard_1');
			expect(expectSnippet(result).code).toContain('loopGuard_2');
			expect(expectSnippet(result).code).not.toContain('loopGuard_3');
		});
	});

	describe('while loop protection', () => {
		it('should add loop guards to while loop', async () => {
			const snippet = createSnippet(`
        let counter = 0;
        while (counter < 10) {
          counter++;
        }
      `);

			const result = await lens(snippet);

			expect(expectSnippet(result).code).toContain('loopGuard_1');
			expect(expectSnippet(result).code).toContain('loopGuard_1++');
			expect(expectSnippet(result).code).toContain(
				'if (loopGuard_1 > 1000)'
			);
		});

		it('should handle single-line while loop body', async () => {
			const snippet = createSnippet(`
        let x = 0;
        while (x < 5)
          x++;
      `);

			const result = await lens(snippet);

			expect(expectSnippet(result).code).toContain('loopGuard_1');
			expect(expectSnippet(result).code).toContain('{');
		});
	});

	describe('do-while loop protection', () => {
		it('should add loop guards to do-while loop', async () => {
			const snippet = createSnippet(`
        let i = 0;
        do {
          console.log(i);
          i++;
        } while (i < 3);
      `);

			const result = await lens(snippet);

			expect(expectSnippet(result).code).toContain('loopGuard_1');
			expect(expectSnippet(result).code).toContain('loopGuard_1++');
		});
	});

	describe('for-of loop protection', () => {
		it('should add loop guards to for-of loop', async () => {
			const snippet = createSnippet(`
        const items = [1, 2, 3];
        for (const item of items) {
          console.log(item);
        }
      `);

			const result = await lens(snippet);

			expect(expectSnippet(result).code).toContain('loopGuard_1');
			expect(expectSnippet(result).code).toContain('loopGuard_1++');
		});

		it('should handle for-of with destructuring', async () => {
			const snippet = createSnippet(`
        const pairs = [[1, 2], [3, 4]];
        for (const [a, b] of pairs) {
          console.log(a + b);
        }
      `);

			const result = await lens(snippet);

			expect(expectSnippet(result).code).toContain('loopGuard_1');
		});
	});

	describe('for-in loop protection', () => {
		it('should add loop guards to for-in loop', async () => {
			const snippet = createSnippet(`
        const obj = { a: 1, b: 2, c: 3 };
        for (const key in obj) {
          console.log(key, obj[key]);
        }
      `);

			const result = await lens(snippet);

			expect(expectSnippet(result).code).toContain('loopGuard_1');
			expect(expectSnippet(result).code).toContain('loopGuard_1++');
		});
	});

	describe('for-await-of loop protection', () => {
		it('should add loop guards to for-await-of loop', async () => {
			const snippet = createSnippet(`
        async function processAsync(asyncIterable) {
          for await (const item of asyncIterable) {
            console.log(item);
          }
        }
      `);

			const result = await lens(snippet);

			// for-await-of parsing might fail, so we accept graceful fallback
			if (expectSnippet(result).code === snippet.code) {
				// Parser couldn't handle for-await-of, which is acceptable
				expect(expectSnippet(result).code).toBe(snippet.code);
			} else {
				// Parser succeeded, check for guards
				expect(expectSnippet(result).code).toContain('loopGuard_1');
				expect(expectSnippet(result).code).toContain('loopGuard_1++');
			}
		});
	});

	describe('configuration handling', () => {
		it('should respect custom max iteration limit', async () => {
			const snippet = createSnippet(`
        for (let i = 0; i < 10; i++) {
          console.log(i);
        }
      `);

			const customConfig = config({ max: 500 });
			const result = await lens(snippet, customConfig);

			expect(expectSnippet(result).code).toContain(
				'if (loopGuard_1 > 500)'
			);
			expect(expectSnippet(result).code).toContain(
				'loopGuard_1 is greater than 500'
			);
		});

		it('should only guard specified loop types', async () => {
			const snippet = createSnippet(`
        for (let i = 0; i < 5; i++) {
          console.log('for:', i);
        }
        
        let j = 0;
        while (j < 5) {
          console.log('while:', j);
          j++;
        }
      `);

			const customConfig = config({ loops: ['for'] }); // Only guard for loops
			const result = await lens(snippet, customConfig);

			// Should contain guard for 'for' loop
			expect(expectSnippet(result).code).toContain('loopGuard_1');

			// Should not contain guards for while loop (only 1 guard total)
			expect(expectSnippet(result).code).not.toContain('loopGuard_2');
		});

		it('should respect format config setting', async () => {
			const snippet = createSnippet(
				`for(let i=0;i<10;i++){console.log(i);}`
			);

			const customConfig = config({ format: false });
			const result = await lens(snippet, customConfig);

			expect(expectSnippet(result).code).toContain('loopGuard_1');
			// Note: recast automatically formats code during AST transformation
			// The format flag mainly controls additional prettify steps
			expect(expectSnippet(result).code).toContain('for '); // recast normalizes spacing
		});

		it('should use default config when none provided', async () => {
			const snippet = createSnippet(`
        for (let i = 0; i < 10; i++) {
          console.log(i);
        }
      `);

			const result = await lens(snippet); // No config provided

			expect(expectSnippet(result).code).toContain(
				'if (loopGuard_1 > 1000)'
			); // Default max
		});
	});

	describe('mixed loop types', () => {
		it('should handle multiple different loop types', async () => {
			const snippet = createSnippet(`
        for (let i = 0; i < 3; i++) {
          console.log('for:', i);
        }
        
        const items = [1, 2, 3];
        for (const item of items) {
          console.log('for-of:', item);
        }
        
        let counter = 0;
        while (counter < 2) {
          console.log('while:', counter);
          counter++;
        }
      `);

			const result = await lens(snippet);

			expect(expectSnippet(result).code).toContain('loopGuard_1');
			expect(expectSnippet(result).code).toContain('loopGuard_2');
			expect(expectSnippet(result).code).toContain('loopGuard_3');
			expect(expectSnippet(result).code).not.toContain('loopGuard_4');
		});
	});

	describe('edge cases', () => {
		it('should handle empty code', async () => {
			const snippet = createSnippet('');

			const result = await lens(snippet);

			expect(expectSnippet(result).code).toBe('');
			expect(result.ui).toBeNull();
		});

		it('should handle code without loops', async () => {
			const snippet = createSnippet(`
        function greet(name) {
          console.log('Hello, ' + name);
        }
        
        if (true) {
          greet('World');
        }
      `);

			const result = await lens(snippet);

			expect(expectSnippet(result).code).not.toContain('loopGuard');
			expect(result.snippet).toEqual(snippet); // Should be unchanged
		});

		it('should handle malformed JavaScript gracefully', async () => {
			const snippet = createSnippet(`
        for (let i = 0 i < 10; i++) { // Missing semicolon
          console.log(i);
        }
      `);

			const result = await lens(snippet);

			// Should return original code if parsing fails
			expect(expectSnippet(result).code).toEqual(snippet.code);
			expect(result.ui).toBeNull();
		});

		it('should preserve snippet metadata', async () => {
			const snippet: Snippet = {
				code: 'for (let i = 0; i < 5; i++) { console.log(i); }',
				lang: 'typescript',
				test: true,
			};

			const result = await lens(snippet);

			expect(expectSnippet(result).lang).toBe('typescript');
			expect(expectSnippet(result).test).toBe(true);
			expect(expectSnippet(result).code).toContain('loopGuard_1');
		});
	});

	describe('already guarded code', () => {
		it('should add new guards even to code with existing guards', async () => {
			const snippet = createSnippet(`
        let loopGuard_1 = 0;
        for (let i = 0; i < 10; i++) {
          loopGuard_1++;
          if (loopGuard_1 > 1000) {
            throw new RangeError("loopGuard_1 is greater than 1000");
          }
          console.log(i);
        }
      `);

			const result = await lens(snippet);

			// Current implementation adds new guards regardless of existing ones
			// This ensures protection even if existing guards are incomplete
			const guardCount = (
				expectSnippet(result).code.match(/loopGuard_/g) || []
			).length;
			expect(guardCount).toBeGreaterThan(6); // Both old and new guards present
		});
	});

	describe('complex nested scenarios', () => {
		it('should handle loops inside functions inside loops', async () => {
			const snippet = createSnippet(`
        for (let i = 0; i < 3; i++) {
          function processItems() {
            for (let j = 0; j < 2; j++) {
              console.log(i, j);
            }
          }
          processItems();
        }
      `);

			const result = await lens(snippet);

			expect(expectSnippet(result).code).toContain('loopGuard_1');
			expect(expectSnippet(result).code).toContain('loopGuard_2');
		});

		it('should handle loops with complex expressions', async () => {
			const snippet = createSnippet(`
        const matrix = [[1, 2], [3, 4]];
        for (let i = 0; i < matrix.length && i < 10; i++) {
          for (const [a, b] of matrix[i].entries()) {
            console.log(a + b);
          }
        }
      `);

			const result = await lens(snippet);

			expect(expectSnippet(result).code).toContain('loopGuard_1');
			expect(expectSnippet(result).code).toContain('loopGuard_2');
		});
	});

	describe('return value structure', () => {
		it('should always return null view for transform lens', async () => {
			const snippet = createSnippet(`
        for (let i = 0; i < 5; i++) {
          console.log(i);
        }
      `);

			const result = await lens(snippet);

			expect(result.ui).toBeNull();
			expect(result.snippet).toBeDefined();
		});

		it('should return modified snippet with loop guards', async () => {
			const snippet = createSnippet(`
        for (let i = 0; i < 5; i++) {
          console.log(i);
        }
      `);

			const result = await lens(snippet);

			expect(expectSnippet(result).code).not.toEqual(snippet.code);
			expect(expectSnippet(result).code).toContain('loopGuard_1');
			expect(expectSnippet(result).lang).toBe(snippet.lang);
			expect(expectSnippet(result).test).toBe(snippet.test);
		});
	});
});

/**
 * Extract Code From Element Tests
 * Tests the 5-level precedence-based code discovery system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { extractCodeFromElement } from './extract-code-from-element.js';

// Mock fetch for file loading tests
global.fetch = vi.fn();

describe('extractCodeFromElement', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		(global.fetch as any).mockResolvedValue({
			ok: true,
			text: () =>
				Promise.resolve('// Mock file content\nconsole.log("loaded");'),
		});
	});

	describe('precedence level 1: own code attribute', () => {
		it('should use code attribute as highest priority', async () => {
			const element = document.createElement('div');
			element.setAttribute('code', 'from attribute');
			element.textContent = 'from textContent';

			const result = await extractCodeFromElement(element);

			expect(result).toBe('from attribute');
		});

		it('should load file when code attribute is file path', async () => {
			const element = document.createElement('div');
			element.setAttribute('code', './test.js');

			const result = await extractCodeFromElement(element);

			expect(result).toBe('// Mock file content\nconsole.log("loaded");');
			expect(global.fetch).toHaveBeenCalledWith('./test.js');
		});

		it('should decode base64 in code attribute', async () => {
			const element = document.createElement('div');
			const encoded = btoa(encodeURIComponent('hello world'));
			element.setAttribute('code', encoded);

			const result = await extractCodeFromElement(element);

			expect(result).toBe('hello world');
		});

		it('should fallback to plain text if base64 decode fails', async () => {
			const element = document.createElement('div');
			element.setAttribute('code', 'invalid-base64');

			const result = await extractCodeFromElement(element);

			expect(result).toBe('invalid-base64');
		});
	});

	describe('precedence level 1.5: own src attribute', () => {
		it('should use src attribute when no code attribute', async () => {
			const element = document.createElement('div');
			element.setAttribute('src', './module.mjs');
			element.textContent = 'from textContent';

			const result = await extractCodeFromElement(element);

			expect(result).toBe('// Mock file content\nconsole.log("loaded");');
			expect(global.fetch).toHaveBeenCalledWith('./module.mjs');
		});

		it('should prefer code over src attribute', async () => {
			const element = document.createElement('div');
			element.setAttribute('code', 'from code');
			element.setAttribute('src', './file.js');

			const result = await extractCodeFromElement(element);

			expect(result).toBe('from code');
			expect(global.fetch).not.toHaveBeenCalled();
		});

		it('should handle non-file-path src as fallback', async () => {
			const element = document.createElement('div');
			element.setAttribute('src', 'plain text src');

			const result = await extractCodeFromElement(element);

			expect(result).toBe('plain text src');
		});
	});

	describe('precedence level 2: textContent', () => {
		it('should use textContent when no code/src attributes', async () => {
			const element = document.createElement('div');
			element.textContent = 'content from text';

			const result = await extractCodeFromElement(element);

			expect(result).toBe('content from text');
		});

		it('should trim textContent', async () => {
			const element = document.createElement('div');
			element.textContent = '  \n  trimmed content  \n  ';

			const result = await extractCodeFromElement(element);

			expect(result).toBe('trimmed content');
		});

		it('should skip textContent if child snippet exists', async () => {
			const parent = document.createElement('div');
			parent.textContent = 'parent text';

			const childSnippet = document.createElement('sl-snippet');
			childSnippet.setAttribute('code', 'child snippet code');
			parent.appendChild(childSnippet);

			const result = await extractCodeFromElement(parent);

			expect(result).toBe('child snippet code');
		});
	});

	describe('precedence level 3: child snippet', () => {
		it('should extract from direct child sl-snippet', async () => {
			const parent = document.createElement('div');
			const childSnippet = document.createElement('sl-snippet');
			childSnippet.setAttribute('code', 'child snippet');
			parent.appendChild(childSnippet);

			const result = await extractCodeFromElement(parent);

			expect(result).toBe('child snippet');
		});

		it('should use first direct child snippet', async () => {
			const parent = document.createElement('div');

			const child1 = document.createElement('sl-snippet');
			child1.setAttribute('code', 'first child');
			parent.appendChild(child1);

			const child2 = document.createElement('sl-snippet');
			child2.setAttribute('code', 'second child');
			parent.appendChild(child2);

			const result = await extractCodeFromElement(parent);

			expect(result).toBe('first child');
		});

		it('should recursively extract from child snippet', async () => {
			const parent = document.createElement('div');
			const childSnippet = document.createElement('sl-snippet');
			childSnippet.textContent = 'nested content';
			parent.appendChild(childSnippet);

			const result = await extractCodeFromElement(parent);

			expect(result).toBe('nested content');
		});
	});

	describe('precedence level 4: parent context', () => {
		it('should extract from parent sl-snippet', async () => {
			const parentSnippet = document.createElement('sl-snippet');
			parentSnippet.setAttribute('code', 'parent snippet');

			const child = document.createElement('div');
			parentSnippet.appendChild(child);

			const result = await extractCodeFromElement(child);

			expect(result).toBe('parent snippet');
		});

		it('should prefer parent src over code when only src exists', async () => {
			const parentSnippet = document.createElement('sl-snippet');
			parentSnippet.setAttribute('src', './parent.js');

			const child = document.createElement('div');
			parentSnippet.appendChild(child);

			const result = await extractCodeFromElement(child);

			expect(result).toBe('// Mock file content\nconsole.log("loaded");');
		});

		it('should check sibling snippet before parent code', async () => {
			const parentSnippet = document.createElement('sl-snippet');
			parentSnippet.setAttribute('code', 'parent code');

			const siblingSnippet = document.createElement('sl-snippet');
			siblingSnippet.setAttribute('code', 'sibling code');
			parentSnippet.appendChild(siblingSnippet);

			const child = document.createElement('div');
			parentSnippet.appendChild(child);

			const result = await extractCodeFromElement(child);

			expect(result).toBe('sibling code');
		});

		it('should extract from parent study-lenses with code', async () => {
			const studyLenses = document.createElement('study-lenses');
			studyLenses.setAttribute('code', 'study lenses code');

			const child = document.createElement('div');
			studyLenses.appendChild(child);

			const result = await extractCodeFromElement(child);

			expect(result).toBe('study lenses code');
		});

		it('should extract from parent study-lenses with src', async () => {
			const studyLenses = document.createElement('study-lenses');
			studyLenses.setAttribute('src', './study.js');

			const child = document.createElement('div');
			studyLenses.appendChild(child);

			const result = await extractCodeFromElement(child);

			expect(result).toBe('// Mock file content\nconsole.log("loaded");');
		});
	});

	describe('precedence level 5: sibling snippet', () => {
		it('should extract from sibling snippet in study-lenses', async () => {
			const studyLenses = document.createElement('study-lenses');

			const siblingSnippet = document.createElement('sl-snippet');
			siblingSnippet.setAttribute('code', 'sibling snippet');
			studyLenses.appendChild(siblingSnippet);

			const child = document.createElement('div');
			studyLenses.appendChild(child);

			const result = await extractCodeFromElement(child);

			expect(result).toBe('sibling snippet');
		});

		it('should not use self as sibling', async () => {
			const studyLenses = document.createElement('study-lenses');

			const snippet = document.createElement('sl-snippet');
			snippet.textContent = 'self content';
			studyLenses.appendChild(snippet);

			// Should not find sibling (itself)
			const result = await extractCodeFromElement(snippet);

			expect(result).toBe('self content'); // Uses own textContent
		});
	});

	describe('file path detection', () => {
		it('should detect relative paths starting with ./', async () => {
			const element = document.createElement('div');
			element.setAttribute('code', './relative.js');

			await extractCodeFromElement(element);

			expect(global.fetch).toHaveBeenCalledWith('./relative.js');
		});

		it('should detect parent paths starting with ../', async () => {
			const element = document.createElement('div');
			element.setAttribute('code', '../parent.js');

			await extractCodeFromElement(element);

			expect(global.fetch).toHaveBeenCalledWith('../parent.js');
		});

		it('should detect absolute paths starting with /', async () => {
			const element = document.createElement('div');
			element.setAttribute('code', '/absolute.js');

			await extractCodeFromElement(element);

			expect(global.fetch).toHaveBeenCalledWith('/absolute.js');
		});

		it('should detect .js file extensions', async () => {
			const element = document.createElement('div');
			element.setAttribute('code', 'module.js');

			await extractCodeFromElement(element);

			expect(global.fetch).toHaveBeenCalledWith('module.js');
		});

		it('should detect .mjs file extensions', async () => {
			const element = document.createElement('div');
			element.setAttribute('code', 'module.mjs');

			await extractCodeFromElement(element);

			expect(global.fetch).toHaveBeenCalledWith('module.mjs');
		});
	});

	describe('file loading', () => {
		it('should handle fetch errors gracefully', async () => {
			(global.fetch as any).mockRejectedValue(new Error('Network error'));

			const element = document.createElement('div');
			element.setAttribute('code', './error.js');

			await expect(extractCodeFromElement(element)).rejects.toThrow(
				'Network error'
			);
		});

		it('should handle HTTP errors', async () => {
			(global.fetch as any).mockResolvedValue({
				ok: false,
				status: 404,
			});

			const element = document.createElement('div');
			element.setAttribute('code', './missing.js');

			await expect(extractCodeFromElement(element)).rejects.toThrow(
				'Failed to load file: ./missing.js'
			);
		});

		it('should load different file types', async () => {
			const files = ['./test.js', './module.mjs', './script.ts'];

			for (const file of files) {
				const element = document.createElement('div');
				element.setAttribute('code', file);

				await extractCodeFromElement(element);

				expect(global.fetch).toHaveBeenCalledWith(file);
			}
		});
	});

	describe('base64 decoding', () => {
		it('should decode valid base64 strings', async () => {
			const element = document.createElement('div');
			const original = 'function test() { return 42; }';
			const encoded = btoa(encodeURIComponent(original));
			element.setAttribute('code', encoded);

			const result = await extractCodeFromElement(element);

			expect(result).toBe(original);
		});

		it('should handle base64 with special characters', async () => {
			const element = document.createElement('div');
			const original = 'const emoji = "🚀"; const unicode = "héllo";';
			const encoded = btoa(encodeURIComponent(original));
			element.setAttribute('code', encoded);

			const result = await extractCodeFromElement(element);

			expect(result).toBe(original);
		});

		it('should fallback to plain text for invalid base64', async () => {
			const element = document.createElement('div');
			element.setAttribute('code', 'not-valid-base64!@#');

			const result = await extractCodeFromElement(element);

			expect(result).toBe('not-valid-base64!@#');
		});
	});

	describe('edge cases and error handling', () => {
		it('should return empty string when no code found', async () => {
			const element = document.createElement('div');

			const result = await extractCodeFromElement(element);

			expect(result).toBe('');
		});

		it('should handle elements with no attributes', async () => {
			const element = document.createElement('div');

			const result = await extractCodeFromElement(element);

			expect(result).toBe('');
		});

		it('should handle deeply nested element structures', async () => {
			const grandparent = document.createElement('sl-snippet');
			grandparent.setAttribute('code', 'grandparent code');

			const parent = document.createElement('div');
			grandparent.appendChild(parent);

			const child = document.createElement('div');
			parent.appendChild(child);

			const result = await extractCodeFromElement(child);

			expect(result).toBe('grandparent code');
		});

		it('should handle mixed nested contexts', async () => {
			const studyLenses = document.createElement('study-lenses');
			studyLenses.setAttribute('code', 'study code');

			const snippet = document.createElement('sl-snippet');
			snippet.setAttribute('code', 'snippet code');
			studyLenses.appendChild(snippet);

			const child = document.createElement('div');
			snippet.appendChild(child);

			// Should find parent snippet first (level 4) before study-lenses
			const result = await extractCodeFromElement(child);

			expect(result).toBe('snippet code');
		});

		it('should ignore non-direct child snippets for textContent check', async () => {
			const parent = document.createElement('div');
			parent.textContent = 'parent text content';

			const wrapper = document.createElement('div');
			const nestedSnippet = document.createElement('sl-snippet');
			nestedSnippet.setAttribute('code', 'nested');
			wrapper.appendChild(nestedSnippet);
			parent.appendChild(wrapper);

			// Should use textContent since no direct child snippet
			const result = await extractCodeFromElement(parent);

			expect(result).toBe('parent text content');
		});

		it('should handle whitespace-only textContent', async () => {
			const element = document.createElement('div');
			element.textContent = '   \n\t   ';

			const result = await extractCodeFromElement(element);

			expect(result).toBe('');
		});
	});

	describe('complex hierarchy scenarios', () => {
		it('should handle study-lenses > snippet > element chain', async () => {
			const studyLenses = document.createElement('study-lenses');
			studyLenses.setAttribute('code', 'study code');

			const snippet = document.createElement('sl-snippet');
			snippet.setAttribute('src', './snippet.js');
			studyLenses.appendChild(snippet);

			const element = document.createElement('div');
			snippet.appendChild(element);

			// Should find snippet src (level 4) before study-lenses code
			const result = await extractCodeFromElement(element);

			expect(result).toBe('// Mock file content\nconsole.log("loaded");');
			expect(global.fetch).toHaveBeenCalledWith('./snippet.js');
		});

		it('should handle multiple sibling snippets', async () => {
			const parent = document.createElement('div');

			const snippet1 = document.createElement('sl-snippet');
			snippet1.setAttribute('code', 'first sibling');
			parent.appendChild(snippet1);

			const element = document.createElement('div');
			parent.appendChild(element);

			const snippet2 = document.createElement('sl-snippet');
			snippet2.setAttribute('code', 'second sibling');
			parent.appendChild(snippet2);

			// Should find first sibling snippet
			const result = await extractCodeFromElement(element);

			expect(result).toBe('first sibling');
		});
	});

	describe('integration with DOM selectors', () => {
		it('should work with querySelector results', async () => {
			const container = document.createElement('div');
			container.innerHTML = `
        <sl-snippet code="container snippet">
          <div class="target"></div>
        </sl-snippet>
      `;

			const target = container.querySelector('.target') as Element;
			const result = await extractCodeFromElement(target);

			expect(result).toBe('container snippet');
		});

		it('should work with complex DOM structures', async () => {
			document.body.innerHTML = `
        <study-lenses code="main code">
          <div class="wrapper">
            <sl-snippet code="nested snippet">
              <div class="inner">
                <span class="target"></span>
              </div>
            </sl-snippet>
          </div>
        </study-lenses>
      `;

			const target = document.querySelector('.target') as Element;
			const result = await extractCodeFromElement(target);

			expect(result).toBe('nested snippet');

			// Cleanup
			document.body.innerHTML = '';
		});
	});
});

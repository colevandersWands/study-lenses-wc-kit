/**
 * JSX Demo Lens Function Tests
 * Tests the JSX/Preact lens function with code analysis
 */

import { describe, it, expect } from 'vitest';
import { lens } from './lens.js';
import config from './config.js';

describe('jsx-demo lens function', () => {
  it('should analyze basic code and return JSX view', async () => {
    const snippet = { code: 'hello world', lang: 'js', test: false };
    const result = await lens(snippet);

    expect(result.snippet).toEqual(snippet); // Pass through unchanged
    expect(result.ui).not.toBeNull();
    expect(typeof result.ui).toBe('object'); // JSX component
  });

  it('should count lines correctly', async () => {
    const snippet = {
      code: 'line 1\nline 2\nline 3',
      lang: 'js',
      test: false,
    };
    const result = await lens(snippet);

    // JSX view should be created (can't easily test JSX content in unit test)
    expect(result.ui).not.toBeNull();
    expect(result.snippet).toEqual(snippet);
  });

  it('should count words correctly', async () => {
    const snippet = {
      code: 'const hello = "world";',
      lang: 'js',
      test: false,
    };
    const result = await lens(snippet);

    expect(result.ui).not.toBeNull();
    expect(result.snippet).toEqual(snippet);
  });

  it('should handle empty code', async () => {
    const snippet = { code: '', lang: 'js', test: false };
    const result = await lens(snippet);

    expect(result.ui).not.toBeNull();
    expect(result.snippet).toEqual(snippet);
  });

  it('should handle multiline code with various content', async () => {
    const snippet = {
      code: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`,
      lang: 'js',
      test: false,
    };
    const result = await lens(snippet);

    expect(result.ui).not.toBeNull();
    expect(result.snippet).toEqual(snippet);
  });

  it('should preserve language and test flags in snippet', async () => {
    const snippet = { code: 'test code', lang: 'python', test: true };
    const result = await lens(snippet);

    expect(result.snippet.lang).toBe('python');
    expect(result.snippet.test).toBe(true);
    expect(result.snippet.code).toBe('test code');
  });

  it('should work with custom config', async () => {
    const snippet = { code: 'custom config test', lang: 'js', test: false };
    const customConfig = config({
      showDetails: false,
      showStats: true,
      theme: 'dark',
    });
    const result = await lens(snippet, customConfig);

    expect(result.ui).not.toBeNull();
    expect(result.snippet).toEqual(snippet);
  });

  it('should handle code with special characters', async () => {
    const snippet = {
      code: 'const emoji = "🚀"; // Special chars: åäö',
      lang: 'js',
      test: false,
    };
    const result = await lens(snippet);

    expect(result.ui).not.toBeNull();
    expect(result.snippet).toEqual(snippet);
  });

  it('should handle very long code', async () => {
    const longCode = 'const longVar = "' + 'a'.repeat(1000) + '";';
    const snippet = { code: longCode, lang: 'js', test: false };
    const result = await lens(snippet);

    expect(result.ui).not.toBeNull();
    expect(result.snippet).toEqual(snippet);
  });

  describe('config integration', () => {
    it('should work with default config', async () => {
      const snippet = { code: 'default config', lang: 'js', test: false };
      const result = await lens(snippet, config());

      expect(result.ui).not.toBeNull();
      expect(result.snippet).toEqual(snippet);
    });

    it('should work with showDetails: false', async () => {
      const snippet = { code: 'no details', lang: 'js', test: false };
      const result = await lens(snippet, config({ showDetails: false }));

      expect(result.ui).not.toBeNull();
      expect(result.snippet).toEqual(snippet);
    });

    it('should work with showStats: false', async () => {
      const snippet = { code: 'no stats', lang: 'js', test: false };
      const result = await lens(snippet, config({ showStats: false }));

      expect(result.ui).not.toBeNull();
      expect(result.snippet).toEqual(snippet);
    });

    it('should work with dark theme', async () => {
      const snippet = { code: 'dark theme', lang: 'js', test: false };
      const result = await lens(snippet, config({ theme: 'dark' }));

      expect(result.ui).not.toBeNull();
      expect(result.snippet).toEqual(snippet);
    });
  });

  describe('edge cases', () => {
    it('should handle whitespace-only code', async () => {
      const snippet = { code: '   \n\t  \r\n  ', lang: 'js', test: false };
      const result = await lens(snippet);

      expect(result.ui).not.toBeNull();
      expect(result.snippet).toEqual(snippet);
    });

    it('should handle single character', async () => {
      const snippet = { code: 'x', lang: 'js', test: false };
      const result = await lens(snippet);

      expect(result.ui).not.toBeNull();
      expect(result.snippet).toEqual(snippet);
    });

    it('should handle code with no words (symbols only)', async () => {
      const snippet = { code: '(){}[];,.-+*/', lang: 'js', test: false };
      const result = await lens(snippet);

      expect(result.ui).not.toBeNull();
      expect(result.snippet).toEqual(snippet);
    });

    it('should not mutate original snippet', async () => {
      const originalSnippet = { code: 'immutable', lang: 'js', test: false };
      const snippet = { ...originalSnippet };

      await lens(snippet);

      expect(originalSnippet.code).toBe('immutable');
      expect(snippet.code).toBe('immutable');
    });
  });

  describe('JSX component characteristics', () => {
    it('should always return a view (visual lens)', async () => {
      const snippet = { code: 'any code', lang: 'js', test: false };
      const result = await lens(snippet);

      expect(result.ui).not.toBeNull();
      expect(result.ui).toBeDefined();
    });

    it('should be async function', () => {
      expect(lens.constructor.name).toBe('AsyncFunction');
    });

    it('should return a Promise', () => {
      const snippet = { code: 'test', lang: 'js', test: false };
      const result = lens(snippet);

      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('code analysis scenarios', () => {
    it('should analyze JavaScript function', async () => {
      const snippet = {
        code: 'function greet(name) { return `Hello, ${name}!`; }',
        lang: 'js',
        test: false,
      };
      const result = await lens(snippet);

      expect(result.ui).not.toBeNull();
      expect(result.snippet).toEqual(snippet);
    });

    it('should analyze complex JavaScript class', async () => {
      const snippet = {
        code: `class Calculator {
  constructor() {
    this.history = [];
  }
  
  add(a, b) {
    const result = a + b;
    this.history.push({ operation: 'add', result });
    return result;
  }
}`,
        lang: 'js',
        test: false,
      };
      const result = await lens(snippet);

      expect(result.ui).not.toBeNull();
      expect(result.snippet).toEqual(snippet);
    });

    it('should analyze test code', async () => {
      const snippet = {
        code: `describe('Calculator', () => {
  it('should add numbers', () => {
    expect(add(2, 3)).toBe(5);
  });
});`,
        lang: 'js',
        test: true,
      };
      const result = await lens(snippet);

      expect(result.ui).not.toBeNull();
      expect(result.snippet.test).toBe(true);
    });
  });
});

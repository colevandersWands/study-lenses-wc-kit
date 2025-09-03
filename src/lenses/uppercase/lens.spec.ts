/**
 * Uppercase Lens Function Tests
 * Tests the uppercase transformation lens function
 */

import { describe, it, expect } from 'vitest';
import { lens } from './lens.js';
import config from './config.js';

describe('uppercase lens function', () => {
  it('should convert code to uppercase', () => {
    const snippet = { code: 'hello world', lang: 'js', test: false };
    const result = lens(snippet);

    expect(result.snippet.code).toBe('HELLO WORLD');
    expect(result.snippet.lang).toBe('js');
    expect(result.snippet.test).toBe(false);
    expect(result.view).toBeNull();
  });

  it('should handle mixed case code', () => {
    const snippet = { code: 'HeLLo WoRLd', lang: 'js', test: false };
    const result = lens(snippet);

    expect(result.snippet.code).toBe('HELLO WORLD');
  });

  it('should preserve already uppercase code', () => {
    const snippet = { code: 'HELLO WORLD', lang: 'js', test: false };
    const result = lens(snippet);

    expect(result.snippet.code).toBe('HELLO WORLD');
  });

  it('should handle empty code', () => {
    const snippet = { code: '', lang: 'js', test: false };
    const result = lens(snippet);

    expect(result.snippet.code).toBe('');
    expect(result.snippet.lang).toBe('js');
    expect(result.view).toBeNull();
  });

  it('should handle code with numbers and symbols', () => {
    const snippet = { code: 'function test123() { return 42; }', lang: 'js', test: false };
    const result = lens(snippet);

    expect(result.snippet.code).toBe('FUNCTION TEST123() { RETURN 42; }');
  });

  it('should handle multiline code', () => {
    const snippet = {
      code: 'function test() {\n  console.log("hello");\n  return true;\n}',
      lang: 'js',
      test: false,
    };
    const result = lens(snippet);

    expect(result.snippet.code).toBe(
      'FUNCTION TEST() {\n  CONSOLE.LOG("HELLO");\n  RETURN TRUE;\n}'
    );
  });

  it('should preserve language and test flags', () => {
    const snippet = { code: 'test code', lang: 'python', test: true };
    const result = lens(snippet);

    expect(result.snippet.code).toBe('TEST CODE');
    expect(result.snippet.lang).toBe('python');
    expect(result.snippet.test).toBe(true);
  });

  it('should work with custom config', () => {
    const snippet = { code: 'hello config', lang: 'js', test: false };
    const customConfig = config({ custom: true });
    const result = lens(snippet, customConfig);

    expect(result.snippet.code).toBe('HELLO CONFIG');
    expect(result.view).toBeNull();
  });

  it('should handle unicode characters', () => {
    const snippet = { code: 'héllo wörld', lang: 'js', test: false };
    const result = lens(snippet);

    expect(result.snippet.code).toBe('HÉLLO WÖRLD');
  });

  it('should always return null view (transform lens)', () => {
    const snippet = { code: 'any code', lang: 'js', test: false };
    const result = lens(snippet);

    expect(result.view).toBeNull();
  });

  describe('config integration', () => {
    it('should work with default config', () => {
      const snippet = { code: 'default config', lang: 'js', test: false };
      const result = lens(snippet, config());

      expect(result.snippet.code).toBe('DEFAULT CONFIG');
    });

    it('should work with undefined config', () => {
      const snippet = { code: 'undefined config', lang: 'js', test: false };
      const result = lens(snippet, undefined);

      expect(result.snippet.code).toBe('UNDEFINED CONFIG');
    });
  });

  describe('edge cases', () => {
    it('should handle special characters and whitespace', () => {
      const snippet = { code: '  \t\nhello\r\n  world  \t  ', lang: 'js', test: false };
      const result = lens(snippet);

      expect(result.snippet.code).toBe('  \t\nHELLO\r\n  WORLD  \t  ');
    });

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(10000);
      const snippet = { code: longString, lang: 'js', test: false };
      const result = lens(snippet);

      expect(result.snippet.code).toBe('A'.repeat(10000));
    });

    it('should not mutate original snippet', () => {
      const originalSnippet = { code: 'immutable', lang: 'js', test: false };
      const snippet = { ...originalSnippet };

      lens(snippet);

      expect(originalSnippet.code).toBe('immutable');
      expect(snippet.code).toBe('immutable'); // Lens should not mutate input
    });
  });

  describe('javascript code examples', () => {
    it('should uppercase JavaScript keywords', () => {
      const snippet = {
        code: 'const myVar = function(param) { return param + 1; }',
        lang: 'js',
        test: false,
      };
      const result = lens(snippet);

      expect(result.snippet.code).toBe('CONST MYVAR = FUNCTION(PARAM) { RETURN PARAM + 1; }');
    });

    it('should uppercase class definitions', () => {
      const snippet = {
        code: 'class MyClass extends BaseClass { constructor() { super(); } }',
        lang: 'js',
        test: false,
      };
      const result = lens(snippet);

      expect(result.snippet.code).toBe(
        'CLASS MYCLASS EXTENDS BASECLASS { CONSTRUCTOR() { SUPER(); } }'
      );
    });

    it('should uppercase arrow functions', () => {
      const snippet = {
        code: 'const add = (a, b) => a + b;',
        lang: 'js',
        test: false,
      };
      const result = lens(snippet);

      expect(result.snippet.code).toBe('CONST ADD = (A, B) => A + B;');
    });
  });
});

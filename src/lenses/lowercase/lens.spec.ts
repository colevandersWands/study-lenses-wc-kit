/**
 * Lowercase Lens Function Tests
 * Tests the lowercase transformation lens function
 */

import { describe, it, expect } from 'vitest';
import { lens } from './lens.js';
import config from './config.js';

describe('lowercase lens function', () => {
  it('should convert code to lowercase', () => {
    const snippet = { code: 'HELLO WORLD', lang: 'js', test: false };
    const result = lens(snippet);

    expect(result.snippet.code).toBe('hello world');
    expect(result.snippet.lang).toBe('js');
    expect(result.snippet.test).toBe(false);
    expect(result.view).toBeNull();
  });

  it('should handle mixed case code', () => {
    const snippet = { code: 'HeLLo WoRLd', lang: 'js', test: false };
    const result = lens(snippet);

    expect(result.snippet.code).toBe('hello world');
  });

  it('should preserve already lowercase code', () => {
    const snippet = { code: 'hello world', lang: 'js', test: false };
    const result = lens(snippet);

    expect(result.snippet.code).toBe('hello world');
  });

  it('should handle empty code', () => {
    const snippet = { code: '', lang: 'js', test: false };
    const result = lens(snippet);

    expect(result.snippet.code).toBe('');
    expect(result.snippet.lang).toBe('js');
    expect(result.view).toBeNull();
  });

  it('should handle code with numbers and symbols', () => {
    const snippet = { code: 'FUNCTION test123() { RETURN 42; }', lang: 'js', test: false };
    const result = lens(snippet);

    expect(result.snippet.code).toBe('function test123() { return 42; }');
  });

  it('should handle multiline code', () => {
    const snippet = {
      code: 'FUNCTION TEST() {\n  CONSOLE.LOG("HELLO");\n  RETURN TRUE;\n}',
      lang: 'js',
      test: false,
    };
    const result = lens(snippet);

    expect(result.snippet.code).toBe(
      'function test() {\n  console.log("hello");\n  return true;\n}'
    );
  });

  it('should preserve language and test flags', () => {
    const snippet = { code: 'TEST CODE', lang: 'python', test: true };
    const result = lens(snippet);

    expect(result.snippet.code).toBe('test code');
    expect(result.snippet.lang).toBe('python');
    expect(result.snippet.test).toBe(true);
  });

  it('should work with custom config', () => {
    const snippet = { code: 'HELLO CONFIG', lang: 'js', test: false };
    const customConfig = config({ custom: true });
    const result = lens(snippet, customConfig);

    expect(result.snippet.code).toBe('hello config');
    expect(result.view).toBeNull();
  });

  it('should handle unicode characters', () => {
    const snippet = { code: 'HÉLLO WÖRLD', lang: 'js', test: false };
    const result = lens(snippet);

    expect(result.snippet.code).toBe('héllo wörld');
  });

  it('should always return null view (transform lens)', () => {
    const snippet = { code: 'ANY CODE', lang: 'js', test: false };
    const result = lens(snippet);

    expect(result.view).toBeNull();
  });

  describe('config integration', () => {
    it('should work with default config', () => {
      const snippet = { code: 'DEFAULT CONFIG', lang: 'js', test: false };
      const result = lens(snippet, config());

      expect(result.snippet.code).toBe('default config');
    });

    it('should work with undefined config', () => {
      const snippet = { code: 'UNDEFINED CONFIG', lang: 'js', test: false };
      const result = lens(snippet, undefined);

      expect(result.snippet.code).toBe('undefined config');
    });
  });

  describe('edge cases', () => {
    it('should handle special characters and whitespace', () => {
      const snippet = { code: '  \t\nHELLO\r\n  WORLD  \t  ', lang: 'js', test: false };
      const result = lens(snippet);

      expect(result.snippet.code).toBe('  \t\nhello\r\n  world  \t  ');
    });

    it('should handle very long strings', () => {
      const longString = 'A'.repeat(10000);
      const snippet = { code: longString, lang: 'js', test: false };
      const result = lens(snippet);

      expect(result.snippet.code).toBe('a'.repeat(10000));
    });

    it('should not mutate original snippet', () => {
      const originalSnippet = { code: 'IMMUTABLE', lang: 'js', test: false };
      const snippet = { ...originalSnippet };

      lens(snippet);

      expect(originalSnippet.code).toBe('IMMUTABLE');
      expect(snippet.code).toBe('IMMUTABLE'); // Lens should not mutate input
    });
  });
});

/**
 * Study Pipeline Function Tests
 * Tests the smart pipeline processing with LensSpec patterns and terminus conditions
 */

import { describe, it, expect, vi } from 'vitest';
import { pipe, validatePipelineInput } from './pipe.js';
import type { Snippet, LensFunction, LensObject } from '../types.js';

describe('study pipe function', () => {
  // Helper test lenses
  const reverseTransform: LensFunction = (snippet) => ({
    snippet: { ...snippet, code: snippet.code.split('').reverse().join('') },
    ui: null,
  });

  const uppercaseTransform: LensFunction = (snippet) => ({
    snippet: { ...snippet, code: snippet.code.toUpperCase() },
    ui: null,
  });

  const viewLens: LensFunction = (snippet) => {
    const div = document.createElement('div');
    div.textContent = `View: ${snippet.code}`;
    return {
      snippet,
      ui: div,
    };
  };

  const sideEffectLens: LensFunction = (snippet) => ({
    snippet: null, // Side effect - returns falsey
    ui: null,
  });

  const mockLensObject: LensObject = {
    name: 'mock-lens',
    lens: reverseTransform,
    ui: class MockView {},
    config: (overrides = {}) => ({ ...{ default: true }, ...overrides }),
  };

  const testSnippet: Snippet = { code: 'hello', lang: 'js', test: false };

  describe('LensSpec Pattern 1: Simple functions', () => {
    it('should process single function lens', async () => {
      const result = await pipe(testSnippet, [reverseTransform]);

      expect(result.snippet.code).toBe('olleh');
      expect(result.ui).toBeNull();
    });

    it('should process multiple function lenses sequentially', async () => {
      const result = await pipe(testSnippet, [reverseTransform, uppercaseTransform]);

      expect(result.snippet.code).toBe('OLLEH');
      expect(result.ui).toBeNull();
    });
  });

  describe('LensSpec Pattern 2: Lens objects', () => {
    it('should process lens object with default config', async () => {
      const result = await pipe(testSnippet, [mockLensObject]);

      expect(result.snippet.code).toBe('olleh');
      expect(result.ui).toBeNull();
    });

    it('should use lens object config factory', async () => {
      // Config factory should be called during processing
      const mockWithConfigSpy = {
        ...mockLensObject,
        config: vi.fn().mockReturnValue({ custom: true }),
      };

      await pipe(testSnippet, [mockWithConfigSpy]);

      expect(mockWithConfigSpy.config).toHaveBeenCalled();
    });
  });

  describe('LensSpec Pattern 3: [function, config]', () => {
    it('should process function with custom config', async () => {
      const configAwareLens: LensFunction = (snippet, config) => ({
        snippet: {
          ...snippet,
          code: config?.prefix ? `${config.prefix}${snippet.code}` : snippet.code,
        },
        ui: null,
      });

      const result = await pipe(testSnippet, [[configAwareLens, { prefix: 'TEST:' }]]);

      expect(result.snippet.code).toBe('TEST:hello');
    });
  });

  describe('LensSpec Pattern 4: [lensObject, config]', () => {
    it('should process lens object with config override', async () => {
      const configMergeLens = {
        name: 'config-merge',
        lens: (snippet: any, config: any) => ({
          snippet: {
            ...snippet,
            code: `${snippet.code}-${config?.suffix || 'default'}`,
          },
          ui: null,
        }),
        ui: class ConfigMergeView {},
        config: (overrides = {}) => ({ suffix: 'base', ...overrides }),
      };

      const result = await pipe(testSnippet, [[configMergeLens, { suffix: 'override' }]]);

      expect(result.snippet.code).toBe('hello-override');
    });
  });

  describe('Mixed LensSpec patterns', () => {
    it('should handle all 4 patterns in same pipeline', async () => {
      const customLens: LensFunction = (snippet) => ({
        snippet: { ...snippet, code: snippet.code + '1' },
        ui: null,
      });

      const result = await pipe(testSnippet, [
        customLens, // Pattern 1: Function
        mockLensObject, // Pattern 2: Lens object
        [customLens, {}], // Pattern 3: [function, config]
        [mockLensObject, { custom: true }], // Pattern 4: [lensObject, config]
      ]);

      // hello -> hello1 -> 1olleh -> 1olleh1 -> 1hel1o1
      expect(result.snippet.code).toBe('1hel1o1');
    });
  });

  describe('Terminus condition 1: View returned', () => {
    it('should stop pipeline when view is returned', async () => {
      const result = await pipe(testSnippet, [
        reverseTransform, // Should execute: hello -> olleh
        viewLens, // Should execute and terminate
        uppercaseTransform, // Should NOT execute
      ]);

      expect(result.snippet.code).toBe('olleh');
      expect(result.ui).not.toBeNull();
      expect(result.ui).toBeInstanceOf(HTMLElement);
    });

    it('should return the view element', async () => {
      const result = await pipe(testSnippet, [viewLens]);

      expect(result.ui).toBeInstanceOf(HTMLElement);
      expect((result.ui as HTMLElement).textContent).toBe('View: hello');
    });
  });

  describe('Terminus condition 2: Side effect completed', () => {
    it('should stop pipeline when falsey snippet is returned', async () => {
      const result = await pipe(testSnippet, [
        reverseTransform, // Should execute: hello -> olleh
        sideEffectLens, // Should execute and terminate
        uppercaseTransform, // Should NOT execute
      ]);

      // Should return pre-side-effect snippet
      expect(result.snippet.code).toBe('olleh');
      expect(result.ui).toBeNull();
    });

    it('should handle various falsey values', async () => {
      const nullLens: LensFunction = () => ({ snippet: null, ui: null });
      const undefinedLens: LensFunction = () => ({ snippet: undefined, ui: null });
      const falseLens: LensFunction = () => ({ snippet: false, ui: null });

      const result1 = await pipe(testSnippet, [nullLens]);
      const result2 = await pipe(testSnippet, [undefinedLens]);
      const result3 = await pipe(testSnippet, [falseLens]);

      expect(result1.snippet).toEqual(testSnippet); // Pre-side-effect
      expect(result2.snippet).toEqual(testSnippet);
      expect(result3.snippet).toEqual(testSnippet);
    });
  });

  describe('Pipeline completion without terminus', () => {
    it('should return final snippet when no terminus', async () => {
      const result = await pipe(testSnippet, [reverseTransform, uppercaseTransform]);

      expect(result.snippet.code).toBe('OLLEH');
      expect(result.ui).toBeNull();
    });

    it('should handle empty lens array', async () => {
      const result = await pipe(testSnippet, []);

      expect(result.snippet).toEqual(testSnippet);
      expect(result.ui).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('should fail fast on lens error', async () => {
      const errorLens: LensFunction = () => {
        throw new Error('Test error');
      };

      await expect(
        pipe(testSnippet, [reverseTransform, errorLens, uppercaseTransform])
      ).rejects.toThrow('Lens "errorLens" failed: Test error');
    });

    it('should include lens name in error message', async () => {
      const namedErrorLens = function namedError() {
        throw new Error('Named error');
      };

      await expect(pipe(testSnippet, [namedErrorLens])).rejects.toThrow(
        'Lens "namedError" failed: Named error'
      );
    });

    it('should handle lens object errors', async () => {
      const errorLensObject = {
        name: 'error-lens',
        lens: () => {
          throw new Error('Object error');
        },
        ui: class ErrorView {},
        config: () => ({}),
      };

      await expect(pipe(testSnippet, [errorLensObject])).rejects.toThrow(
        'Lens "error-lens" failed: Object error'
      );
    });
  });

  describe('snippet immutability', () => {
    it('should not mutate original snippet', async () => {
      const originalSnippet = { code: 'immutable', lang: 'js', test: false };
      const testSnippet = { ...originalSnippet };

      await pipe(testSnippet, [reverseTransform, uppercaseTransform]);

      expect(originalSnippet.code).toBe('immutable');
      expect(testSnippet.code).toBe('immutable');
    });
  });

  describe('async lens support', () => {
    it('should handle async lenses', async () => {
      const asyncLens: LensFunction = async (snippet) => {
        await new Promise((resolve) => setTimeout(resolve, 1)); // Small delay
        return {
          snippet: { ...snippet, code: snippet.code + '-async' },
          ui: null,
        };
      };

      const result = await pipe(testSnippet, [asyncLens, uppercaseTransform]);

      expect(result.snippet.code).toBe('HELLO-ASYNC');
    });
  });
});

describe('validatePipelineInput', () => {
  const testSnippet: Snippet = { code: 'test', lang: 'js', test: false };
  const validLens: LensFunction = (snippet) => ({ snippet, ui: null });
  const validLensObject: LensObject = {
    name: 'valid',
    lens: validLens,
    ui: class ValidView {},
    config: () => ({}),
  };

  it('should return no errors for valid input', () => {
    const errors = validatePipelineInput(testSnippet, [validLens]);

    expect(errors).toEqual([]);
  });

  it('should validate snippet code is required', () => {
    const invalidSnippet = { code: '', lang: 'js', test: false };
    const errors = validatePipelineInput(invalidSnippet, [validLens]);

    expect(errors).toContain('Snippet code is required');
  });

  it('should validate at least one lens is required', () => {
    const errors = validatePipelineInput(testSnippet, []);

    expect(errors).toContain('At least one lens is required');
  });

  it('should validate function lenses', () => {
    const errors = validatePipelineInput(testSnippet, [null as any]);

    expect(errors[0]).toContain('function is null or undefined');
  });

  it('should validate lens objects have lens function', () => {
    const invalidLensObject = { name: 'invalid' } as any;
    const errors = validatePipelineInput(testSnippet, [invalidLensObject]);

    expect(errors[0]).toContain('lens object missing valid .lens function');
  });

  it('should validate [function, config] pattern', () => {
    const errors = validatePipelineInput(testSnippet, [[null as any, {}]]);

    expect(errors[0]).toContain('function is null or undefined');
  });

  it('should validate [lensObject, config] pattern', () => {
    const invalidLensObject = { name: 'invalid' } as any;
    const errors = validatePipelineInput(testSnippet, [[invalidLensObject, {}]]);

    expect(errors[0]).toContain('lens object missing valid .lens function');
  });

  it('should validate multiple lenses and return all errors', () => {
    const errors = validatePipelineInput(
      { code: '', lang: 'js', test: false }, // Invalid snippet
      [] // Invalid lens array
    );

    expect(errors).toContain('Snippet code is required');
    expect(errors).toContain('At least one lens is required');
    expect(errors.length).toBe(2);
  });

  it('should validate mixed valid and invalid lenses', () => {
    const errors = validatePipelineInput(testSnippet, [
      validLens, // Valid
      null as any, // Invalid
      validLensObject, // Valid
      { invalid: true } as any, // Invalid
    ]);

    expect(errors.length).toBe(2);
    expect(errors[0]).toContain('index 1');
    expect(errors[1]).toContain('index 3');
  });
});

/**
 * Uppercase Lens Configuration Tests
 * Tests the config factory pattern with deep merge support
 */

import { describe, it, expect } from 'vitest';
import { config } from './config.js';

describe('uppercase config factory', () => {
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

  describe('config factory consistency with other lenses', () => {
    it('should follow same interface as other config factories', () => {
      // Should work identically to reverse/config and lowercase/config
      const result1 = config();
      const result2 = config({});
      const result3 = config({ custom: 'setting' });

      expect(typeof result1).toBe('object');
      expect(typeof result2).toBe('object');
      expect(typeof result3).toBe('object');
      expect(result3.custom).toBe('setting');
    });

    it('should handle override patterns used by uppercase lens', () => {
      // Typical overrides that might be used with uppercase transformation
      const uppercaseConfig = config({
        preserveCase: false,
        includeComments: true,
        skipStrings: false,
      });

      expect(uppercaseConfig).toEqual({
        preserveCase: false,
        includeComments: true,
        skipStrings: false,
      });
    });

    it('should support configuration for future uppercase features', () => {
      const advancedConfig = config({
        transformation: {
          mode: 'aggressive',
          locale: 'en-US',
        },
        output: {
          format: 'preserve-structure',
          whitespace: 'maintain',
        },
      });

      expect(advancedConfig.transformation.mode).toBe('aggressive');
      expect(advancedConfig.output.format).toBe('preserve-structure');
    });
  });
});

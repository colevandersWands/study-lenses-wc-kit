/**
 * Unit tests for deep-merge utility
 * Tests the config factory pattern support function
 */

import { describe, it, expect } from 'vitest';
import { deepMerge } from './deep-merge.js';

describe('deepMerge', () => {
  it('should merge simple objects', () => {
    const result = deepMerge({ a: 1 }, { b: 2 });
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('should deep merge nested objects', () => {
    const result = deepMerge(
      { config: { theme: 'light', debug: false } },
      { config: { debug: true } }
    );
    expect(result).toEqual({
      config: { theme: 'light', debug: true },
    });
  });

  it('should not mutate original objects', () => {
    const original = { a: 1 };
    const override = { b: 2 };
    const result = deepMerge(original, override);

    expect(original).toEqual({ a: 1 });
    expect(override).toEqual({ b: 2 });
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('should handle deeply nested structures', () => {
    const target = {
      display: {
        theme: 'light',
        layout: {
          sidebar: true,
          header: { height: 60, sticky: true },
        },
      },
      processing: { timeout: 1000 },
    };

    const source = {
      display: {
        layout: {
          header: { sticky: false, color: 'blue' },
        },
      },
      newSection: { enabled: true },
    };

    const result = deepMerge(target, source);

    expect(result).toEqual({
      display: {
        theme: 'light',
        layout: {
          sidebar: true,
          header: { height: 60, sticky: false, color: 'blue' },
        },
      },
      processing: { timeout: 1000 },
      newSection: { enabled: true },
    });
  });

  it('should handle array replacement (not merging)', () => {
    const target = { items: [1, 2, 3] };
    const source = { items: [4, 5] };
    const result = deepMerge(target, source);

    expect(result.items).toEqual([4, 5]);
  });

  it('should handle null and undefined values', () => {
    const target = { a: 1, b: 2, c: 3 };
    const source = { a: null, b: undefined, d: 4 };
    const result = deepMerge(target, source);

    expect(result).toEqual({
      a: null,
      b: undefined,
      c: 3,
      d: 4,
    });
  });

  it('should handle empty objects', () => {
    const result1 = deepMerge({}, { a: 1 });
    expect(result1).toEqual({ a: 1 });

    const result2 = deepMerge({ a: 1 }, {});
    expect(result2).toEqual({ a: 1 });

    const result3 = deepMerge({}, {});
    expect(result3).toEqual({});
  });
});

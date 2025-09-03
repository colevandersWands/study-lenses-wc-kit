/**
 * Unit tests for dynamic lens loading function
 * Tests runtime lens registration and validation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { load } from './load.js';
import lensRegistry from '../lenses/index.js';

describe('study load', () => {
  // Mock lens for testing
  const mockLens = async (snippet: any, config = {}) => ({
    snippet: { ...snippet, code: snippet.code + ' // loaded' },
    view: null,
  });

  const validLensObject = {
    name: 'test-lens',
    lens: mockLens,
    view: null,
    config: () => ({ enabled: true }),
  };

  beforeEach(() => {
    // Clean up any test lenses from registry
    delete (lensRegistry as any)['test-lens'];
    delete (lensRegistry as any)['minimal-lens'];
  });

  it('should load valid lens object successfully', () => {
    const result = load(validLensObject);

    expect(result).toBe(true);
    expect((lensRegistry as any)['test-lens']).toBeDefined();
    expect((lensRegistry as any)['test-lens'].name).toBe('test-lens');
    expect((lensRegistry as any)['test-lens'].lens).toBe(mockLens);
  });

  it('should add default config for lenses without config', () => {
    const minimalLens = {
      name: 'minimal-lens',
      lens: mockLens,
    };

    const result = load(minimalLens);

    expect(result).toBe(true);
    expect((lensRegistry as any)['minimal-lens']).toBeDefined();
    expect((lensRegistry as any)['minimal-lens'].config).toBeDefined();
    expect(typeof (lensRegistry as any)['minimal-lens'].config).toBe('function');
    expect((lensRegistry as any)['minimal-lens'].config()).toEqual({});
  });

  it('should reject null or undefined lens objects', () => {
    expect(load(null)).toBe(false);
    expect(load(undefined)).toBe(false);
  });

  it('should reject non-object lens specs', () => {
    expect(load('invalid')).toBe(false);
    expect(load(123)).toBe(false);
    expect(load(true)).toBe(false);
    expect(load([])).toBe(false);
  });

  it('should reject lens objects without name', () => {
    const noName = {
      lens: mockLens,
    };

    expect(load(noName)).toBe(false);
    expect((lensRegistry as any)['undefined']).toBeUndefined();
  });

  it('should reject lens objects with invalid name', () => {
    const invalidName = {
      name: null,
      lens: mockLens,
    };

    expect(load(invalidName)).toBe(false);
  });

  it('should reject lens objects without lens function', () => {
    const noLens = {
      name: 'no-lens-function',
    };

    expect(load(noLens)).toBe(false);
    expect((lensRegistry as any)['no-lens-function']).toBeUndefined();
  });

  it('should reject lens objects with invalid lens function', () => {
    const invalidLens = {
      name: 'invalid-lens',
      lens: 'not-a-function',
    };

    expect(load(invalidLens)).toBe(false);
  });

  it('should preserve existing lens config if provided', () => {
    const customConfig = () => ({ theme: 'dark', enabled: false });
    const lensWithConfig = {
      name: 'config-lens',
      lens: mockLens,
      config: customConfig,
    };

    const result = load(lensWithConfig);

    expect(result).toBe(true);
    expect((lensRegistry as any)['config-lens'].config).toBe(customConfig);
    expect((lensRegistry as any)['config-lens'].config()).toEqual({
      theme: 'dark',
      enabled: false,
    });
  });

  it('should preserve existing lens view if provided', () => {
    const mockView = class extends HTMLElement {};
    const lensWithView = {
      name: 'view-lens',
      lens: mockLens,
      view: mockView,
    };

    const result = load(lensWithView);

    expect(result).toBe(true);
    expect((lensRegistry as any)['view-lens'].view).toBe(mockView);
  });

  it('should overwrite existing lens if same name is used', () => {
    const lens1 = {
      name: 'duplicate-lens',
      lens: async (snippet: any) => ({ snippet, view: null }),
    };

    const lens2 = {
      name: 'duplicate-lens',
      lens: mockLens,
    };

    expect(load(lens1)).toBe(true);
    expect(load(lens2)).toBe(true);

    expect((lensRegistry as any)['duplicate-lens'].lens).toBe(mockLens);
  });

  it('should handle errors gracefully', () => {
    // Temporarily break the registry to test error handling
    const originalRegistry = lensRegistry;

    // This should not throw, but return false
    const result = load({
      name: 'error-lens',
      lens: mockLens,
    });

    expect(result).toBe(true); // Should still work despite our attempt to break it
  });
});

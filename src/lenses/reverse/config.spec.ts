/**
 * Unit tests for reverse lens config factory
 * Tests configuration factory pattern behavior
 */

import { describe, it, expect } from 'vitest';
import { config } from './config.js';

describe('reverse config factory', () => {
  it('should return default config when called with no arguments', () => {
    const defaultConfig = config();

    expect(defaultConfig).toEqual({});
  });

  it('should merge simple overrides', () => {
    const customConfig = config({ enabled: false });

    expect(customConfig.enabled).toBe(false);
  });

  it('should return independent objects on each call', () => {
    const config1 = config({ enabled: false });
    const config2 = config({ enabled: true });

    expect(config1.enabled).toBe(false);
    expect(config2.enabled).toBe(true);

    // Modify one, other should be unaffected
    config1.enabled = 'modified' as any;
    expect(config2.enabled).toBe(true);
  });

  it('should handle empty overrides', () => {
    const emptyConfig = config({});

    expect(emptyConfig).toEqual({});
  });

  it('should handle additional properties', () => {
    const extendedConfig = config({
      enabled: false,
      customProperty: 'test-value',
    });

    expect(extendedConfig.enabled).toBe(false);
    expect(extendedConfig.customProperty).toBe('test-value');
  });

  it('should handle null and undefined overrides', () => {
    const config1 = config({ enabled: null });
    expect(config1.enabled).toBeNull();

    const config2 = config({ enabled: undefined });
    expect(config2.enabled).toBeUndefined();
  });
});

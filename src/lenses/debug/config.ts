/**
 * Debugger Lens Configuration
 * Configuration factory with deep merge support
 */

import { deepMerge } from '../../utils/deep-merge.js';

const defaultConfig = {
  enabled: true, // Enable/disable the lens
  customPrefix: null, // Custom prefix instead of default language-specific
  customSuffix: null, // Custom suffix instead of default language-specific
  lineSpacing: 3, // Number of newlines around code (default: 3)
};

/**
 * Configuration factory for debug lens
 * @param overrides - Partial configuration to merge with defaults
 * @returns Merged configuration object
 */
export const config = (overrides = {}) => deepMerge(defaultConfig, overrides);

export default config;

/**
 * Run Lens Configuration
 * Config factory with deep merge support for execution settings
 */

import { deepMerge } from '../../utils/deep-merge.js';

const defaultConfig = {
  loopGuard: {
    active: false,
    max: 100,
  },
  debug: false,
  test: false,
  type: 'script', // 'script' or 'module' - will be overridden for .mjs files
  globals: {},
};

export const config = (overrides: any = {}) => deepMerge(defaultConfig, overrides || {});
export default config;
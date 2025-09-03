/**
 * JSX Demo Lens Configuration
 * Config factory with deep merge support
 */

import { deepMerge } from '../../utils/deep-merge.js';

const defaultConfig = {
  showDetails: true,
  showStats: true,
  theme: 'light',
};

export const config = (overrides: any = {}) => deepMerge(defaultConfig, overrides || {});
export default config;

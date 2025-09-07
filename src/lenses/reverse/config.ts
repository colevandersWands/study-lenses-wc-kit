/**
 * Reverse Lens Configuration
 * Config factory with deep merge support
 */

import { deepMerge } from '../../utils/deep-merge.js';

// Reverse lens has no configuration
const defaultConfig = {};

export const config = (overrides: any = {}) =>
	deepMerge(defaultConfig, overrides || {});
export default config;

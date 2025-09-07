/**
 * Loop Guard Lens Configuration
 * Config factory with deep merge support for loop protection settings
 */

import { deepMerge } from '../../utils/deep-merge.js';

// Supported JavaScript loop types
export type LoopType =
	| 'for'
	| 'while'
	| 'do-while'
	| 'for-of'
	| 'for-in'
	| 'for-await-of';

export interface LoopGuardConfig {
	/** Maximum loop iterations before throwing RangeError */
	max: number;
	/** Which loop types to guard */
	loops: LoopType[];
}

const defaultConfig: LoopGuardConfig = {
	max: 1000,
	loops: ['for', 'while', 'do-while', 'for-of', 'for-in', 'for-await-of'],
};

export const config = (overrides: any = {}) =>
	deepMerge(defaultConfig, overrides || {});
export default config;

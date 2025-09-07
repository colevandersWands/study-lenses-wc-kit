/**
 * Format Lens Barrel Export
 * Self-contained format lens with minimal view component for API compatibility
 */

import { name } from './name.js';
import lens from './lens.js';
import register from './wc.js';
import config from './config.js';

// Default export only (generic object interface)
export default {
	name, // Self-describing lens name for pipeline consistency
	lens, // Core transform function
	register, // Registration function for web component
	config, // Configuration factory function
};

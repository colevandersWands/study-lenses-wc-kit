/**
 * Loop Guard Lens - Main Export
 *
 * Pure transform lens that prevents infinite loops by injecting
 * safety counters into JavaScript loop constructs.
 */

import { name } from './name.js';
import lens from './lens.js';
import register from './wc.js';
import config from './config.js';

// Default export following lens object pattern
export default {
	name, // Self-describing lens name
	lens,
	register,
	config, // Config factory function
};

/**
 * Study Lenses Core API
 * Essential functions for building code study environments
 *
 * This module contains the most frequently used functions organized
 * under sl.core for easy access and API stability.
 */

// Core namespace object for organized exports
import { pipeLenses } from './pipe-lenses.js';
import { load } from './load.js';

/**
 * Core API object - contains essential functions for Study Lenses
 * Accessible as sl.core.functionName for clean, predictable imports
 */
export const core = {
	/**
	 * Primary pipeline processing function
	 * Processes code through lens sequences until terminus condition
	 */
	pipeLenses,

	load,

	// Additional core functions can be added here as needed
	// createSnippet,
	// extractCode,
	// registerLenses,
};

// Default export for convenience
export default core;

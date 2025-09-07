/**
 * Snippet Utilities Barrel Export
 * Both lens function and view component with shared signature
 */

import parse from './parse.js';
import register from './register.js';

// Re-export types for TypeScript users
export type { SnippetOptions } from './parse.js';

// Default export only (generic object interface)
export default {
	parse,
	register,
};

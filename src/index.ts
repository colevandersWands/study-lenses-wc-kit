/**
 * Study Lenses V2 - Simplified Entry Point
 * Single export object containing everything users need
 */

// Core types for TypeScript users
export type {
	Snippet,
	LensOutput,
	LensFunction,
	SyncLensFunction,
	AsyncLensFunction,
	LensObject,
	LensConfig,
	LensSpec,
	CodeSource,
	StudyOutput,
	RegisterFunction,
	RegisterableObject,
	RegistrationResult,
	RegisterableContainer,
} from './types.js';
export type { SnippetOptions } from './snippet/index.js';

// Import from default exports using new structure
import lenses from './lenses/index.js';
import core from './core/index.js';
import snippet from './snippet/index.js';
import ui from './ui/index.js';

// Main export - everything users need in one organized object
export const sl = {
	// Essential functions for core operations
	core,

	// Core lens collection
	lenses,

	// Snippet utilities (top-level - not a lens)
	snippet,

	// UI components for visual interfaces
	ui,
};

// Default export for convenience
export default sl;

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
} from './types.js';
export type { SnippetOptions } from './snippet/index.js';

// Import from default exports using new structure
import lenses from './lenses/index.js';
import study from './study/index.js';
import snippet from './snippet/index.js';

// Main export - everything users need in one organized object
export const studyLenses = {
  // Core lens collection
  lenses,

  // Main study component/function
  study,

  // Snippet utilities (top-level - not a lens)
  snippet,
};

// Default export for convenience
export default studyLenses;

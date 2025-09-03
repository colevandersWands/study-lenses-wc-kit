/**
 * Study Barrel Export
 */

import pipe from './pipe.js';
import view from './view.js';
import load from './load.js';

// Re-export types for TypeScript users
export type { StudyOutput } from './types.js';

// Default export only (generic object interface)
export default {
  pipe,
  view,
  load,
};

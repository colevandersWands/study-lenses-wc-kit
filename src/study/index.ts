/**
 * Study Barrel Export
 */

import pipeLenses from './pipe.js';
import register from './wc.js';
import load from './load.js';

// Re-export types for TypeScript users
export type { StudyOutput } from './types.js';

// Default export only (generic object interface)
export default {
  pipeLenses,
  register,
  load,
};

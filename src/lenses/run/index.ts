import { name } from './name.js';
import lens from './lens.js';
import register from './register.js';
import config from './config.js';

// Default export only (generic object interface)
export default {
  name,
  lens,
  register, // Export register, not wc
  config,
};
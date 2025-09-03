/**
 * Lowercase Lens Component
 * Web component wrapper for the lowercase function
 */

import { createLensElement } from '../../web-components/lens-wrapper.js';
import { name } from './name.js';
import lens from './lens.js';

/**
 * View - Web component for the lowercase lens
 */
export const view = createLensElement(name, lens);

// Default export for convenience
export default view;

/**
 * Reverse Lens Component
 * Web component wrapper for the reverse function
 */

import { createLensElement } from '../../web-components/lens-wrapper.js';
import { name } from './name.js';
import lens from './lens.js';

/**
 * View - Web component for the reverse lens
 */
export const view = createLensElement(name, lens);

// Default export for convenience
export default view;

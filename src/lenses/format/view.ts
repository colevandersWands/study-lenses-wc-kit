/**
 * Format Lens View Component
 * Transform-only lens - minimal view component for API compatibility
 */

import { createLensElement } from '../../web-components/lens-wrapper.js';
import lens from './lens.js';

export const view = createLensElement('format', lens);
export default view;
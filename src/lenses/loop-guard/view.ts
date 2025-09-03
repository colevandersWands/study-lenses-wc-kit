/**
 * Loop Guard Lens View - Web Component Wrapper
 * 
 * Since loop-guard is a transform lens (no visual output), 
 * this view component simply applies the transformation.
 */

import { createLensElement } from '../../web-components/lens-wrapper.js';
import lens from './lens.js';

export const view = createLensElement('loop-guard', lens);
export default view;
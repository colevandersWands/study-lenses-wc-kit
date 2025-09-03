/**
 * JSX Demo Lens Component
 */

import { createLensElement } from '../../web-components/lens-wrapper.js';
import { name } from './name.js';
import lens from './lens.js';

export const view = createLensElement(name, lens);
export default view;

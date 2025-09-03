/**
 * Reverse Lens Registration
 * Side-effect only - no exports
 */

import { name } from './name.js';
import view from './view.js';

// Register web component
customElements.define(`sl-lens-${name}`, view);

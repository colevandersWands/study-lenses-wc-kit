/**
 * JSX Demo Lens Registration
 * Browser side effects only - no exports
 */

import { name } from './name.js';
import view from './view.js';

// Register web component
if (typeof window !== 'undefined' && 'customElements' in window) {
  if (!customElements.get(`sl-lens-${name}`)) {
    customElements.define(`sl-lens-${name}`, view);
  }
}

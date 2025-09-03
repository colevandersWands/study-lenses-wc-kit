/**
 * Format Lens Web Component Registration
 * Registers the view component for browser usage
 */

import { view } from './view.js';

// Register web component for browser usage
if (typeof window !== 'undefined' && 'customElements' in window) {
  if (!customElements.get('sl-lens-format')) {
    customElements.define('sl-lens-format', view);
  }
}
/**
 * Loop Guard Lens Registration - Browser Registration
 * 
 * Registers the loop-guard web component in the browser.
 * Import this file to make <sl-lens-loop-guard> available.
 */

import view from './view.js';

// Register the web component
customElements.define('sl-lens-loop-guard', view);
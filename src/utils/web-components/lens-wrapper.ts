/**
 * Minimal lens component factory
 * Components are just thin wrappers that parse attributes and delegate to functions
 */

import { setupLensComponent } from './setup-functions.js';
import type { LensFunction } from '../types.js';

/**
 * Create a lens component class
 * Component only handles attribute parsing and delegation - all logic in functions
 */
export const createLensElement = (lensName: string, lensFunction: LensFunction) => {
  return class extends HTMLElement {
    connectedCallback() {
      // Component only parses attributes and delegates to pure function
      setupLensComponent(this, `sl-lens-${lensName}`, lensFunction);
    }
  };
};

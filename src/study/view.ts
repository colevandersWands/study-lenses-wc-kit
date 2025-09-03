/**
 * StudyView Web Component Class
 * Minimal wrapper that delegates to pure functions
 */

import { setupPipelineMode, setupStudyPanelMode } from '../web-components/setup-functions.js';
import { parseLensesAttribute } from '../utils/parse-lenses-attribute.js';

/**
 * View component - handles both pipeline and study panel modes
 * Component only parses attributes and delegates to pure functions
 */
export class view extends HTMLElement {
  connectedCallback() {
    // Component only parses attributes and delegates
    const lensesAttr = this.getAttribute('lenses');

    if (lensesAttr) {
      // Pipeline mode - process lenses sequentially
      const lensNames = parseLensesAttribute(lensesAttr);
      setupPipelineMode(this, lensNames);
    } else {
      // Study panel mode - distribute code to child lenses
      setupStudyPanelMode(this);
    }
  }
}

// Default export for convenience
export default view;

/**
 * Study Lenses Web Component Registration
 * Register function creates and defines the web component
 */

import { setupPipelineMode, setupStudyPanelMode } from '../web-components/setup-functions.js';
import { parseLensesAttribute } from '../utils/parse-lenses-attribute.js';

/**
 * Register the study-lenses web component
 * Creates and defines the component only when called
 */
export const register = () => {
  const tagName = 'study-lenses';
  
  if (!customElements.get(tagName)) {
    // Create the web component class inside the register function
    class StudyLensesWC extends HTMLElement {
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
    
    customElements.define(tagName, StudyLensesWC);
  }
  
  return tagName;
};

// Named and default export - ONLY the register function
export default register;

/**
 * Run UI Component Registration
 * Uses web-component helpers for code discovery
 */

import { extractCodeFromElement } from '../../utils/extract-code-from-element.js';
import { component } from './component.js';
import { name } from './name.js';

// Define class outside register function
class UIRunComponent extends HTMLElement {
  async connectedCallback() {
    // Try to extract snippet directly using existing helper, or let component request from parent
    let snippet = null;
    
    try {
      const code = await extractCodeFromElement(this);
      if (code) {
        const lang = this.getAttribute('lang') || 'js';
        const test = this.hasAttribute('test');
        snippet = { code, lang, test };
      }
    } catch {
      // No problem, component will request from parent study-bar
    }
    
    // Render pure function result
    const result = component(snippet);
    this.appendChild(result);
  }
}

export const register = () => {
  const tagName = `sl-ui-${name}`;
  
  if (!customElements.get(tagName)) {
    customElements.define(tagName, UIRunComponent);
  }
  
  return tagName;
};

export default register;
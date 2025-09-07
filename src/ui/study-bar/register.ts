/**
 * Study Bar UI Component Registration
 * Uses web-component helpers for code discovery
 */

import { extractCodeFromElement } from '../../utils/extract-code-from-element.js';
import { component } from './component.js';
import { name } from './name.js';

// Define class outside register function
class UIStudyBarComponent extends HTMLElement {
	async connectedCallback() {
		// Use existing helper for code discovery
		const code = await extractCodeFromElement(this);
		const lang = this.getAttribute('lang') || 'js';
		const test = this.hasAttribute('test');
		const snippet = { code, lang, test };

		// Get child elements before clearing
		const children = Array.from(this.children) as HTMLElement[];

		// Clear element and render pure function result
		this.innerHTML = '';
		const result = component(snippet, children);
		this.appendChild(result);
	}
}

export const register = () => {
	const tagName = `sl-ui-${name}`;

	if (!customElements.get(tagName)) {
		customElements.define(tagName, UIStudyBarComponent);
	}

	return tagName;
};

export default register;

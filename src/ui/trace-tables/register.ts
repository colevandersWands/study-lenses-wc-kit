/**
 * Trace Tables UI Component Registration
 * Uses web-component helpers for code discovery
 */

import { extractCodeFromElement } from '../../utils/extract-code-from-element.js';
import { component } from './component.js';
import { name } from './name.js';
import type { TableTypeName } from './types.js';

// Define class outside register function
class UITraceTablesComponent extends HTMLElement {
	async connectedCallback() {
		// Try to extract snippet directly using existing helper, or let component work independently
		let snippet = null;

		try {
			const code = await extractCodeFromElement(this);
			if (code) {
				const lang = this.getAttribute('lang') || 'js';
				const test = this.hasAttribute('test');
				snippet = { code, lang, test };
			}
		} catch {
			// No problem, component works without snippet
		}

		// Get table type from attribute
		const typeAttr = this.getAttribute('type') as TableTypeName;
		const type = typeAttr || determineTableTypeFromAttributes(this);

		// Render pure function result
		const result = component(snippet, type);
		this.appendChild(result);
	}
}

/**
 * Determines table type from element attributes (backward compatibility)
 * @param element - The element to check for type attributes
 * @returns The table type to use
 */
function determineTableTypeFromAttributes(element: HTMLElement): TableTypeName {
	// Check for legacy attributes
	if (element.hasAttribute('steps')) {
		return 'steps';
	}
	if (element.hasAttribute('operators')) {
		return 'operators';
	}
	if (element.hasAttribute('values')) {
		return 'values';
	}

	// Default
	return 'values';
}

export const register = () => {
	const tagName = `sl-ui-${name}`;

	if (!customElements.get(tagName)) {
		customElements.define(tagName, UITraceTablesComponent);
	}

	return tagName;
};

export default register;

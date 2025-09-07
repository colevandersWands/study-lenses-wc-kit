/**
 * Debug Lens Web Component Registration
 * Register function creates and defines the web component
 */

import { createLensElement } from '../../utils/web-components/lens-wrapper.js';
import { name } from './name.js';
import lens from './lens.js';

/**
 * Register the debug web component
 * Creates and defines the component only when called
 */
export const register = () => {
	const tagName = `sl-lens-${name}`;

	if (!customElements.get(tagName)) {
		// Create the web component class inside the register function
		const wc = createLensElement(name, lens);
		customElements.define(tagName, wc);
	}

	return tagName;
};

// Named and default export - ONLY the register function
export default register;

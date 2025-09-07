/**
 * Run Lens Web Component Registration
 * Register function creates and defines the web component
 */

import { createLensElement } from '../../utils/web-components/lens-wrapper.js';
import { name } from './name.js';
import lens from './lens.js';

// Define class outside register function
const RunLensComponent = createLensElement(name, lens);

/**
 * Register the run web component
 * Creates and defines the component only when called
 */
export const register = () => {
	const tagName = `sl-lens-${name}`;

	if (!customElements.get(tagName)) {
		customElements.define(tagName, RunLensComponent);
	}

	return tagName;
};

// Named and default export - ONLY the register function
export default register;

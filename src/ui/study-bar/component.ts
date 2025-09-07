/**
 * Study Bar UI Component - Pure Function Implementation
 * Takes snippet object and array of child elements, returns layout container
 */

import type { Snippet } from '../../types.js';

/**
 * Study bar pure function - takes snippet and children, returns container
 * @param snippet - Code snippet object { code, lang, test }
 * @param children - Array of UI elements to render as children
 * @returns DOM element with flexbox layout
 */
export const component = (
	snippet: Snippet,
	children: HTMLElement[]
): HTMLElement => {
	const container = document.createElement('div');
	container.style.cssText =
		'display: flex; gap: 8px; align-items: center; flex-wrap: wrap;';

	// Store snippet for child access (simple approach for now)
	(container as any)._studyBarSnippet = snippet;

	// Add all child elements
	children.forEach((child) => {
		container.appendChild(child);
	});

	// Set up event delegation for code requests from child components
	container.addEventListener('request-code', (event: CustomEvent) => {
		event.stopPropagation();
		if (event.detail?.callback) {
			event.detail.callback(snippet);
		}
	});

	return container;
};

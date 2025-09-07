/**
 * Trace Tables UI Component - Pure Function Implementation
 * Interactive trace tables for code analysis with draggable interface
 * No DOM feedback - just creates interactive table interface
 */

import type { Snippet } from '../../types.js';
import type { TableTypeName } from './types.js';
import { tableTypes } from './table-types.js';
import { $ } from './$.js';

/**
 * Trace Tables UI pure function - returns interactive trace table element
 * @param snippet - Code snippet to analyze (can be null, component works independently)
 * @param type - Table type override ('steps' | 'values' | 'operators')
 * @returns DOM element with interactive trace table
 */
export const component = (
	snippet: Snippet | null = null,
	type?: TableTypeName
): HTMLElement => {
	// Create the main container element
	const element = document.createElement('div');

	// Create shadow DOM structure
	const shadow = element.attachShadow({ mode: 'open' });
	const closableDiv = document.createElement('div');
	const tableContainer = document.createElement('div');

	// Determine which table type to use
	const tableType = determineTableType(type);
	const tableModule = tableTypes[tableType];

	// Apply styles and content
	shadow.innerHTML = tableModule.style;
	shadow.appendChild(closableDiv);
	closableDiv.appendChild(tableContainer);
	tableContainer.innerHTML = tableModule.table;

	// Initialize the table
	tableModule.init(shadow);

	// Set up close button
	const closeButton = shadow.getElementById('close-button');
	if (closeButton) {
		closeButton.addEventListener('click', () => {
			if (element.parentElement) {
				element.parentElement.removeChild(element);
			}
		});
	}

	// Set up dragging behavior
	setupDragging(element);

	// Apply initial positioning
	element.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    z-index: 500;
  `;

	return element;
};

// ===== ==== === == =  internal functions  = == === ==== =====

/**
 * Determines which table type to use based on parameters
 * @param type - Optional type parameter
 * @returns The table type to use
 */
function determineTableType(type?: TableTypeName): TableTypeName {
	// Priority: type parameter > default
	if (type && tableTypes[type]) {
		return type;
	}

	// Default
	return 'values';
}

/**
 * Sets up dragging behavior for the table element
 * @param element - The element to make draggable
 */
function setupDragging(element: HTMLElement): void {
	// Use the custom $ dragging implementation
	$(element)
		.draggable()
		.dblclick(() => {
			$(element).draggable({ disabled: false });
		})
		.click(() => {
			$(element).draggable({ disabled: true });
		});
}

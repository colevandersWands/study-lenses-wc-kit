/**
 * TraceTables Web Component - Interactive trace tables for code analysis
 *
 * This component provides draggable, interactive tables for tracking
 * variable states, operations, and execution steps during code execution.
 *
 * Features:
 * - Three table types: steps, values, operators
 * - Draggable and resizable interface
 * - Dynamic row/column management
 * - Shadow DOM encapsulation
 *
 * @element trace-tables
 * @attr {string} type - Override default table type (optional)
 *
 * @example
 * <trace-tables></trace-tables>
 * <trace-tables type="steps"></trace-tables>
 */

import type { TableTypeName, TableTypesMap } from './types.js';
import { tableTypes } from './table-types.js';
import { $ } from './$.js';

/**
 * TraceTables Web Component Class
 *
 * Minimal class that creates and configures the trace table
 */
export class TraceTables extends HTMLElement {
	constructor(type?: TableTypeName) {
		super();
		setupTraceTable(this, type);
	}
}

// ===== ==== === == =  internal functions  = == === ==== =====

/**
 * Determines which table type to use based on parameters and attributes
 * @param element - The TraceTables element
 * @param type - Optional type parameter from constructor
 * @returns The table type to use
 */
function determineTableType(
	element: HTMLElement,
	type?: TableTypeName
): TableTypeName {
	// Priority: constructor param > attribute > default
	if (type && tableTypes[type]) {
		return type;
	}

	// Check attributes
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

/**
 * Sets up the trace table component with shadow DOM and event handlers
 * @param element - The TraceTables element to configure
 * @param type - Optional table type override
 */
function setupTraceTable(element: TraceTables, type?: TableTypeName): void {
	// Create shadow DOM structure
	const shadow = element.attachShadow({ mode: 'open' });
	const closableDiv = document.createElement('div');
	const tableContainer = document.createElement('div');

	// Determine which table type to use
	const tableType = determineTableType(element, type);
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

/**
 * TraceTablesSelection Web Component - Dropdown selector for trace tables
 *
 * This component provides a dropdown interface for selecting and creating
 * different types of trace tables (steps, values, operators).
 *
 * Features:
 * - Dropdown selection of table types
 * - Creates TraceTables components on demand
 * - Integrates with application state for default selection
 *
 * @element trace-tables-selection
 *
 * @example
 * <trace-tables-selection></trace-tables-selection>
 */

import type { TableTypeName } from './types.js';
import { TraceTables } from './trace-tables.js';
import { getDefaultTableType, getAvailableTableTypes } from './table-types.js';

// Default configuration - no external state dependency
const defaultTableConfig = {
	lenses: {
		tables: {
			default: 'values' as TableTypeName,
		},
	},
};

/**
 * TraceTablesSelection Web Component Class
 *
 * Minimal class that creates the selection interface
 */
export class TraceTablesSelection extends HTMLElement {
	constructor() {
		super();
		setupTableSelection(this);
	}
}

// ===== ==== === == =  internal functions  = == === ==== =====

/**
 * Creates the HTML template for the selection interface
 * @returns HTML string for the component
 */
function createSelectionTemplate(): string {
	// Get default from local configuration
	const defaultType = getDefaultTableType(defaultTableConfig.lenses.tables);
	const availableTypes = getAvailableTableTypes();

	return `
    <button id='table-button'>table</button>
    <select id="type">
      ${availableTypes
			.map((type) => {
				// Format display name
				const displayName =
					type === 'values'
						? 'variable values'
						: type === 'steps'
							? 'variable steps'
							: 'operators';

				return `<option value="${type}" ${type === defaultType ? 'selected' : ''}>${displayName}</option>`;
			})
			.join('')}
    </select>
  `;
}

/**
 * Handles click event on the table button
 * @param event - The click event
 * @param shadow - The shadow root to query elements from
 */
function handleTableButtonClick(event: Event, shadow: ShadowRoot): void {
	const selectElement = shadow.getElementById('type') as HTMLSelectElement;
	if (!selectElement) {
		console.warn('Table selection: type dropdown not found');
		return;
	}

	const tableType = selectElement.value as TableTypeName;
	if (!tableType) {
		console.warn('Table selection: no type selected');
		return;
	}

	// Create and append new trace table
	try {
		const traceTable = new TraceTables(tableType);
		document.body.appendChild(traceTable);
	} catch (error) {
		console.warn('Table selection: failed to create table', error);
	}
}

/**
 * Sets up the table selection component
 * @param element - The TraceTablesSelection element to configure
 */
function setupTableSelection(element: TraceTablesSelection): void {
	// Create shadow DOM and apply template
	const shadow = element.attachShadow({ mode: 'open' });
	shadow.innerHTML = createSelectionTemplate();

	// Set up event listener
	const tableButton = shadow.getElementById('table-button');
	if (tableButton) {
		tableButton.addEventListener('click', (event) =>
			handleTableButtonClick(event, shadow)
		);
	} else {
		console.warn('Table selection: button element not found');
	}
}

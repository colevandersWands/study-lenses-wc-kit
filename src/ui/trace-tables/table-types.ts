/**
 * Table type module organization for TraceTable component
 *
 * This module centralizes the table type imports and provides
 * a controlled ordering for the dropdown selection.
 */

import type { TableTypeName, TableTypesMap } from './types.js';
import * as steps from './tables/steps.js';
import * as values from './tables/values.js';
import * as operators from './tables/operators.js';

/**
 * Map of table types with controlled order
 * Change the order here to control dropdown display order
 */
export const tableTypes: TableTypesMap = {
	values, // Default - variable values matrix
	steps, // Variable step tracking
	operators, // Operator evaluation tracking
};

/**
 * Get the default table type from configuration with fallback
 * @param configValue - Value from state configuration
 * @returns Valid table type name
 */
export function getDefaultTableType(
	configValue: string | undefined
): TableTypeName {
	if (!configValue) {
		return 'values';
	}

	const availableTypes = Object.keys(tableTypes) as TableTypeName[];
	const found = availableTypes.find(
		(type) => type.toLowerCase() === configValue.toLowerCase()
	);

	return found || 'values';
}

/**
 * Get list of available table types in order
 * @returns Array of table type names
 */
export function getAvailableTableTypes(): TableTypeName[] {
	return Object.keys(tableTypes) as TableTypeName[];
}

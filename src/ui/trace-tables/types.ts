/**
 * Type definitions for TraceTable Web Component
 * Defines trace table types for JavaScript code analysis
 */

/**
 * Available trace table types for JavaScript code analysis
 */
export type TableTypeName = 'steps' | 'values' | 'operators';

/**
 * Interface for a table type module containing styles, HTML, and initialization
 */
export interface TableTypeModule {
	style: string;
	table: string;
	init: (shadow: ShadowRoot) => void;
}

/**
 * Mapping of table type names to their module implementations
 */
export type TableTypesMap = Record<TableTypeName, TableTypeModule>;

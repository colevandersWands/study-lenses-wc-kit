/**
 * Type definitions for Testing Framework (describe-it)
 * Defines interfaces for Jest-like testing functionality
 */

/**
 * Console call captured during test execution
 */
export interface ConsoleCall {
	method: string;
	args: unknown[];
}

/**
 * Window-like object with console interface for test isolation
 */
export interface WindowLike {
	console: Console;
}

/**
 * Report structure for individual test cases
 */
export interface TestReport {
	type: 'it' | 'describe';
	description: string;
	testFunction: Function;
	children?: TestReport[];
	consoleCalls: ConsoleCall[];
	error: Error | null;
	ms?: number | null;
}

/**
 * Async test framework interface (describe-it.ts)
 */
export interface TestFramework {
	describe: (description: string, testFunction: () => void) => Promise<void>;
	it: (
		description: string,
		testFunction: () => void | Promise<void>
	) => Promise<void>;
	beforeEach: (callback: () => void) => void;
	suite: (description: string, testFunction: () => void) => Promise<void>;
	test: (
		description: string,
		testFunction: () => void | Promise<void>
	) => Promise<void>;
}

/**
 * Synchronous test framework interface (describe-it-sync.ts)
 */
export interface SyncTestFramework {
	describe: (
		description: string,
		testFunction: () => void,
		collapsed?: boolean
	) => void;
	it: (description: string, testFunction: () => void) => void;
	beforeEach: (callback: () => void) => void;
	afterEach: (callback: () => void) => void;
	suite: (
		description: string,
		testFunction: () => void,
		collapsed?: boolean
	) => void;
	test: (description: string, testFunction: () => void) => void;
}

/**
 * Factory function type for creating async test framework instances
 */
export type TestFrameworkFactory = (window?: WindowLike) => TestFramework;

/**
 * Factory function type for creating sync test framework instances
 */
export type SyncTestFrameworkFactory = (
	window?: WindowLike
) => SyncTestFramework;

/**
 * Jest expect function type for test assertions
 */
export type ExpectFunction = any; // Using any for expect function to avoid import issues

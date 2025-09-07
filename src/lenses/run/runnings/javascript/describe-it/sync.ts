/**
 * Sync Testing Framework - TypeScript Implementation
 *
 * Provides a synchronous Jest-like testing framework with console output capture,
 * beforeEach/afterEach hooks, and immediate test execution without promises.
 *
 * Features:
 * - Synchronous test execution (no promises)
 * - Console output capture during test execution
 * - beforeEach and afterEach hooks
 * - Grouped console output for test suites
 * - Immediate test result reporting
 *
 * @example
 * const { describe, it, beforeEach, afterEach } = describeIt();
 *
 * describe('Math operations', () => {
 *   beforeEach(() => {
 *     // Setup code
 *   });
 *
 *   afterEach(() => {
 *     // Cleanup code
 *   });
 *
 *   it('should add numbers', () => {
 *     expect(2 + 2).toBe(4);
 *   });
 * });
 */

import type {
	WindowLike,
	ConsoleCall,
	SyncTestFramework,
	SyncTestFrameworkFactory,
} from './types.js';

/**
 * Creates a synchronous testing framework instance
 *
 * @param aWindow - Window-like object with console interface (defaults to { console })
 * @returns Synchronous testing framework with describe, it, beforeEach, afterEach functions
 */
export const describeIt: SyncTestFrameworkFactory = (
	aWindow: WindowLike = { console }
): SyncTestFramework => {
	let beforeEachCallback: (() => void) | null = null;
	let afterEachCallback: (() => void) | null = null;

	let unitIsCalled = false;

	/**
	 * Internal function for executing individual test units (it/test)
	 * @param description - Description of the test
	 * @param testFunction - Test function to execute
	 * @throws Error if called inside another unit test
	 * @throws TypeError if arguments are invalid
	 */
	const unit = (description: string, testFunction: () => void): void => {
		if (unitIsCalled) {
			throw new Error('can not call it/test from inside of it/test');
		}
		if (typeof description !== 'string') {
			throw new TypeError('first argument must be a string');
		}
		if (typeof testFunction !== 'function') {
			throw new TypeError('second argument must be a function');
		}

		unitIsCalled = true;

		// Execute beforeEach hook if present
		if (beforeEachCallback) {
			try {
				beforeEachCallback();
			} catch (err: unknown) {
				console.error('%cbeforeEach Error:', 'font-weight: bold;', err);
			}
		}

		// Backup console and capture console calls
		const consoleBackup = Object.assign({}, aWindow.console);
		const consoleCalls: ConsoleCall[] = [];
		for (const key in aWindow.console) {
			if (typeof (aWindow.console as any)[key] === 'function') {
				(aWindow.console as any)[key] = function () {
					consoleCalls.push({
						method: key,
						args: Array.from(arguments),
					});
				};
			}
		}

		// Execute test function and capture any errors
		let thrown: unknown = null;
		let threw = false;
		try {
			testFunction();
		} catch (exception: unknown) {
			threw = true;
			thrown = exception;
		}

		// Restore console
		Object.assign(aWindow.console, consoleBackup);

		// Report test results
		if (threw) {
			console.groupCollapsed(
				`%c✖ FAIL: ${description}`,
				'font-weight: bold; color: red;'
			);
			for (const call of consoleCalls) {
				(console as any)[call.method](...call.args);
			}
			if (thrown instanceof Error) {
				console.error(`${thrown.name}: ${thrown.message}`);
			} else {
				console.error(thrown);
			}
			console.groupEnd();
		} else {
			if (consoleCalls.length === 0) {
				console.log(
					`%c√ PASS: ${description}`,
					'font-weight: bold; color: green;'
				);
			} else {
				console.groupCollapsed(
					`%c√ PASS: ${description}`,
					'font-weight: bold; color: green;'
				);
				for (const call of consoleCalls) {
					(console as any)[call.method](...call.args);
				}
				console.groupEnd();
			}
		}

		// Execute afterEach hook if present
		if (afterEachCallback) {
			try {
				afterEachCallback();
			} catch (err: unknown) {
				console.error('%cafterEach Error:', 'font-weight: bold;', err);
			}
		}

		unitIsCalled = false;
	};

	/**
	 * Creates a test suite with grouped console output
	 * @param description - Description of the test suite
	 * @param testFunction - Function containing test definitions
	 * @param collapsed - Whether to collapse the group initially (default: false)
	 * @throws TypeError if arguments are invalid
	 */
	const describe = (
		description: string,
		testFunction: () => void,
		collapsed = false
	): void => {
		if (typeof description !== 'string') {
			throw new TypeError('first argument must be a string');
		}
		if (typeof testFunction !== 'function') {
			throw new TypeError('second argument must be a function');
		}

		// Start console group (collapsed or expanded)
		if (collapsed) {
			console.groupCollapsed(`%c${description}`, 'font-weight: bold;');
		} else {
			console.group(`%c${description}`, 'font-weight: bold;');
		}

		// Execute test suite and handle any suite-level errors
		try {
			testFunction();
		} catch (err: unknown) {
			console.error('%cSUITE ERROR:', 'font-weight: bold;', err);
		}

		console.groupEnd();

		// Reset hooks after suite completion
		beforeEachCallback = null;
		afterEachCallback = null;
	};

	// Return the sync test framework interface
	return {
		/**
		 * Sets up a function to run before each test
		 * @param callBack - Function to execute before each test
		 * @throws TypeError if callback is not a function
		 */
		beforeEach: (callBack: () => void): void => {
			if (typeof callBack !== 'function') {
				throw new TypeError('beforeEach argument is not a function');
			}

			beforeEachCallback = callBack;
		},

		/**
		 * Sets up a function to run after each test
		 * @param callBack - Function to execute after each test
		 * @throws TypeError if callback is not a function
		 */
		afterEach: (callBack: () => void): void => {
			if (typeof callBack !== 'function') {
				throw new TypeError('afterEach argument is not a function');
			}

			afterEachCallback = callBack;
		},

		describe,
		it: unit,

		suite: describe,
		test: unit,
	};
};

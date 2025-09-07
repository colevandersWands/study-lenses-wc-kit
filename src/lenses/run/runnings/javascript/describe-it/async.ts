/**
 * Async Testing Framework - TypeScript Implementation
 *
 * Provides a Jest-like testing framework with support for nested describes,
 * async/await test functions, promise handling, and detailed console reporting.
 *
 * Features:
 * - Nested describe blocks with hierarchical reporting
 * - Async and sync test execution with timing
 * - Console call capture during test execution
 * - Promise-based test resolution
 * - beforeEach hooks
 *
 * @example
 * const { describe, it, beforeEach } = describeIt();
 *
 * describe('Math operations', () => {
 *   beforeEach(() => {
 *     // Setup code
 *   });
 *
 *   it('should add numbers', async () => {
 *     expect(2 + 2).toBe(4);
 *   });
 * });
 */

import type {
	WindowLike,
	TestReport,
	TestFramework,
	TestFrameworkFactory,
} from './types.js';

/**
 * Creates an async testing framework instance
 *
 * @param aWindow - Window-like object with console interface (defaults to { console })
 * @returns Testing framework with describe, it, beforeEach functions
 */
export const describeIt: TestFrameworkFactory = (
	aWindow: WindowLike = { console }
): TestFramework => {
	let describeDepth = 0;
	let itDepth = 0;
	let beforeEachCallback: (() => void) | null = null;

	let currentReports: Promise<TestReport>[] = [];

	// console output is blocked in a testing window
	//  the render functions use consoleBackup
	const consoleBackup = Object.assign({}, aWindow.console);
	// for (let key in aWindow.console) {
	//   if (typeof aWindow.console[key] === "function") {
	//     aWindow.console[key] = function () {};
	//   }
	// }

	/**
	 * Renders a single test (it) report to console with styling
	 * @param report - The test report to render
	 */
	const renderIt = (report: TestReport): void => {
		const asyncReport: boolean = report.ms !== null;
		if (report.error) {
			consoleBackup.groupCollapsed(
				`%c✖ FAIL${asyncReport ? ` (${report.ms} ms)` : ''}: ${
					report.description
				}`,
				'font-weight: bold; color: red;'
			);
			for (const call of report.consoleCalls) {
				(consoleBackup as any)[call.method](...call.args);
			}
			if (report.error instanceof Error) {
				consoleBackup.error(
					`${report.error.name}: ${report.error.message}`
				);
			} else {
				consoleBackup.error(report.error);
			}
			consoleBackup.groupEnd();
		} else {
			if (report.consoleCalls.length === 0) {
				consoleBackup.log(
					`%c√ PASS${asyncReport ? ` (${report.ms} ms)` : ''}: ${
						report.description
					}`,
					'font-weight: bold; color: green;'
				);
			} else {
				consoleBackup.groupCollapsed(
					`%c√ PASS: ${report.description}`,
					'font-weight: bold; color: green;'
				);
				for (const call of report.consoleCalls) {
					(consoleBackup as any)[call.method](...call.args);
				}
				consoleBackup.groupEnd();
			}
		}
	};

	/**
	 * Renders a describe block report with all child tests
	 * @param report - The describe block report to render
	 */
	const renderDescribe = (report: TestReport): void => {
		consoleBackup.group(report.description);
		for (const child of report.children || []) {
			if (child.type === 'it') {
				renderIt(child);
			} else {
				renderDescribe(child);
			}
		}
		if (report.error) {
			consoleBackup.error(
				'%cSUITE ERROR:',
				'font-weight: bold;',
				report.error
			);
		}
		consoleBackup.groupEnd();
	};

	/**
	 * Recursively resolves all test reports and their children
	 * @param report - Promise of a test report to resolve
	 * @returns Fully resolved test report with all children resolved
	 */
	const resolveReport = async (
		report: Promise<TestReport>
	): Promise<TestReport> => {
		const resolvedReport: TestReport = await report;

		if (Array.isArray(resolvedReport.children)) {
			resolvedReport.children = await Promise.all(
				(
					resolvedReport.children as unknown as Promise<TestReport>[]
				).map(resolveReport)
			);
		}

		return resolvedReport;
	};

	// ------

	/**
	 * Sets up a function to run before each test
	 * @param callBack - Function to execute before each test
	 * @throws TypeError if callback is not a function
	 */
	const beforeEach = (callBack: () => void): void => {
		if (typeof callBack !== 'function') {
			throw new TypeError('beforeEach argument is not a function');
		}

		beforeEachCallback = callBack;
	};

	/**
	 * Creates a test suite with nested tests
	 * @param description - Description of the test suite
	 * @param testFunction - Function containing test definitions
	 * @throws TypeError if arguments are invalid
	 */
	const describe = async (
		description: string,
		testFunction: () => void
	): Promise<void> => {
		if (typeof description !== 'string') {
			throw new TypeError('first argument must be a string');
		}
		if (typeof testFunction !== 'function') {
			throw new TypeError('second argument must be a function');
		}
		if (testFunction.constructor.name === 'AsyncFunction') {
			throw new TypeError('second argument cannot be an async function');
		}

		describeDepth++;

		const parentReports: Promise<TestReport>[] = currentReports;

		const report: TestReport = {
			type: 'describe',
			description,
			testFunction,
			children: [],
			consoleCalls: [],
			error: null,
		};
		const reportPromise: Promise<TestReport> = new Promise((res) =>
			res(report)
		);
		parentReports.push(reportPromise);

		currentReports = report.children as unknown as Promise<TestReport>[];

		try {
			testFunction();
		} catch (err: unknown) {
			report.error = err instanceof Error ? err : new Error(String(err));
		}

		describeDepth--;

		if (describeDepth === 0) {
			resolveReport(reportPromise).then(renderDescribe);
		}

		currentReports = parentReports;
	};

	/**
	 * Defines an individual test case
	 * @param description - Description of the test
	 * @param testFunction - Test function (sync or async)
	 * @throws Error if called inside another it block
	 * @throws TypeError if arguments are invalid
	 */
	const it = async (
		description: string,
		testFunction: () => void | Promise<void>
	): Promise<void> => {
		// commented in favor of immediately logging free-floating `it`s
		// if (describeDepth < 1) {
		//   throw new Error("cannot call `it` outside of a `describe`");
		// }
		if (itDepth > 0) {
			throw new Error('cannot call `it` inside of an `it`');
		}
		if (typeof description !== 'string') {
			throw new TypeError('first argument must be a string');
		}
		if (typeof testFunction !== 'function') {
			throw new TypeError('second argument must be a function');
		}

		if (beforeEachCallback) {
			try {
				beforeEachCallback();
			} catch (err: unknown) {
				console.error('%cbeforeEach Error:', 'font-weight: bold;');
				throw err;
			}
		}

		itDepth++;

		const report: TestReport = {
			type: 'it',
			description,
			testFunction,
			consoleCalls: [],
			error: null,
			ms: null,
		};

		if (testFunction.constructor.name === 'AsyncFunction') {
			const promiseReport: Promise<TestReport> = new Promise((res) => {
				const now: number = Date.now();
				(testFunction as () => Promise<void>)()
					.then(() => {
						report.ms = Date.now() - now;
						res(report);
					})
					.catch((err: unknown) => {
						report.ms = Date.now() - now;
						report.error =
							err instanceof Error ? err : new Error(String(err));
						res(report);
					});
			});

			// immediately log free-floating `it`s
			if (describeDepth === 0) {
				renderIt(await promiseReport);
			} else {
				currentReports.push(promiseReport);
			}
		} else {
			let returned: unknown;
			const now: number = Date.now();
			try {
				returned = testFunction();
			} catch (err: unknown) {
				report.error =
					err instanceof Error ? err : new Error(String(err));
			}

			if (returned && typeof (returned as any).then === 'function') {
				currentReports.push(
					(returned as Promise<any>)
						.then(() => {
							report.ms = Date.now() - now;
							return report;
						})
						.catch((err: unknown) => {
							report.ms = Date.now() - now;
							report.error =
								err instanceof Error
									? err
									: new Error(String(err));
							return report;
						})
				);
			}
			// immediately log free-floating `it`s// immediately log free-floating `it`s
			else if (describeDepth === 0) {
				renderIt(report);
			} else {
				currentReports.push(Promise.resolve(report));
			}
		}

		itDepth--;
	};

	// Return the test framework interface
	return {
		describe,
		suite: describe,
		it,
		test: it,
		beforeEach,
	};
};

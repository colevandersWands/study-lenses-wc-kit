/**
 * Register All Web Components Utility
 * Pure function to recursively register web components with no side effects
 *
 * This utility traverses any object structure and automatically calls any `register` functions
 * it finds, collecting the results for debugging and verification. Used primarily to
 * auto-register all web components from the main Study Lenses export.
 */

import type { RegisterableContainer, RegistrationResult } from '../types.js';

/**
 * Recursively traverse an object and call any 'register' functions found
 *
 * @param obj - Object to traverse (typically the main Study Lenses export)
 * @param path - Current path for debugging (internal use, builds dot-separated path)
 * @returns Array of registration results with path and tag name information
 *
 * @example
 * ```typescript
 * import sl from './index.js';
 * import { registerAllWC } from './utils/register-all-wc.js';
 *
 * // Register all web components and get results
 * const results = registerAllWC(sl);
 * console.log(`Registered ${results.length} components:`);
 * results.forEach(({ path, tagName }) => {
 *   console.log(`  ${tagName} from ${path}`);
 * });
 * ```
 */
export const registerAllWC = (
	obj: RegisterableContainer,
	path = ''
): RegistrationResult[] => {
	const registered: RegistrationResult[] = [];

	for (const [key, value] of Object.entries(obj)) {
		const currentPath: string = path ? `${path}.${key}` : key;

		if (value && typeof value === 'object') {
			// If it has a register function, call it
			if (typeof value.register === 'function') {
				try {
					const tagName: string = value.register();
					const result: RegistrationResult = {
						path: currentPath,
						tagName,
					};
					registered.push(result);
					console.log(`✅ Registered: ${tagName} (${currentPath})`);
				} catch (error) {
					console.error(
						`❌ Failed to register ${currentPath}:`,
						error
					);
				}
			}

			// Recursively check nested objects
			const nested: RegistrationResult[] = registerAllWC(
				value as RegisterableContainer,
				currentPath
			);
			registered.push(...nested);
		}
	}

	return registered;
};

// Default export for convenience
export default registerAllWC;

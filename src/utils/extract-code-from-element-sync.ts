/**
 * Synchronous version for backwards compatibility (doesn't support file paths)
 */

import { isFilePath } from './is-file-path.js';

// Synchronous version for backwards compatibility (doesn't support file paths)
export const extractCodeFromElementSync = (element: Element): string => {
	const codeAttr = element.getAttribute('code');
	if (codeAttr && !isFilePath(codeAttr)) {
		try {
			return decodeURIComponent(atob(codeAttr));
		} catch {
			return codeAttr;
		}
	}
	return element.textContent?.trim() || '';
};

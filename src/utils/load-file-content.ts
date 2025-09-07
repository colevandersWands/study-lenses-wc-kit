/**
 * Load file content and extract metadata
 */

// Load file content and extract metadata
export const loadFileContent = async (
	path: string
): Promise<{ code: string; lang: string; test: boolean }> => {
	try {
		const response = await fetch(path);
		if (!response.ok) {
			throw new Error(`Failed to load file: ${path}`);
		}
		const code = await response.text();

		// Extract lang from extension
		const ext = path.split('.').pop() || '';
		const lang = ext === 'mjs' ? 'js' : ext;

		// Check if test file
		const test = path.includes('.test.') || path.includes('.spec.');

		return { code, lang, test };
	} catch (error) {
		console.error(`Error loading file ${path}:`, error);
		throw error;
	}
};

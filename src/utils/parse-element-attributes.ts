/**
 * Parse HTML element attributes into config object
 */

// Parse HTML element attributes into config object
export const parseElementAttributes = (
	element: Element
): Record<string, any> => {
	const config: Record<string, any> = {};

	Array.from(element.attributes).forEach((attr) => {
		// Skip standard attributes handled elsewhere
		if (['code', 'lang', 'test', 'lenses'].includes(attr.name)) {
			return;
		}

		const value = attr.value;
		// Parse common types
		if (value === 'true') {
			config[attr.name] = true;
		} else if (value === 'false') {
			config[attr.name] = false;
		} else if (!isNaN(Number(value)) && value !== '') {
			config[attr.name] = Number(value);
		} else {
			config[attr.name] = value;
		}
	});

	return config;
};

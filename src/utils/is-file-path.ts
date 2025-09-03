/**
 * Check if a value is a file path
 */

// Check if a value is a file path
export const isFilePath = (value: string): boolean => {
  return (
    value.startsWith('./') ||
    value.startsWith('../') ||
    value.startsWith('/') ||
    /\.(js|mjs)$/.test(value)
  );
};

/**
 * Extract lens names from lenses attribute
 */

// Extract lens names from lenses attribute
export const parseLensesAttribute = (lensesAttr: string | null): string[] => {
  if (!lensesAttr) return [];
  // Support both spaces and commas as separators
  return lensesAttr.split(/[\s,]+/).filter(Boolean);
};

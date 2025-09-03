/**
 * Check if element is descendant of study-lenses component
 */

// Check if element is descendant of study-lenses component
export const isChildOfStudyLenses = (element: Element): boolean => {
  return element.closest('study-lenses') !== null;
};

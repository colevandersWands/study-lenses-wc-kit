/**
 * Find all lens elements within a container (at any nesting level)
 */

// Find all lens elements within a container (at any nesting level)
export const findLensElements = (container: Element): Element[] => {
  // Use CSS selector to find all elements with tag names starting with 'sl-'
  return Array.from(container.querySelectorAll('[tag-name^="sl-"]'));
};

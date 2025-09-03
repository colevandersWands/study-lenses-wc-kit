/**
 * Extract code from element with precedence-based discovery
 */

// Check if a value is a file path (internal helper)
const isFilePath = (value: string): boolean => {
  return (
    value.startsWith('./') ||
    value.startsWith('../') ||
    value.startsWith('/') ||
    /\.(js|mjs)$/.test(value)
  );
};

// Load file content and extract metadata (internal helper)
const loadFileContent = async (
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

// Extract code from element with precedence-based discovery
export const extractCodeFromElement = async (element: Element): Promise<string> => {
  // 1. Own code attribute (highest priority)
  const codeAttr = element.getAttribute('code');
  if (codeAttr) {
    if (isFilePath(codeAttr)) {
      const { code } = await loadFileContent(codeAttr);
      return code;
    }
    // Try base64 decode, fallback to plain text
    try {
      return decodeURIComponent(atob(codeAttr));
    } catch {
      return codeAttr; // Plain text
    }
  }

  // 1.5. Own src attribute (fallback from code)
  const srcAttr = element.getAttribute('src');
  if (srcAttr) {
    if (isFilePath(srcAttr)) {
      const { code } = await loadFileContent(srcAttr);
      return code;
    }
    // src should be a file path, but handle as fallback
    return srcAttr;
  }

  // 2. textContent
  const textContent = element.textContent?.trim();
  if (textContent && !element.querySelector('sl-snippet')) {
    // Only use textContent if there's no child snippet
    return textContent;
  }

  // 3. Child snippet
  const childSnippet = element.querySelector(':scope > sl-snippet');
  if (childSnippet) {
    return extractCodeFromElement(childSnippet);
  }

  // 4. Parent context (snippet or study-lenses with code/src)
  const parentSnippet = element.closest('sl-snippet');
  const parentStudyLenses = element.closest('study-lenses[code], study-lenses[src]');

  if (parentSnippet) {
    // Special case: check for sibling snippet first
    const siblingSnippets = Array.from(parentSnippet.querySelectorAll(':scope > sl-snippet'));
    const siblingSnippet = siblingSnippets.find((s) => s !== element && !s.contains(element));

    if (siblingSnippet) {
      return extractCodeFromElement(siblingSnippet);
    }
    // Otherwise use parent snippet's code (code takes precedence over src)
    const parentCode = parentSnippet.getAttribute('code');
    const parentSrc = parentSnippet.getAttribute('src');
    const parentCodeOrSrc = parentCode || parentSrc;

    if (parentCodeOrSrc) {
      if (isFilePath(parentCodeOrSrc)) {
        const { code } = await loadFileContent(parentCodeOrSrc);
        return code;
      }
      try {
        return decodeURIComponent(atob(parentCodeOrSrc));
      } catch {
        return parentCodeOrSrc;
      }
    }
  }

  if (parentStudyLenses && parentStudyLenses !== element) {
    return extractCodeFromElement(parentStudyLenses);
  }

  // 5. Sibling snippet (in study-lenses)
  const studyContainer = element.closest('study-lenses');
  if (studyContainer && studyContainer !== element) {
    const siblingSnippet = studyContainer.querySelector(':scope > sl-snippet');
    if (siblingSnippet && siblingSnippet !== element) {
      return extractCodeFromElement(siblingSnippet);
    }
  }

  return '';
};

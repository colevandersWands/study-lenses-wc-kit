/**
 * Procedural component setup functions
 * All logic in pure functions - components just call these
 */

import { render } from 'preact';
import type { ComponentChild } from 'preact';
import { pipe } from '../study/pipe.js';
import { extractCodeFromElement } from '../utils/extract-code-from-element.js';
import { parseElementAttributes } from '../utils/parse-element-attributes.js';
import lensRegistry from '../lenses/index.js';
import type { LensFunction, LensOutput, StudyOutput, LensSpec } from '../types.js';

/**
 * Set up pipeline mode - process lenses sequentially
 * Supports backward compatibility by converting string lens names to LensSpec objects
 */
export const setupPipelineMode = async (
  element: HTMLElement,
  lensNames: string[]
): Promise<void> => {
  const code = await extractCodeFromElement(element);
  const lang = element.getAttribute('lang') || 'js';
  const test = element.hasAttribute('test');

  try {
    // Convert string lens names to LensSpec array for backward compatibility
    const lensSpecs: LensSpec[] = lensNames.map((lensName) => {
      const lensObj = lensRegistry[lensName as keyof typeof lensRegistry];
      if (!lensObj) {
        console.warn(`Lens "${lensName}" not found in registry`);
        // Return a dummy function that warns
        return async () => ({
          snippet: { code, lang, test },
          view: null,
        });
      }
      return lensObj; // Return the full lens object (Pattern 2)
    });

    const result = await pipe({ code, lang, test }, lensSpecs);

    renderPipelineResult(element, result);
  } catch (error) {
    renderError(
      element,
      `Pipeline failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

/**
 * Set up study panel mode - distribute code to child lenses OR run pipeline in snippet
 */
export const setupStudyPanelMode = async (element: HTMLElement): Promise<void> => {
  const code = await extractCodeFromElement(element);

  if (!code) {
    console.warn('Study panel mode: No code found to distribute');
    return;
  }

  // Simplified mode detection: always distribute code to child lenses
  // The individual lens components will handle their own pipeline behavior
  distributeCodesToLenses(element, code);
};

/**
 * Distribute code to child lenses
 */
const distributeCodesToLenses = (element: HTMLElement, code: string): void => {
  const encodedCode = btoa(encodeURIComponent(code));

  // Find all sl-* elements at any nesting level
  const lensElements = Array.from(element.querySelectorAll('sl-*'));

  lensElements.forEach((lensElement) => {
    // Only set code if element doesn't already have it
    if (!lensElement.hasAttribute('code')) {
      lensElement.setAttribute('code', encodedCode);

      // Re-trigger processing if element supports it
      if (
        'connectedCallback' in lensElement &&
        typeof lensElement.connectedCallback === 'function'
      ) {
        lensElement.connectedCallback();
      }
    }
  });
};

/**
 * Set up individual lens component
 */
export const setupLensComponent = async (
  element: HTMLElement,
  lensName: string,
  lensFunction: LensFunction
): Promise<void> => {
  const config = parseElementAttributes(element);
  const code = await extractCodeFromElement(element);
  const lang = element.getAttribute('lang') || 'js';
  const test = element.hasAttribute('test');

  if (!code) {
    console.warn(`Lens "${lensName}": No code found to process`);
    return;
  }

  try {
    const result = await lensFunction({ code, lang, test }, config);

    renderLensResult(element, result, lensName);
  } catch (error) {
    renderError(
      element,
      `Lens "${lensName}" failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

// Pure rendering functions

/**
 * Render a view (HTMLElement or JSX component) into a container
 */
const renderView = (container: HTMLElement, view: HTMLElement | ComponentChild): void => {
  if (view instanceof HTMLElement) {
    // Regular DOM element - append directly
    container.appendChild(view);
  } else {
    // JSX component - use Preact render
    render(view, container);
  }
};

/**
 * Render pipeline result
 */
const renderPipelineResult = (element: HTMLElement, result: StudyOutput): void => {
  element.innerHTML = '';

  if (result.view) {
    // Pipeline produced a view - render it (supports both HTMLElement and JSX)
    renderView(element, result.view);
  } else if (result.snippet.code) {
    // Pipeline produced transformed code - show it
    const pre = document.createElement('pre');
    pre.textContent = result.snippet.code;
    pre.setAttribute('data-result', 'pipeline');
    element.appendChild(pre);
  }
  // If neither view nor code, element remains empty
};

/**
 * Render individual lens result
 */
const renderLensResult = (element: HTMLElement, result: LensOutput, lensName: string): void => {
  // Check if this lens is inside a study-lenses component
  if (element.closest('study-lenses') !== null) {
    // Parent will handle rendering - don't render here
    return;
  }

  element.innerHTML = '';

  if (result.view) {
    // Lens produced a view - render it (supports both HTMLElement and JSX)
    renderView(element, result.view);
  } else if (result.snippet.code) {
    // Lens transformed code - show the result
    const pre = document.createElement('pre');
    pre.textContent = result.snippet.code;
    pre.setAttribute('data-lens', lensName);
    element.appendChild(pre);
  }
};

/**
 * Render error message
 */
const renderError = (element: HTMLElement, message: string): void => {
  element.innerHTML = '';
  const errorDiv = document.createElement('div');
  errorDiv.style.color = 'red';
  errorDiv.style.padding = '8px';
  errorDiv.style.border = '1px solid red';
  errorDiv.style.borderRadius = '4px';
  errorDiv.style.backgroundColor = '#ffebee';
  errorDiv.textContent = message;
  element.appendChild(errorDiv);
};

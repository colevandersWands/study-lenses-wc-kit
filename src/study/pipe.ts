/**
 * Study Pipeline Lens Function
 * Smart pipeline processing - processes lenses sequentially until terminus
 * Now supports flexible LensSpec array: functions, lens objects, and config overrides
 */

import type {
  Snippet,
  StudyOutput,
  LensFunction,
  LensObject,
  LensConfig,
  LensSpec,
} from '../types.js';

/**
 * Run code through lens pipeline until terminus
 *
 * Pipeline stops when:
 * 1. A lens returns a ui (HTMLElement or JSX component)
 * 2. A lens returns falsey non-string (undefined, null, false) indicating side effect
 *
 * Supports 4 LensSpec patterns:
 * 1. Function: myFunc → call myFunc(snippet)
 * 2. Lens object: lensObj → call lensObj.lens(snippet, lensObj.config?.() || {})
 * 3. [Function, config]: [myFunc, {...}] → call myFunc(snippet, config)
 * 4. [Lens object, config]: [lensObj, {...}] → call lensObj.lens(snippet, lensObj.config?.(config) || config)
 *
 * @param snippet The code snippet to process
 * @param lenses Array of lens specifications (functions, objects, or [item, config] tuples)
 * @returns Final result with snippet and optional ui
 */
export const pipeLenses = async (snippet: Snippet, lenses: LensSpec[] = []): Promise<StudyOutput> => {
  let currentSnippet = { ...snippet };

  for (const lensSpec of lenses) {
    let lensFunction: LensFunction;
    let lensConfig: LensConfig = {};
    let lensName: string = 'unknown';

    try {
      // Process the 4 LensSpec patterns
      if (Array.isArray(lensSpec)) {
        const [lensOrFunction, config] = lensSpec;

        if (typeof lensOrFunction === 'function') {
          // Pattern 3: [function, config]
          lensFunction = lensOrFunction;
          lensConfig = config || {};
          lensName = lensOrFunction.name || 'custom-function';
        } else {
          // Pattern 4: [lensObj, config] - deep merge with defaults
          lensFunction = lensOrFunction.lens;
          lensName = lensOrFunction.name || 'unknown-lens';
          lensConfig = lensOrFunction.config?.(config) || config || {};
        }
      } else if (typeof lensSpec === 'function') {
        // Pattern 1: Just function
        lensFunction = lensSpec;
        lensName = lensSpec.name || 'custom-function';
        lensConfig = {};
      } else {
        // Pattern 2: Lens object
        lensFunction = lensSpec.lens;
        lensName = lensSpec.name || 'unknown-lens';
        lensConfig = lensSpec.config?.() || {};
      }

      const result = await lensFunction(currentSnippet, lensConfig);

      // Terminus condition 1: UI returned (visual output)
      if (result.ui) {
        return {
          snippet: result.snippet,
          ui: result.ui,
        };
      }

      // Terminus condition 2: Falsey non-string (side effect completed)
      if (
        !result.snippet ||
        (typeof result.snippet !== 'object' && typeof result.snippet !== 'string')
      ) {
        return {
          snippet: currentSnippet, // Return pre-side-effect snippet
          ui: null,
        };
      }

      // Continue pipeline with modified snippet
      currentSnippet = result.snippet;
    } catch (error) {
      console.error(`Pipeline failed at lens "${lensName}":`, error);
      // Fail-fast for MVP - throw error to stop pipeline
      throw new Error(
        `Lens "${lensName}" failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // Pipeline completed without terminus - return final snippet
  return {
    snippet: currentSnippet,
    ui: null,
  };
};

/**
 * Validate pipeline input with flexible LensSpec array
 */
export const validatePipelineInput = (snippet: Snippet, lenses: LensSpec[]): string[] => {
  const errors: string[] = [];

  if (!snippet?.code) {
    errors.push('Snippet code is required');
  }

  if (!lenses || lenses.length === 0) {
    errors.push('At least one lens is required');
  }

  // Check if all lens specs are valid
  lenses.forEach((lensSpec, index) => {
    if (Array.isArray(lensSpec)) {
      const [lensOrFunction, config] = lensSpec;

      if (typeof lensOrFunction === 'function') {
        // [function, config] - function should be valid
        if (!lensOrFunction) {
          errors.push(`Lens spec at index ${index}: function is null or undefined`);
        }
      } else {
        // [lensObj, config] - should have lens property
        if (!lensOrFunction?.lens || typeof lensOrFunction.lens !== 'function') {
          errors.push(`Lens spec at index ${index}: lens object missing valid .lens function`);
        }
      }
    } else if (typeof lensSpec === 'function') {
      // Just function - should be valid
      if (!lensSpec) {
        errors.push(`Lens spec at index ${index}: function is null or undefined`);
      }
    } else {
      // Lens object - should have lens property
      if (!lensSpec?.lens || typeof lensSpec.lens !== 'function') {
        errors.push(`Lens spec at index ${index}: lens object missing valid .lens function`);
      }
    }
  });

  return errors;
};

// Default export for convenience
export default pipeLenses;

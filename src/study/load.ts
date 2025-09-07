/**
 * Dynamic lens loading utility
 * Allows runtime addition of lens objects to the registry
 */

import lensRegistry from '../lenses/index.js';
import type { LensObject, LensFunction } from '../types.js';

/**
 * Load a lens object into the runtime registry
 *
 * @param lensObj - Lens object with name, lens function, and optional view/config
 * @returns boolean - true if successfully loaded, false if invalid
 */
export const load = (lensObj: any): boolean => {
  try {
    // Validate lens object structure
    if (!lensObj || typeof lensObj !== 'object') {
      console.warn('Invalid lens object: must be an object');
      return false;
    }

    if (!lensObj.name || typeof lensObj.name !== 'string') {
      console.warn('Invalid lens object: missing or invalid name property');
      return false;
    }

    if (!lensObj.lens || typeof lensObj.lens !== 'function') {
      console.warn('Invalid lens object: missing or invalid lens function');
      return false;
    }

    // Create a complete lens object with defaults for missing optional properties
    const completeLensObj: LensObject = {
      name: lensObj.name,
      lens: lensObj.lens as LensFunction,
      register: lensObj.register || (() => ''), // Optional - lens doesn't need web component
      config: lensObj.config || (() => ({})), // Default empty config factory
    };

    // Add to registry (mutating the imported registry object)
    (lensRegistry as any)[completeLensObj.name] = completeLensObj;

    console.log(`✅ Lens "${completeLensObj.name}" loaded successfully`);
    return true;
  } catch (error) {
    console.error('Failed to load lens:', error);
    return false;
  }
};

export default load;

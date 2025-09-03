/**
 * Format Lens Configuration
 * Classic tab-based Prettier defaults with full configuration support
 */

import { deepMerge } from '../../utils/deep-merge.js';
import type { PrettierOptions } from './format-utils.js';

/**
 * Classic tab-based default configuration for professional code formatting
 * These defaults follow traditional JavaScript formatting conventions
 */
const defaultConfig: PrettierOptions = {
  parser: 'babel', // Will be auto-selected based on snippet.lang
  useTabs: true,          // Classic tab indentation
  tabWidth: 4,            // 4-space tab width for display
  semi: true,             // Always add semicolons
  singleQuote: false,     // Use double quotes (classic style)
  trailingComma: 'none',  // No trailing commas (classic style)  
  bracketSpacing: true,   // Spaces inside object literals { foo: bar }
  arrowParens: 'always',  // Always parentheses around arrow function parameters
  printWidth: 80,         // Classic line length
  endOfLine: 'lf',        // Unix line endings
  quoteProps: 'as-needed', // Only quote props when needed
  jsxSingleQuote: false,  // Use double quotes in JSX
  bracketSameLine: false, // Put > on next line in JSX
};

/**
 * Configuration factory function with deep merge support
 * Allows partial overrides while preserving default values
 * 
 * @param overrides - Partial configuration to merge with defaults
 * @returns Complete configuration object with overrides applied
 */
export const config = (overrides: Partial<PrettierOptions> = {}): PrettierOptions => {
  return deepMerge(defaultConfig, overrides || {});
};

export default config;
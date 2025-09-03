/**
 * Self-contained Prettier formatting utilities
 * All Prettier integration logic contained within this file
 */

import { format } from 'prettier/standalone';
import * as parserBabel from 'prettier/plugins/babel';
import * as parserEstree from 'prettier/plugins/estree';

/**
 * Prettier formatting options interface
 * Includes all common Prettier configuration options
 */
export interface PrettierOptions {
  parser?: string;
  plugins?: unknown[];
  useTabs?: boolean;
  tabWidth?: number;
  semi?: boolean;
  singleQuote?: boolean;
  trailingComma?: 'none' | 'es5' | 'all';
  bracketSpacing?: boolean;
  arrowParens?: 'always' | 'avoid';
  printWidth?: number;
  endOfLine?: 'lf' | 'crlf' | 'cr' | 'auto';
  quoteProps?: 'as-needed' | 'consistent' | 'preserve';
  jsxSingleQuote?: boolean;
  bracketSameLine?: boolean;
}

/**
 * Format JavaScript code using Prettier with self-contained setup
 * @param code - JavaScript code to format
 * @param options - Prettier formatting options
 * @returns Formatted code or original code with error comment on failure
 */
export async function formatJavaScript(code: string, options: PrettierOptions): Promise<string> {
  // Return empty code as-is
  if (!code || !code.trim()) {
    return code;
  }

  try {
    const formatted = await format(code, {
      plugins: [parserBabel, parserEstree] as any,
      ...options,
    });
    
    return formatted;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn('Format lens: Prettier formatting failed:', errorMessage);
    
    // Return original code with error comment for graceful degradation
    return code + '\n// Unable to format code - check console for details';
  }
}

/**
 * Basic validation to check if code can be formatted
 * @param code - Code to validate
 * @returns True if code appears to be valid for formatting
 */
export function canFormat(code: unknown): code is string {
  return typeof code === 'string' && code.trim().length > 0;
}

/**
 * Auto-select appropriate parser based on file language
 * @param lang - Language identifier ('js', 'mjs', etc.)
 * @returns Appropriate parser name for Prettier
 */
export function selectParser(lang: string): string {
  switch (lang) {
    case 'js':
    case 'mjs':
    case 'javascript':
      return 'babel';
    case 'ts':
    case 'typescript':
      return 'typescript';
    case 'jsx':
      return 'babel';
    case 'tsx':
      return 'typescript';
    default:
      return 'babel'; // Default to babel for JavaScript-like languages
  }
}
/**
 * Type definitions for Study Lenses system
 * Pure type definitions only - no implementation
 */

// Import Preact types for JSX support
import type { ComponentChild } from 'preact';

export interface Snippet {
  code: string;
  lang: string;
  test: boolean;
}

// Config can be ANY serializable value - lens decides what it expects
export type LensConfig = any;

export interface LensOutput {
  snippet: Snippet | null | undefined | false; // null/undefined/false for side effects
  ui: HTMLElement | ComponentChild | null; // Now supports JSX components
}

// Lens function signatures - supports both sync and async lenses
export type SyncLensFunction = (snippet: Snippet, config?: LensConfig) => LensOutput;
export type AsyncLensFunction = (snippet: Snippet, config?: LensConfig) => Promise<LensOutput>;
export type LensFunction = SyncLensFunction | AsyncLensFunction;

// Lens object structure with self-describing name
export interface LensObject {
  name: string;
  lens: LensFunction;
  register: () => string; // Register function that returns tag name
  config: (overrides?: any | null) => LensConfig; // Config factory function
}

// Flexible lens specification - supports 4 patterns
export type LensSpec =
  | LensFunction // Simple function
  | LensObject // Library lens object
  | [LensFunction, LensConfig] // Function with config
  | [LensObject, LensConfig]; // Library lens with config override

// Code source tracking for debugging
export interface CodeSource {
  code: string;
  lang: string;
  test: boolean;
  source: 'attribute' | 'textContent' | 'child' | 'parent' | 'sibling' | 'file';
}

// Study pipeline types - pipe(snippet, lenses) signature
export interface StudyOutput {
  snippet: Snippet | null | undefined | false; // null/undefined/false for side effects
  ui: HTMLElement | ComponentChild | null; // Supports JSX components
}

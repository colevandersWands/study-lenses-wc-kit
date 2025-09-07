/**
 * URL generators for external JavaScript study tools
 *
 * This module provides functions that generate URLs to open JavaScript code
 * in various external visualization and debugging tools. Each function takes
 * a code string and returns a properly formatted URL.
 */

import LZString from 'lz-string';
import type { URLGenerator } from './types.js';

export const URLGenerators = {
  jsTutor,
  jsViz,
  jsv9000,
  promisees,
  loupe,
  esprima,
};

/**
 * Generates URL for Python Tutor JavaScript visualizer
 * Encodes and sanitizes code for iframe embedding
 */
var jsTutor: URLGenerator = (code: string): string => {
  const encodedJST = encodeURIComponent(code);
  const sanitizedJST = encodedJST
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/%09/g, '%20%20');
  const jsTutorURL =
    // 'http://www.pythontutor.com/visualize.html#code=' +
    'http://www.pythontutor.com/iframe-embed.html#code=' +
    sanitizedJST +
    '&cumulative=false&curInstr=0&heapPrimitives=nevernest&mode=display&origin=opt-frontend.js&py=js&rawInputLstJSON=%5B%5D&textReferences=false';
  return jsTutorURL;
};

/**
 * Generates URL for JSViz tool
 * Uses LZ-string compression for code parameter
 */
var jsViz: URLGenerator = (code: string): string => {
  const encoded = LZString.compressToEncodedURIComponent(code);
  const url = `https://jsviz.klve.nl/#?code=${encoded}`;
  return url;
};

/**
 * Generates URL for JSV9000 JavaScript visualizer
 * Uses base64 encoding for code parameter
 */
var jsv9000: URLGenerator = (code: string): string => {
  const encoded = encodeURIComponent(btoa(code));
  const jsv9000Url = 'https://www.jsv9000.app/?code=' + encoded;
  return jsv9000Url;
};

/**
 * Generates URL for Promisees promise visualization
 * Specialized for Promise chains and async/await
 */
var promisees: URLGenerator = (code: string): string => {
  const encoded = encodeURIComponent(code).replace(/%20/g, '+');
  const URL = 'https://bevacqua.github.io/promisees/#code=' + encoded;
  return URL;
};

/**
 * Generates URL for Loupe event loop visualizer
 * Best for understanding async JavaScript execution
 */
var loupe: URLGenerator = (code: string): string => {
  const encoded = encodeURIComponent(btoa(code));
  const loupeURL = 'http://latentflip.com/loupe/?code=' + encoded + '!!!';
  return loupeURL;
};

/**
 * Generates URL for Esprima AST parser demo
 * Shows abstract syntax tree representation
 */
var esprima: URLGenerator = (code: string): string => {
  const encoded = encodeURIComponent(code);
  const URL = 'https://esprima.org/demo/parse.html?code=' + encoded;
  return URL;
};

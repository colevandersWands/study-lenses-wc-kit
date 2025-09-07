/**
 * Lenses Main Barrel Export
 * Dynamic key generation using name.ts for compile-time safety
 * Registry is mutable to support runtime lens loading via study.load()
 */

// Import lens objects
import reverse from './reverse/index.js';
import uppercase from './uppercase/index.js';
import lowercase from './lowercase/index.js';
import jsxDemo from './jsx-demo/index.js';
import format from './format/index.js';
import loopGuard from './loop-guard/index.js';
import debug from './debug/index.js';
import run from './run/index.js';

// Generate mutable export object using names as keys (compile-time deterministic)
// Note: Removed 'as const' to allow runtime mutations from study.load()
export default {
	[reverse.name]: reverse, // 'reverse': reverseObj
	[uppercase.name]: uppercase, // 'uppercase': uppercaseObj
	[lowercase.name]: lowercase, // 'lowercase': lowercaseObj
	[jsxDemo.name]: jsxDemo, // 'jsx-demo': jsxDemoObj
	[format.name]: format, // 'format': formatObj
	[loopGuard.name]: loopGuard, // 'loop-guard': loopGuardObj
	[debug.name]: debug, // 'debug': debugObj
	[run.name]: run, // 'run': runObj
};

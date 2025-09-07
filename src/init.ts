/**
 * Study Lenses Web Components Initialization
 * Side-effect only file - no exports
 * Import this in HTML to auto-register all web components:
 * <script type="module" src="path/to/init.js"></script>
 */

import studyLenses from './index.js';
import { registerAllWC } from './utils/register-all-wc.js';

// Register all web components on import
const registered = registerAllWC(studyLenses);

console.log(`📦 Study Lenses: Registered ${registered.length} web components`);

// No exports - this file is purely for side effects
/**
 * Lens Registration Aggregator
 * Imports all lens registrations to trigger side effects
 * No exports - just side effects
 */

// Import all lens registrations (triggers customElements.define)
import './reverse/register.js';
import './uppercase/register.js';
import './lowercase/register.js';
import './jsx-demo/register.js';

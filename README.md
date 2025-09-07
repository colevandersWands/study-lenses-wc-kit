# Study Lenses WC-Kit

> Web components kit and programmatic library for building dynamic code study environments

Study Lenses WC-Kit is a TypeScript library for creating interactive code study environments. Build educational interfaces with pure functions, minimal web components, and smart pipeline processing.

## Documentation Guide

This project maintains three specialized documentation files for different audiences:

- **README.md** (this file) - **For developers using Study Lenses in applications**
    - Installation and setup instructions
    - Usage patterns and API examples
    - Configuration options and file loading
    - Quick start guide for library consumers

- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - **For developers creating new lenses**
    - Step-by-step lens development tutorials
    - File templates and copy-paste examples
    - Testing patterns and development workflow
    - PR submission process

- **[CLAUDE.md](./CLAUDE.md)** - **For maintainers and core contributors**
    - System architecture and design principles
    - Pipeline implementation details and terminus logic
    - Performance characteristics and internal APIs
    - Technical deep-dive for system understanding

## Quick Start

```html
<!-- Basic pipeline: transform code through multiple lenses -->
<sl-snippet
	lenses="reverse uppercase"
	code="console.log('hello world');"
	lang="js"
>
</sl-snippet>
```

## Installation

```bash
npm install study-lenses-wc-kit
```

## Basic Usage

### 1. Register Views

```typescript
// Enable web components in DOM
import 'study-lenses-wc-kit/register';
```

### 2. Use the Main Export

```typescript
import sl from 'study-lenses-wc-kit';

// Use lens functions directly (separate arguments)
const result = await sl.lenses.reverse.lens(
	{ code: 'hello', lang: 'js', test: false }, // snippet
	{} // config (optional)
);
console.log(result.snippet.code); // "olleh"

// Create snippet from file or code
const snippet = await sl.snippet.parse('./demo.js');
console.log(snippet); // { code: '...', lang: 'js', test: false }
```

### 3. Build Pipelines (Core API)

```typescript
import sl from 'study-lenses-wc-kit';

// Use the core pipeLenses function for all pipeline processing
const { pipeLenses } = sl.core;

// Pattern 1: Simple functions (custom lenses)
const myCustomLens = async (snippet) => ({
	snippet: { ...snippet, code: snippet.code + ' // custom' },
	view: null,
});

const result1 = await pipeLenses(
	{ code: 'hello world', lang: 'js', test: false },
	[myCustomLens]
);

// Pattern 2: Built-in lens objects (gets name + default config)
const result2 = await pipeLenses(
	{ code: 'hello world', lang: 'js', test: false },
	[sl.lenses.reverse, sl.lenses.uppercase]
);
console.log(result2.snippet.code); // "DLROW OLLEH"

// Pattern 3: Function with custom config
const result3 = await pipeLenses(
	{ code: 'hello world', lang: 'js', test: false },
	[[myCustomLens, { theme: 'dark' }]]
);

// Pattern 4: Built-in lens with config override (deep merged)
const result4 = await pipeLenses(
	{ code: 'hello world', lang: 'js', test: false },
	[[sl.lenses.reverse, { preserveSpaces: true }], sl.lenses.uppercase]
);

// Mixed pipeline: custom + built-in lenses
const result5 = await pipeLenses(
	{ code: 'hello world', lang: 'js', test: false },
	[
		myCustomLens, // Pattern 1: Simple function
		sl.lenses.reverse, // Pattern 2: Library lens
		[anotherCustom, { setting: true }], // Pattern 3: Function + config
		[sl.lenses.uppercase, { theme: 'dark' }], // Pattern 4: Library + config
	]
);
```

## Core Concepts

### Lens Functions

Every lens follows the same signature:

```typescript
async function lensName(
	snippet: Snippet,
	config?: LensConfig
): Promise<LensOutput>;
```

**Lens Naming System:**

- Each lens has a unique name defined in its `name.ts` file
- Used consistently across pipeline processing, configuration keys, and component registration
- Runtime validation ensures name consistency throughout the system

### Flexible LensSpec Patterns

Study Lenses V2 supports 4 flexible patterns for maximum developer flexibility:

**1. Simple Function** - `myFunction`

```typescript
const customLens = async (snippet, config = {}) => ({
	snippet: { ...snippet, code: snippet.code + ' // modified' },
	view: null,
});

configs: [customLens]; // Uses function defaults
```

**2. Library Lens Object** - `lensObject`

```typescript
configs: [sl.lenses.reverse]; // Gets name + default config automatically
```

**3. Function with Config** - `[function, config]`

```typescript
configs: [[customLens, { theme: 'dark', debug: true }]]; // Custom config passed directly
```

**4. Library Lens with Config Override** - `[lensObject, config]`

```typescript
configs: [[sl.lenses.reverse, { preserveSpaces: true }]]; // Deep merged with defaults
```

**Benefits:**

- **Maximum Flexibility**: Mix custom and library lenses in same pipeline
- **No String Lookup**: Direct function references, no registry magic
- **Smart Config Handling**: Automatic deep merge with lens defaults
- **Type Safety**: Full TypeScript support for all patterns

### Smart Pipeline

Process code sequentially until hitting a "terminus":

- **View returned** → Display visual output, stop pipeline
- **Side effect completed _(returned Falsey non-string)_** → Action performed, stop pipeline
- **Code transformed** → Continue to next lens

### Code Discovery

Smart precedence-based code discovery:

1. **Element's code attribute** (plain text, base64, or file path)
2. **Element's textContent**
3. **Child `<sl-snippet>`**
4. **Parent `<sl-snippet>`** or `<study-lenses code="">`
5. **Sibling `<sl-snippet>`**

### Dynamic Lens Loading

Add custom lenses at runtime using `sl.core.load`:

```typescript
import sl from 'study-lenses-wc-kit';

// Define a custom lens object
const customLens = {
	name: 'my-analyzer', // Required: unique identifier
	lens: async (snippet, config = {}) => {
		// Required: lens function
		const analyzed = analyzeCode(snippet.code);
		return {
			snippet: { ...snippet, code: analyzed },
			ui: null,
		};
	},
	register: () => 'sl-my-analyzer', // Optional: web component tag
	config: () => ({ mode: 'basic' }), // Optional: default configuration
};

// Load into the runtime registry
const success = sl.core.load(customLens);
if (success) {
	// Lens is now available in sl.lenses
	const result = await sl.lenses['my-analyzer'].lens(snippet);

	// Can also use in pipelines
	await sl.core.pipeLenses(snippet, [
		sl.lenses.reverse,
		sl.lenses['my-analyzer'], // Your custom lens
		sl.lenses.uppercase,
	]);
}
```

**Load Function Details:**

- Returns `true` if successfully loaded, `false` if invalid
- Validates lens object structure (name and lens function required)
- Adds defaults for missing optional properties (register, config)
- Overwrites existing lens if same name is used
- Logs success/warning messages to console

## Import Styles

Study Lenses V2 uses a unified export structure:

### Main Export (Recommended)

```typescript
import sl from 'study-lenses-wc-kit';

// Core API: Essential functions through sl.core
const result = await sl.core.pipeLenses(mySnippet, [
	sl.lenses.reverse, // Library lens
	[customFunction, { theme: 'dark' }], // Custom lens + config
	[sl.lenses.uppercase, { fast: true }], // Library + override
]);

// Access individual lens functions (separate arguments)
const result = await sl.lenses.reverse.lens(snippet, config);

// Access components
const Component = sl.lenses.reverse.view;

// Access configs (call as function with optional overrides)
const defaultConfig = sl.lenses.reverse.config();
const customConfig = sl.lenses.reverse.config({ theme: 'dark' });

// Snippet utilities
const snippetObj = await sl.snippet.parse('./file.js');
const SnippetElement = sl.snippet.view;

// Dynamic lens loading
const myLens = {
	name: 'my-custom-lens',
	lens: (snippet) => ({
		snippet: { ...snippet, code: snippet.code + ' // custom' },
		ui: null,
	}),
	register: () => 'sl-my-custom', // optional
	config: () => ({ enabled: true }), // optional
};
const loaded = sl.core.load(myLens); // Returns true if successful
```

### Alternative Direct Imports

```typescript
// Import individual lens functions
import reverseLens from 'study-lenses-wc-kit/lenses/reverse/lens.js';
import uppercaseLens from 'study-lenses-wc-kit/lenses/uppercase/lens.js';

// Import individual lens components
import { view as reverseView } from 'study-lenses-wc-kit/lenses/reverse/view.js';
import { view as uppercaseView } from 'study-lenses-wc-kit/lenses/uppercase/view.js';

// Import lens configurations
import { config as reverseConfig } from 'study-lenses-wc-kit/lenses/reverse/config.js';
import { config as uppercaseConfig } from 'study-lenses-wc-kit/lenses/uppercase/config.js';
```

## Built-in Lenses

### Transform Lenses

- **reverse** - Reverse code string
- **uppercase** - Convert to uppercase
- **lowercase** - Convert to lowercase

### Interactive Lenses

- **jsx-demo** - JSX-powered code analysis with visual components

### Utilities

- **snippet.parse** - Convert file path or code to snippet object
- **snippet.view** - Web component for displaying code with file loading

## Usage Patterns

### Pipeline Mode

Sequential processing with `lenses` attribute (supports spaces and commas):

```html
<sl-snippet lenses="reverse uppercase" code="hello world" lang="js">
</sl-snippet>

<sl-snippet
	lenses="reverse, uppercase, lowercase"
	code="hello world"
	lang="mjs"
	tests
>
</sl-snippet>
```

### Code Sources

Multiple ways to provide code (code="" takes precedence over src=""):

```html
<!-- Direct inline code -->
<sl-reverse code="hello world"></sl-lens-reverse>

<!-- From file using code attribute -->
<sl-uppercase code="./examples/content/greet.js"></sl-lens-uppercase>

<!-- From file using src attribute -->
<sl-lowercase src="./examples/content/module.mjs"></sl-lens-lowercase>

<!-- Child snippet -->
<sl-lens-uppercase>
  <sl-snippet src="./examples/content/math.test.js"></sl-snippet>
</sl-lens-uppercase>

<!-- Inline content -->
<sl-lens-reverse>
  function greet() { console.log("hi"); }
</sl-lens-reverse>
```

### Pipeline in Snippet

Lenses inside `<sl-snippet>` process sequentially:

```html
<sl-snippet code="hello world">
	<sl-lens-reverse></sl-lens-reverse>
	<!-- "dlrow olleh" -->
	<sl-lens-uppercase></sl-lens-uppercase>
	<!-- "DLROW OLLEH" -->
	<sl-format></sl-format>
	<!-- formatted version -->
</sl-snippet>
```

## Creating Custom Lenses

**For complete lens development guidance**, see [CONTRIBUTING.md](./CONTRIBUTING.md) for step-by-step tutorials with templates and testing patterns.

### 1. Transform Lens

```typescript
// Create snippet from file or code
const snippet = await sl.snippet.parse('./demo.js');
console.log(snippet); // { code: '...', lang: 'js', test: false }

// Use in core pipeline
const result = await sl.core.pipeLenses(snippet, [
	sl.lenses.reverse,
	sl.lenses.uppercase,
]);

// Access individual lens
const reversed = await sl.lenses.reverse.lens(
	{ code: 'hello', lang: 'js', test: false }, // snippet
	{} // config
);
```

### 2. Visual Lens (Synchronous)

```typescript
export const myVisual = async (snippet, config) => {
	const div = document.createElement('div');
	div.innerHTML = `<h3>Code Analysis</h3><pre>${snippet.code}</pre>`;

	return {
		snippet, // Pass through unchanged
		view: div,
	};
};
```

### 3. JSX/Preact Lens

Create rich interactive components with JSX:

```tsx
// lens.tsx
import type { Snippet, LensOutput } from 'study-lenses-wc-kit';
import _config from './config.js';

export const lens = async (
	snippet: Snippet,
	config = _config()
): Promise<LensOutput> => {
	const lines = snippet.code.split('\n');
	const wordCount = snippet.code
		.split(/\s+/)
		.filter((w) => w.length > 0).length;

	return {
		snippet, // Pass through unchanged
		view: (
			<div style={{ padding: '16px', border: '2px solid #007acc' }}>
				<h3>📊 Code Analysis</h3>
				<div style={{ display: 'flex', gap: '16px' }}>
					<div>
						Lines: <strong>{lines.length}</strong>
					</div>
					<div>
						Words: <strong>{wordCount}</strong>
					</div>
				</div>
				<details>
					<summary>Show Code</summary>
					<pre>{snippet.code}</pre>
				</details>
			</div>
		),
	};
};
```

**Requirements:**

- Install dependencies: `npm install preact`
- Use `.tsx` extension for lens files with JSX
- TypeScript will compile JSX to JavaScript automatically

## File Path Support

Load code from files with automatic metadata extraction:

```html
<sl-format code="./examples/content/greet.js"></sl-format>
<!-- Automatically sets lang="js", test=false -->

<sl-reverse code="./examples/content/math.test.js"></sl-lens-reverse>
<!-- Automatically sets lang="js", test=true -->

<sl-uppercase code="./examples/content/module.mjs"></sl-lens-uppercase>
<!-- Automatically sets lang="js" (mjs → js) -->
```

## Configuration Management

### Config Factory Pattern

All lens configurations use a factory pattern with deep merge for flexible overrides:

```typescript
// Get default configuration
const defaultConfig = sl.lenses.reverse.config();

// Override specific settings
const customConfig = sl.lenses.reverse.config({
	theme: 'dark',
	enabled: true,
});

// Nested overrides supported
const advancedConfig = sl.lenses.myLens.config({
	display: {
		theme: 'dark', // Only overrides theme, keeps other display settings
	},
});

// Each call returns independent object
const config1 = sl.lenses.myLens.config({ theme: 'dark' });
const config2 = sl.lenses.myLens.config({ theme: 'light' });
// config1 and config2 are completely independent
```

**Benefits:**

- **Flexible Overrides**: Partial configuration with deep merge support
- **No Mutations**: Each call returns fresh object with no side effects
- **Type Safety**: Maintains TypeScript inference for configuration options
- **Performance**: No expensive deep cloning, only when config is needed

### Configuration Patterns

```typescript
// Simple configuration
export const config = {
	enabled: true,
	timeout: 5000,
};

// Complex nested configuration
export const config = {
	display: {
		theme: 'light',
		showLineNumbers: true,
	},
	processing: {
		maxLines: 1000,
		stripComments: false,
	},
};
```

## API Reference

### Core Types

```typescript
// Core data structures
interface Snippet {
	code: string;
	lang: string;
	test: boolean;
}

interface SnippetOptions {
	lang?: string;
	test?: boolean;
}

// Lens function signatures
type LensConfig = any; // Lens decides configuration shape
type SyncLensFunction = (snippet: Snippet, config?: LensConfig) => LensOutput;
type AsyncLensFunction = (
	snippet: Snippet,
	config?: LensConfig
) => Promise<LensOutput>;
type LensFunction = SyncLensFunction | AsyncLensFunction;

// Lens output structure
interface LensOutput {
	snippet: Snippet | null | undefined | false; // null/false for side effects
	view: HTMLElement | ComponentChild | null; // Supports JSX components
}

// Complete lens object (from library)
interface LensObject {
	name: string;
	lens: LensFunction;
	view: any; // Web component class
	config: (overrides?: any) => LensConfig; // Config factory
}

// Flexible pipeline specifications (4 patterns)
type LensSpec =
	| LensFunction // Simple function
	| LensObject // Library lens object
	| [LensFunction, LensConfig] // Function with config
	| [LensObject, LensConfig]; // Library lens with config override

// Pipeline output
interface StudyOutput {
	snippet: Snippet | null | undefined | false;
	view: HTMLElement | ComponentChild | null;
}

// Code source tracking for debugging
interface CodeSource {
	code: string;
	lang: string;
	test: boolean;
	source:
		| 'attribute'
		| 'textContent'
		| 'child'
		| 'parent'
		| 'sibling'
		| 'file';
}
```

### JSX Integration

Study Lenses supports JSX/Preact components for interactive visual lenses:

```typescript
import type { ComponentChild } from 'preact';

// JSX lens returning interactive component
export const myJSXLens = async (snippet: Snippet, config?: LensConfig): Promise<LensOutput> => {
  return {
    snippet, // Pass through unchanged
    view: (
      <div style={{ padding: '16px', border: '1px solid #ccc' }}>
        <h3>Interactive Code Analysis</h3>
        <pre>{snippet.code}</pre>
        <button onClick={() => alert('Analyzed!')}>Analyze</button>
      </div>
    )
  };
};
```

**Key JSX Features:**

- **Full Preact Support**: Use hooks, state, event handlers
- **TypeScript Integration**: `ComponentChild` type from Preact
- **Automatic Rendering**: Components rendered to DOM by web component wrapper
- **Style Objects**: Use camelCase properties (`backgroundColor` vs `background-color`)

### Core Functions

- `sl.core.pipeLenses(snippet, lenses)` - Primary pipeline processing function
- `sl.core.load(lensObj)` - Dynamically load lens objects into the runtime registry
- `sl.snippet.parse(pathOrCode, options?)` - Create snippet from file/code
- `sl.lenses.*.lens(input)` - Individual lens functions

### View Access

- `sl.component` - Main StudyLenses component
- `sl.snippet.view` - Snippet component with file loading
- `sl.lenses.*.component` - Individual lens components

## Testing & Validation

### Running Tests

Study Lenses includes both automated unit tests and interactive browser tests:

```bash
# Run all unit tests
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI dashboard
npm run test:ui

# Run tests with coverage report
npm run test:coverage

# Watch mode for development
npm run test:watch

# Open interactive HTML tests in browser
npm run test:browser
```

### Testing Custom Lenses

Before using custom lenses in production, validate them with the built-in testing utilities:

```typescript
import sl from 'study-lenses-wc-kit';

// Test your custom lens function
const myCustomLens = async (snippet, config = {}) => ({
	snippet: { ...snippet, code: snippet.code.toUpperCase() },
	view: null,
});

// Validate it works correctly
const testSnippet = { code: 'hello world', lang: 'js', test: false };
const result = await myCustomLens(testSnippet);

console.log(result.snippet.code); // Should output: "HELLO WORLD"

// Test in pipeline with other lenses
const pipelineResult = await sl.core.pipeLenses(testSnippet, [
	myCustomLens,
	sl.lenses.reverse,
]);

console.log(pipelineResult.snippet.code); // Should output: "DLROW OLLEH"
```

### Browser Testing Workflow

For interactive testing of web components and visual lenses:

```bash
# Open HTML test files for manual verification
open test/test.html                    # Basic functionality
open test/test-snippet.html           # Code discovery features
open test/test-export-conventions.html # Import/export patterns
open test/test-lensspec-patterns.html  # LensSpec flexible patterns

# View usage examples
open examples/usage/basic-usage.html
```

**Manual Test Scenarios:**

1. **Component Registration** - Verify web components load correctly
2. **Code Discovery** - Test various code source patterns (attributes, files, text content)
3. **Pipeline Processing** - Validate lens chains and terminus conditions
4. **Error Handling** - Confirm graceful failure with invalid inputs
5. **Configuration** - Test config factory with overrides

### Validation Checklist

When testing custom lenses or changes:

- ✅ **Function Signature** - Follows `async (snippet, config) => { snippet, view }`
- ✅ **Pipeline Compatibility** - Works in chains with other lenses
- ✅ **Config Support** - Accepts configuration objects properly
- ✅ **Error Handling** - Throws descriptive errors on failure
- ✅ **Type Safety** - TypeScript types are correct and complete
- ✅ **Performance** - No blocking operations in render path

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for lens development guidelines.

## License

MIT - See [LICENSE](./LICENSE) file.

---

**Study Lenses** - Build dynamic code study environments with functional composition.

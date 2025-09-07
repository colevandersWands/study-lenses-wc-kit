# CLAUDE.md - Study Lenses WC-Kit Technical Reference

This file provides technical architecture documentation and implementation details for maintainers, core contributors, and AI tools working with the Study Lenses WC-Kit codebase.

**For other audiences:**

- **Library users**: See [README.md](./README.md) for installation, usage, and API reference
- **Lens developers**: See [CONTRIBUTING.md](./CONTRIBUTING.md) for step-by-step lens creation tutorials

## Package Overview

**Study Lenses WC-Kit** is a functional/procedural TypeScript library with a simplified, unified API for creating dynamic code study environments. It enables developers to build educational interfaces with minimal overhead while maintaining maximum flexibility.

**Core Philosophy:**

- **Single main export**: Everything accessible through `sl` object
- Pure functions over classes
- Minimal web components as thin wrappers
- Universal file loading with `code=""` and `src=""` attributes
- Functional composition patterns

## Architecture Principles

### 1. Functional/Procedural Design

- **All business logic in pure functions** - no `this`, no classes, easy to test
- **Components are minimal wrappers** - only parse attributes and delegate
- **State is passed explicitly** - no hidden global state
- **Side effects are isolated** - registration separate from exports

### 2. Lens Function Signature

Every lens follows this exact signature:

```typescript
async function lensName(
	snippet: Snippet,
	config: LensConfig = _config()
): Promise<LensOutput>;
```

### 3. Smart Pipeline Architecture

The core innovation of Study Lenses WC-Kit is the smart pipeline that processes code through lens functions sequentially until hitting a "terminus" condition.

#### Pipeline Implementation (`study/pipe.ts`)

**Main Function:** `pipeLenses` (renamed from `pipe`)

```typescript
export const pipeLenses = async (
	snippet: Snippet,
	lenses: LensSpec[]
): Promise<StudyOutput> => {
	let currentSnippet = { ...snippet };

	for (const lensSpec of lenses) {
		const { lens, config } = normalizeLensSpec(lensSpec);

		if (!lens) {
			console.warn(`Lens not found in spec:`, lensSpec);
			continue;
		}

		try {
			const result = await lens(currentSnippet, config);

			// Terminus condition 1: View returned (visual output)
			if (result.view) {
				return {
					snippet: result.snippet || currentSnippet,
					view: result.view,
				};
			}

			// Terminus condition 2: Falsey snippet (side effect completed)
			if (
				result.snippet === null ||
				result.snippet === undefined ||
				result.snippet === false
			) {
				return {
					snippet: currentSnippet, // Return pre-side-effect snippet
					view: null,
				};
			}

			// Continue pipeline with modified snippet
			currentSnippet = result.snippet;
		} catch (error) {
			console.error(`Pipeline failed at lens:`, lensSpec, error);
			throw new Error(
				`Lens failed: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}

	// Pipeline completed without terminus - return final snippet
	return {
		snippet: currentSnippet,
		view: null,
	};
};
```

#### Terminus Conditions

The pipeline stops processing when:

1. **View Returned** (`result.view` is truthy)
    - Lens returns an HTMLElement or JSX component for display
    - Pipeline terminates, view is rendered to user
    - Example: `flowchart`, `jsx-demo`, `trace-table` lenses

2. **Side Effect Completed** (falsey snippet)
    - Lens returns `null`, `undefined`, `false` for snippet
    - Indicates action was performed (file saved, code executed, etc.)
    - Pipeline terminates, no further processing
    - Example: `run-it`, `save-file`, `debug-print` lenses

3. **Error Thrown**
    - Any lens throws an exception
    - Fail-fast behavior: entire pipeline stops immediately
    - Error is logged with lens spec and propagated up

#### Pipeline Flow Examples

```typescript
import { reverse } from '../lenses/reverse/index.js';
import { uppercase } from '../lenses/uppercase/index.js';
import { jsxDemo } from '../lenses/jsx-demo/index.js';

// Transform chain: function → function → final output
await pipeLenses(snippet, [reverse.lens, uppercase.lens]);
// "hello" → "olleh" → "OLLEH" (continues to end)

// Transform → visual: object → object → object (stops at jsx-demo view)
await pipeLenses(snippet, [reverse, uppercase, jsxDemo]);
// "hello" → "olleh" → "OLLEH" → <JSX component> (stops at jsx-demo)

// Function with config: override default config
await pipeLenses(snippet, [[reverse.lens, { enabled: true }]]);
// "hello" → "olleh" (with custom config)

// Object with config override: merge with lens defaults
await pipeLenses(snippet, [[uppercase, { theme: 'dark' }]]);
// "hello" → "HELLO" (with merged config)

// Mixed LensSpec patterns in single pipeline
await pipeLenses(snippet, [
	reverse.lens, // Simple function
	[uppercase.lens, { loud: true }], // Function + config
	jsxDemo, // Lens object (terminus with view)
]);
// "hello" → "olleh" → "OLLEH" → <JSX component>
```

#### Performance Characteristics

- **Sequential Processing**: O(n) where n = number of lenses until terminus
- **Early Termination**: Stops immediately on first terminus condition
- **Config Isolation**: Each lens gets its own config via LensSpec normalization
- **Memory Efficient**: Only one snippet transformation in memory at a time
- **Error Boundary**: Single lens failure stops entire pipeline

## Core API Architecture

Study Lenses WC-Kit provides essential functionality through `sl.core` - a focused namespace containing the most frequently used functions for building code study interfaces.

### Design Philosophy

- **Essential Functions Only**: Core contains fundamental operations, not every possible utility
- **Stable API Surface**: Core functions maintain backwards compatibility across versions
- **Direct Access**: No complex nested imports for primary functionality
- **Performance Optimized**: Core functions are optimized for frequent use

### Core API Structure

```typescript
// Main export structure
export const sl = {
	core, // Essential functions (pipeLenses, etc.)
	lenses, // Lens collection
	snippet, // Snippet utilities
	ui, // UI components
};

// Core namespace contains essential functions
export const core = {
	pipeLenses: pipeLensesFunction,
	// Additional essential functions as needed
};
```

### Core Functions

#### `sl.core.pipeLenses`

The primary pipeline processing function for chaining lens operations:

```typescript
import sl from 'study-lenses-wc-kit';

const snippet = { code: 'console.log("hello")', lang: 'js', test: false };
const result = await sl.core.pipeLenses(snippet, [
	sl.lenses.reverse.lens,
	sl.lenses.uppercase.lens,
]);
```

**Key Features:**

- Processes lenses sequentially until terminus condition
- Handles both sync and async lens functions
- Supports all LensSpec patterns (function, object, with config)
- Provides detailed error handling and logging

#### `sl.core.load`

Dynamic lens loading utility for runtime lens registration:

```typescript
import sl from 'study-lenses-wc-kit';

const customLens = {
	name: 'custom-analyzer', // Required: unique identifier
	lens: async (snippet) => {
		// Required: lens function
		const analyzed = analyze(snippet.code);
		return { snippet: { ...snippet, code: analyzed }, ui: null };
	},
	register: () => 'sl-custom', // Optional: web component tag
	config: () => ({ depth: 5 }), // Optional: default config factory
};

// Load lens into runtime registry
const success = sl.core.load(customLens);
console.log(success); // true if loaded, false if invalid

// Now available in sl.lenses
await sl.lenses['custom-analyzer'].lens(snippet);
```

**Implementation Details:**

- Validates lens object structure (name and lens required)
- Creates complete lens object with defaults for missing properties
- Mutates the imported lens registry object directly
- Returns boolean indicating success/failure
- Overwrites existing lens if same name is used
- Console logging for debugging

### Usage Patterns

**Basic Pipeline Processing:**

```typescript
import sl from 'study-lenses-wc-kit';

// Direct core function usage
const { pipeLenses } = sl.core;
const { reverse, uppercase } = sl.lenses;

// Transform chain
const result = await pipeLenses(snippet, [reverse.lens, uppercase.lens]);

// With configuration
const result = await pipeLenses(snippet, [
	[reverse.lens, { enabled: true }],
	[uppercase, { theme: 'dark' }],
]);
```

**UI Component Integration:**

```typescript
// UI components automatically use core functions
import sl from 'study-lenses-wc-kit';

// Usage in pure function UI component
const buildPipeline = (snippet, controls) => {
	const lenses = [];
	if (controls.reverse) lenses.push(sl.lenses.reverse);
	if (controls.uppercase) lenses.push(sl.lenses.uppercase);

	// Uses sl.core.pipeLenses internally
	return sl.core.pipeLenses(snippet, lenses);
};
```

### Future Core Functions

Additional functions may be added to `sl.core` based on usage patterns:

- **`createSnippet`** - Standard snippet creation with metadata
- **`extractCode`** - Code discovery from elements
- **`registerLenses`** - Dynamic lens registration

### Benefits of Core Architecture

1. **Simplified Imports**: `sl.core.pipeLenses` vs deep nested imports
2. **API Stability**: Core functions receive extra attention for backwards compatibility
3. **Performance**: Core functions are optimized and cached
4. **Documentation**: Focused documentation on most important functionality
5. **Bundle Splitting**: Core functions can be separately optimized for size

## TypeScript Type System

### Core Types

```typescript
// Snippet data structure
export interface Snippet {
	code: string; // Source code content
	lang: string; // Language identifier (js, python, etc.)
	test: boolean; // Whether this is test code
}

// Flexible configuration - any serializable value
export type LensConfig = any;

// Output from lens functions
export interface LensOutput {
	snippet: Snippet | null | undefined | false; // null/undefined/false for side effects
	view: HTMLElement | ComponentChild | null; // Supports both DOM and JSX
}

// Lens function signatures - supports both sync and async
export type SyncLensFunction = (
	snippet: Snippet,
	config?: LensConfig
) => LensOutput;
export type AsyncLensFunction = (
	snippet: Snippet,
	config?: LensConfig
) => Promise<LensOutput>;
export type LensFunction = SyncLensFunction | AsyncLensFunction;
```

### Library Integration Types

```typescript
// Lens object structure with self-describing name
export interface LensObject {
	name: string; // Self-describing identifier
	lens: LensFunction; // Core function
	view: any; // Web component class
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
	source:
		| 'attribute'
		| 'textContent'
		| 'child'
		| 'parent'
		| 'sibling'
		| 'file';
}
```

### JSX Integration Types

```typescript
// Import Preact types for JSX support
import type { ComponentChild } from 'preact';

// JSX components are supported in LensOutput.view
export interface LensOutput {
	snippet: Snippet | null | undefined | false;
	view: HTMLElement | ComponentChild | null; // ComponentChild enables JSX
}
```

### Study Pipeline Types

```typescript
// Study pipeline function signature
export interface StudyOutput {
	snippet: Snippet | null | undefined | false;
	view: HTMLElement | ComponentChild | null; // Supports JSX components
}
```

## Testing Architecture

Study Lenses WC-Kit provides comprehensive testing infrastructure with both programmatic unit tests and interactive browser testing capabilities.

### Testing Stack

- **Test Runner**: [Vitest](https://vitest.dev/) with Jest syntax compatibility
- **Assertions**: BDD-style `describe`, `it`, `expect` from Vitest
- **Environment**: JSDOM for DOM simulation
- **Coverage**: Built-in coverage reporting with 80% thresholds
- **Interactive Testing**: Manual browser testing with `.test.html` files

### Test File Conventions

#### Unit Tests (`.spec.ts`)

Unit tests are placed **neighboring** source files, not in separate directories:

```
src/
├── lenses/
│   ├── reverse/
│   │   ├── lens.ts
│   │   ├── lens.spec.ts    ← Unit test neighboring source
│   │   ├── view.ts
│   │   └── view.test.html  ← Interactive test neighboring view
│   └── uppercase/
│       ├── lens.ts
│       ├── lens.spec.ts    ← Unit test neighboring source
│       ├── view.ts
│       └── view.test.html  ← Interactive test neighboring view
└── utils/
    ├── deep-merge.ts
    ├── deep-merge.spec.ts  ← Unit test neighboring utility
    ├── extract-code-from-element.ts
    └── extract-code-from-element.spec.ts
```

#### Interactive Tests (`.test.html`)

Interactive tests are HTML files for manual browser testing:

```
src/lenses/reverse/view.test.html
src/lenses/jsx-demo/view.test.html
src/study/view.test.html
```

### Testing Patterns

#### Lens Function Testing

```typescript
// src/lenses/reverse/lens.spec.ts
import { describe, it, expect } from 'vitest';
import { lens } from './lens.js';

describe('reverse lens', () => {
	it('should reverse code content', async () => {
		const snippet = { code: 'hello world', lang: 'js', test: false };
		const result = await lens(snippet);

		expect(result.snippet.code).toBe('dlrow olleh');
		expect(result.snippet.lang).toBe('js');
		expect(result.snippet.test).toBe(false);
		expect(result.view).toBeNull();
	});

	it('should handle empty code', async () => {
		const snippet = { code: '', lang: 'js', test: false };
		const result = await lens(snippet);

		expect(result.snippet.code).toBe('');
		expect(result.view).toBeNull();
	});
});
```

#### Configuration Testing

```typescript
// src/lenses/reverse/config.spec.ts
import { describe, it, expect } from 'vitest';
import { config } from './config.js';

describe('reverse config', () => {
	it('should return default config', () => {
		const result = config();
		expect(result).toEqual({});
	});

	it('should merge overrides with defaults', () => {
		const result = config({ enabled: false });
		expect(result.enabled).toBe(false);
	});
});
```

#### Pipeline Testing

```typescript
// src/study/pipe.spec.ts
import { describe, it, expect } from 'vitest';
import { pipe } from './pipe.js';
import { reverse } from '../lenses/reverse/index.js';
import { uppercase } from '../lenses/uppercase/index.js';

describe('pipeline processing', () => {
	const snippet = { code: 'hello world', lang: 'js', test: false };

	it('should process function lens', async () => {
		const result = await pipe(snippet, [reverse.lens]);
		expect(result.snippet.code).toBe('dlrow olleh');
	});

	it('should process lens object', async () => {
		const result = await pipe(snippet, [reverse]);
		expect(result.snippet.code).toBe('dlrow olleh');
	});

	it('should process function with config', async () => {
		const result = await pipe(snippet, [[reverse.lens, { enabled: true }]]);
		expect(result.snippet.code).toBe('dlrow olleh');
	});

	it('should process lens object with config override', async () => {
		const result = await pipe(snippet, [[reverse, { custom: true }]]);
		expect(result.snippet.code).toBe('dlrow olleh');
	});

	it('should chain multiple lenses until terminus', async () => {
		const result = await pipe(snippet, [reverse.lens, uppercase.lens]);
		expect(result.snippet.code).toBe('DLROW OLLEH');
	});
});
```

#### Utility Testing

```typescript
// src/utils/deep-merge.spec.ts
import { describe, it, expect } from 'vitest';
import { deepMerge } from './deep-merge.js';

describe('deepMerge', () => {
	it('should merge simple objects', () => {
		const result = deepMerge({ a: 1 }, { b: 2 });
		expect(result).toEqual({ a: 1, b: 2 });
	});

	it('should handle nested objects', () => {
		const target = { display: { theme: 'light', size: 'medium' } };
		const source = { display: { theme: 'dark' } };
		const result = deepMerge(target, source);

		expect(result.display.theme).toBe('dark');
		expect(result.display.size).toBe('medium');
	});
});
```

### Interactive Testing Templates

#### Basic Lens Testing

```html
<!-- src/lenses/reverse/view.test.html -->
<!DOCTYPE html>
<html>
	<head>
		<title>Reverse Lens - Interactive Test</title>
	</head>
	<body>
		<h1>🔄 Reverse Lens - Interactive Test</h1>

		<!-- Test: Basic usage -->
		<h2>Basic Usage</h2>
		<sl-lens-reverse code="hello world"></sl-lens-reverse>

		<!-- Test: File loading -->
		<h2>File Loading</h2>
		<sl-lens-reverse
			src="../../examples/content/greet.js"
		></sl-lens-reverse>

		<!-- Test: Configuration -->
		<h2>Custom Configuration</h2>
		<sl-lens-reverse
			code="function test() { return 'hello'; }"
			config='{"enabled": true}'
		></sl-lens-reverse>

		<script type="module">
			import '../../../register.js'; // Register all components
		</script>
	</body>
</html>
```

#### JSX Lens Testing

```html
<!-- src/lenses/jsx-demo/view.test.html -->
<!DOCTYPE html>
<html>
	<head>
		<title>JSX Demo Lens - Interactive Test</title>
	</head>
	<body>
		<h1>⚛️ JSX Demo Lens - Interactive Test</h1>

		<!-- Test: JSX rendering -->
		<h2>JSX Component Rendering</h2>
		<sl-lens-jsx-demo
			code="const greeting = 'Hello, world!';"
		></sl-lens-jsx-demo>

		<!-- Test: Code analysis -->
		<h2>Code Statistics</h2>
		<sl-lens-jsx-demo
			code="function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}"
		></sl-lens-jsx-demo>

		<script type="module">
			import '../../../register.js';
		</script>
	</body>
</html>
```

### Testing Commands

```bash
# Run all tests in watch mode
npm test

# Run tests once and exit
npm run test:run

# Run tests with UI interface
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Coverage Requirements

- **Line Coverage**: 80% minimum
- **Function Coverage**: 80% minimum
- **Branch Coverage**: 80% minimum
- **Statement Coverage**: 80% minimum

Coverage thresholds are enforced in `vitest.config.ts`:

```typescript
export default defineConfig({
	test: {
		coverage: {
			thresholds: {
				lines: 80,
				functions: 80,
				branches: 80,
				statements: 80,
			},
		},
	},
});
```

## Export Conventions (CRITICAL)

### File-Level Conventions

Every lens follows identical patterns:

**lens.ts (for pure transforms):**

```typescript
export const lens = (snippet: Snippet, config: LensConfig = _config()): LensOutput => { ... }
export default lens;
```

**lens.ts (for async operations):**

```typescript
export const lens = async (snippet: Snippet, config: LensConfig = _config()): Promise<LensOutput> => { ... }
export default lens;
```

**lens.tsx (for JSX components):**

```tsx
export const lens = async (
	snippet: Snippet,
	config: LensConfig = _config()
): Promise<LensOutput> => ({
	snippet,
	view: <div>Interactive JSX component</div>,
});
export default lens;
```

**view.ts:**

```typescript
export const view = createLensElement('lensName', lens);
export default view;
```

**name.ts (Lens Identity):**

```typescript
/**
 * Lens Name - Single source of truth for lens identification
 */
export const name = 'my-lens'; // Matches usage in pipeline and config
```

**config.ts (Config Factory Pattern):**

```typescript
import { deepMerge } from '../../utils/deep-merge.js';

const defaultConfig = {
	theme: 'light',
	enabled: true,
	// ... lens-specific settings
};

export const config = (overrides = {}) => deepMerge(defaultConfig, overrides);
export default config;
```

**index.ts:**

```typescript
import { name } from './name.js';
import lens from './lens.js';
import view from './view.js';
import config from './config.js';

// Default export only (generic object interface)
export default {
	name, // Self-describing lens name
	lens,
	view,
	config, // Config factory function
};
```

### Registration Separation

- **index.ts** - Pure exports, no side effects
- **register.ts** - Side effects only, no exports
- **Main usage** - Import from index.ts for functions and register.ts for web components
- **Core functions** - Available through `sl.core` namespace for essential operations

## Development Workflows

### Adding New Lenses

1. **Create directory structure:**

    ```
    lenses/my-lens/
    ├── lens.ts         # Pure lens logic
    ├── lens.spec.ts    # Unit tests for lens function
    ├── view.ts         # Web component wrapper
    ├── view.test.html  # Interactive browser test
    ├── config.ts       # Configuration factory
    ├── config.spec.ts  # Configuration tests
    ├── register.ts     # Browser registration
    └── index.ts        # Barrel exports
    ```

2. **Follow naming conventions:**
    - Function: `lens`
    - Component: `view`
    - Config: `config`

3. **Add to exports:**
    - Update top-level `functions.ts`
    - Update top-level `components.ts`
    - Update top-level `configs.ts`
    - **Update main `index.ts`** - Add to `studyLenses.lenses` object

4. **Create comprehensive tests:**
    - Unit tests for all exported functions
    - Interactive HTML tests for web components
    - Configuration testing with deep merge scenarios
    - Pipeline integration testing

### Testing Strategy

**Automated Testing:**

1. **Unit Testing** - Test lens functions in isolation with various inputs
2. **Integration Testing** - Test lens behavior within pipeline processing
3. **Configuration Testing** - Test config factory with various override scenarios
4. **Utility Testing** - Test shared utilities with edge cases

**Manual Testing:**

1. **Component Testing** - Use interactive HTML files with various attributes
2. **Visual Testing** - Verify JSX rendering and styling in browser
3. **File Loading Testing** - Test `src=""` attribute with real files
4. **Pipeline Testing** - Chain multiple lenses to verify terminus conditions

**Test Files Organization:**

- **`.spec.ts`** files test programmatic functionality
- **`.test.html`** files test visual/interactive behavior
- Tests are **neighboring** source files, never in separate test directories
- Every exported function must have corresponding unit tests
- Every `view.ts` file must have corresponding `.test.html` file

### Code Quality Standards

**TypeScript:**

- Strict mode enabled
- All functions properly typed with correct signatures
- Use shared types from `types.ts`
- Import types from correct sources

**File Organization:**

- Single responsibility per file
- Clear separation between pure functions and side effects
- Consistent naming across all files
- Neighboring test files for easy discovery

**Import Patterns:**

- Use `.js` extensions in imports (handled by TypeScript)
- Prefer relative imports within package
- Keep registration separate from functionality

## JSX/Preact Integration

Study Lenses WC-Kit provides full support for creating interactive JSX components using Preact for rich, dynamic lens interfaces.

### Technical Requirements

**Dependencies:**

```json
{
	"dependencies": {
		"preact": "^10.0.0"
	},
	"devDependencies": {
		"@types/preact": "^10.0.0",
		"@preact/preset-vite": "^2.0.0"
	}
}
```

**TypeScript Configuration:**

```json
{
	"compilerOptions": {
		"jsx": "react-jsx",
		"jsxImportSource": "preact"
	}
}
```

**File Extensions:**

- Use `.tsx` extension for lens functions that return JSX components
- All other files (`view.ts`, `config.ts`, `register.ts`, `index.ts`) remain `.ts`

### JSX Rendering Pipeline

The rendering system automatically detects and handles both HTMLElement and JSX components:

```typescript
// web-components/setup-functions.ts
import { render } from 'preact';
import type { ComponentChild } from 'preact';

const renderView = (
	container: HTMLElement,
	view: HTMLElement | ComponentChild
): void => {
	if (view instanceof HTMLElement) {
		// Regular DOM element - append directly
		container.appendChild(view);
	} else {
		// JSX component - use Preact render
		render(view, container);
	}
};
```

This dual-mode rendering allows seamless mixing of traditional DOM manipulation lenses with modern JSX-based interactive components.

### JSX Lens Implementation Pattern

```tsx
// lenses/jsx-demo/lens.tsx - Note the .tsx extension
import type { Snippet, LensConfig, LensOutput } from '../../types.js';

export const lens = async (
	snippet: Snippet,
	config: LensConfig = _config()
): Promise<LensOutput> => {
	const stats = analyzeCode(snippet.code);

	return {
		snippet, // Pass through unchanged
		view: (
			<div
				style={{
					padding: '16px',
					border: '2px solid #007acc',
					borderRadius: '8px',
					backgroundColor: '#f8f9fa',
					fontFamily: 'system-ui, sans-serif',
				}}
			>
				<h3
					style={{
						margin: '0 0 12px 0',
						color: '#007acc',
						fontSize: '18px',
					}}
				>
					📊 JSX Code Analysis
				</h3>

				<div
					style={{
						display: 'grid',
						gridTemplateColumns:
							'repeat(auto-fit, minmax(120px, 1fr))',
						gap: '12px',
						marginBottom: '16px',
					}}
				>
					<div
						style={{
							padding: '8px',
							backgroundColor: '#fff',
							borderRadius: '4px',
							textAlign: 'center',
						}}
					>
						<div
							style={{
								fontSize: '24px',
								fontWeight: 'bold',
								color: '#28a745',
							}}
						>
							{stats.lines}
						</div>
						<div style={{ fontSize: '12px', color: '#666' }}>
							Lines
						</div>
					</div>

					<div
						style={{
							padding: '8px',
							backgroundColor: '#fff',
							borderRadius: '4px',
							textAlign: 'center',
						}}
					>
						<div
							style={{
								fontSize: '24px',
								fontWeight: 'bold',
								color: '#ffc107',
							}}
						>
							{stats.words}
						</div>
						<div style={{ fontSize: '12px', color: '#666' }}>
							Words
						</div>
					</div>
				</div>

				<details style={{ marginBottom: '12px' }}>
					<summary
						style={{
							cursor: 'pointer',
							fontWeight: 'bold',
							marginBottom: '8px',
						}}
					>
						📝 Code Preview
					</summary>
					<pre
						style={{
							backgroundColor: '#fff',
							padding: '12px',
							borderRadius: '4px',
							overflow: 'auto',
							fontSize: '14px',
							margin: '0',
						}}
					>
						{snippet.code}
					</pre>
				</details>
			</div>
		),
	};
};

export default lens;
```

### JSX Development Notes

- **Style Objects**: Use camelCase properties (`backgroundColor` vs `background-color`)
- **Event Handlers**: Standard JSX patterns work (`onClick`, `onChange`, etc.)
- **Type Safety**: Full TypeScript support with `ComponentChild` type from Preact
- **Performance**: JSX components are rendered once and cached
- **Interactivity**: Can include state management, event handlers, and dynamic updates

### Type System Integration

```typescript
// types.ts - JSX support in LensOutput
export interface LensOutput {
	snippet: Snippet | null | undefined | false;
	view: HTMLElement | ComponentChild | null; // ComponentChild supports JSX
}
```

The type system automatically handles both traditional DOM elements and JSX components, enabling seamless composition within the pipeline architecture.

## Code Discovery System

Study Lenses WC-Kit implements a sophisticated precedence-based code discovery system that allows flexible code sourcing from multiple locations with intelligent fallback behavior.

### Precedence Hierarchy Implementation

The `utils/extract-code-from-element.ts` implements the complete discovery system:

```typescript
export const extractCodeFromElement = async (
	element: Element
): Promise<string> => {
	// 1. Own code attribute (highest priority)
	const codeAttr = element.getAttribute('code');
	if (codeAttr) {
		if (isFilePath(codeAttr)) {
			const { code } = await loadFileContent(codeAttr);
			return code;
		}
		// Try base64 decode, fallback to plain text
		try {
			return decodeURIComponent(atob(codeAttr));
		} catch {
			return codeAttr; // Plain text
		}
	}

	// 1.5. Own src attribute (fallback from code)
	const srcAttr = element.getAttribute('src');
	if (srcAttr) {
		if (isFilePath(srcAttr)) {
			const { code } = await loadFileContent(srcAttr);
			return code;
		}
		return srcAttr;
	}

	// 2. textContent
	const textContent = element.textContent?.trim();
	if (textContent && !element.querySelector('sl-snippet')) {
		return textContent;
	}

	// 3. Child snippet
	const childSnippet = element.querySelector(':scope > sl-snippet');
	if (childSnippet) {
		return extractCodeFromElement(childSnippet);
	}

	// 4. Parent context (snippet or study-lenses with code/src)
	const parentSnippet = element.closest('sl-snippet');
	const parentStudyLenses = element.closest(
		'study-lenses[code], study-lenses[src]'
	);

	if (parentSnippet) {
		// Special case: check for sibling snippet first
		const siblingSnippets = Array.from(
			parentSnippet.querySelectorAll(':scope > sl-snippet')
		);
		const siblingSnippet = siblingSnippets.find(
			(s) => s !== element && !s.contains(element)
		);

		if (siblingSnippet) {
			return extractCodeFromElement(siblingSnippet);
		}
		// Otherwise use parent snippet's code
		// ... (parent code extraction logic)
	}

	// 5. Sibling snippet (in study-lenses)
	const studyContainer = element.closest('study-lenses');
	if (studyContainer && studyContainer !== element) {
		const siblingSnippet = studyContainer.querySelector(
			':scope > sl-snippet'
		);
		if (siblingSnippet && siblingSnippet !== element) {
			return extractCodeFromElement(siblingSnippet);
		}
	}

	return '';
};
```

### File Path Detection and Loading

**File Path Detection**:

```typescript
const isFilePath = (value: string): boolean => {
	return (
		value.startsWith('./') ||
		value.startsWith('../') ||
		value.startsWith('/') ||
		/\.(js|mjs)$/.test(value)
	);
};
```

**Metadata Extraction from File Paths**:

```typescript
const loadFileContent = async (
	path: string
): Promise<{ code: string; lang: string; test: boolean }> => {
	const response = await fetch(path);
	const code = await response.text();

	// Extract lang from extension
	const ext = path.split('.').pop() || '';
	const lang = ext === 'mjs' ? 'js' : ext;

	// Check if test file
	const test = path.includes('.test.') || path.includes('.spec.');

	return { code, lang, test };
};
```

### Code Source Priority Examples

```html
<!-- 1. Own code attribute (highest priority) -->
<sl-lens-reverse code="console.log('hello')"></sl-lens-reverse>

<!-- File path in code attribute -->
<sl-lens-uppercase code="./examples/content/greet.js"></sl-lens-uppercase>

<!-- Base64 encoded code -->
<sl-lens-lowercase code="Y29uc29sZS5sb2coJ2hlbGxvJyk="></sl-lens-lowercase>

<!-- 1.5. Own src attribute (fallback) -->
<sl-lens-reverse src="./examples/content/module.mjs"></sl-lens-reverse>

<!-- 2. textContent -->
<sl-lens-uppercase> function greet() { console.log("hi"); } </sl-lens-uppercase>

<!-- 3. Child snippet -->
<sl-lens-lowercase>
	<sl-snippet code="./examples/content/math.test.js"></sl-snippet>
</sl-lens-lowercase>

<!-- 4. Parent context -->
<sl-snippet code="./shared.js">
	<sl-lens-reverse></sl-lens-reverse>
	<!-- uses shared.js -->
</sl-snippet>

<!-- 4.1. Sibling snippet precedence -->
<sl-snippet code="./parent.js">
	<sl-snippet code="./sibling.js"></sl-snippet>
	<sl-lens-reverse></sl-lens-reverse>
	<!-- uses sibling.js, not parent.js -->
</sl-snippet>
```

### Pipeline vs Distribution Modes

> **Implementation Note**: The examples below demonstrate the technical capabilities of each mode. Optimal usage patterns and when to choose Pipeline vs Distribution mode are **TBD pending real-world experimentation and user feedback**. The community will help establish best practices through actual usage.

**Pipeline Mode** (Sequential Processing):

```html
<sl-snippet code="initial code">
	<sl-lens-reverse></sl-lens-reverse>
	<!-- gets: "initial code" -->
	<sl-lens-uppercase></sl-lens-uppercase>
	<!-- gets: reversed code -->
	<sl-lens-lowercase></sl-lens-lowercase>
	<!-- gets: reversed+uppercased code -->
</sl-snippet>
```

### Code Source Tracking

```typescript
export interface CodeSource {
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

This tracking enables debugging and optimization by showing exactly where each piece of code originated from in the discovery hierarchy.

## UI Components Architecture

Study Lenses WC-Kit includes a `/ui` directory containing visual components that use lenses for interactive code manipulation. These components provide high-level interfaces for common tasks while maintaining the functional/procedural design principles.

### UI Component Philosophy

- **Pure Functions**: UI components are implemented as pure functions that return DOM elements
- **No DOM Feedback**: Execution components (like run) operate silently with console output only
- **Event-Driven Communication**: Components communicate via custom events for code sharing
- **Pipeline Integration**: UI components use `pipeLenses` function to leverage existing lens ecosystem

### Available UI Components

#### `sl-ui-study-bar` - Code Context Manager

A flexbox container that manages code distribution to child UI components:

```html
<sl-ui-study-bar code="console.log('Shared context');">
	<sl-ui-run></sl-ui-run>
	<sl-ui-open-in></sl-ui-open-in>
</sl-ui-study-bar>
```

**Key Features:**

- Code discovery using standard 5-level precedence
- Event delegation for child component communication
- Responsive flexbox layout with automatic wrapping
- Snippet caching for child component access

#### `sl-ui-run` - Code Execution Controls

Interactive controls for executing JavaScript code through configurable lens pipelines:

```html
<sl-ui-run code="console.log('Direct execution');"></sl-ui-run>
```

**Controls:**

- **▶️ Run Button** - Executes code through pipeline
- **Debug Checkbox** - Adds debugger statements to execution
- **Loop Guard Checkbox** - Enables loop protection with AST transformation
- **Loop Guard Max** - Configurable iteration limit (1-10000)

**Pipeline Behavior:**

- Basic: `[run]`
- Loop Guard: `[loopGuard, run]`
- Loop Guard + Format: `[loopGuard, format, run]` (formatting applied after loop guard)
- Debug: `[run]` with debug configuration

**Language Support:**

- JavaScript (`.js`) - executed as script type
- ES Modules (`.mjs`) - executed as module type
- Dynamic test detection from snippet.test property

### UI Component Implementation Pattern

All UI components follow the same implementation pattern:

```typescript
// component.ts - Pure function implementation
export const component = (snippet: Snippet | null = null): HTMLElement => {
	const container = document.createElement('div');
	// Build UI elements
	// Add event listeners
	// Return container
};

// register.ts - Web component wrapper
class UIComponent extends HTMLElement {
	async connectedCallback() {
		const snippet = await extractCodeFromElement(this);
		const result = component(snippet);
		this.appendChild(result);
	}
}

// index.ts - Standard exports
export default {
	component, // Pure function
	name, // Base name ('run', 'study-bar')
	register, // Registration function
};
```

### Event-Based Communication System

UI components use custom events for code sharing:

```typescript
// Child component requesting code from parent study-bar
const event = new CustomEvent('request-code', {
	detail: {
		callback: (snippet: Snippet) => {
			// Use snippet data
		},
	},
	bubbles: true, // Must bubble to reach study-bar
});
element.dispatchEvent(event);

// Study-bar listens and provides snippet
container.addEventListener('request-code', (event: CustomEvent) => {
	event.stopPropagation();
	if (event.detail?.callback) {
		event.detail.callback(cachedSnippet);
	}
});
```

### Registration and Export Structure

UI components integrate seamlessly with the existing registration system:

```typescript
// Main exports include UI components
export const sl = {
	lenses, // Core lens collection
	study, // Pipeline and study functions
	snippet, // Snippet utilities
	ui, // UI components
};

// Automatic registration via existing system
// registerAllWC(studyLenses) finds and registers all UI components
```

### UI Development Guidelines

1. **Pure Functions First**: Implement logic as pure functions, wrap in minimal web components
2. **No Visual Feedback**: Execution components log to console, no DOM success/error states
3. **Event Communication**: Use custom events for parent-child communication
4. **Code Discovery**: Follow standard 5-level precedence in all components
5. **Pipeline Integration**: Use `pipeLenses` for any lens composition needs
6. **Responsive Design**: Use flexbox layouts with wrapping support

### Future UI Components

The UI architecture supports extending with additional components:

- **`sl-ui-lens-selector`** - Dynamic lens application with dropdown selection
- **`sl-ui-open-in`** - External tool integration (jstutor, jsViz, etc.)
- **`sl-ui-format`** - Code formatting controls
- **`sl-ui-trace-table`** - Variable tracing visualization

## Common Development Patterns

### Transform-Style Lens (Synchronous)

```typescript
export const myTransform = (
	snippet: Snippet,
	config: LensConfig = _config()
): LensOutput => ({
	snippet: {
		...snippet,
		code: transformCode(snippet.code, config),
	},
	view: null,
});
```

### View-Generating Lens (Synchronous)

```typescript
export const myVisual = (
	snippet: Snippet,
	config: LensConfig = _config()
): LensOutput => {
	const visualElement = document.createElement('div');
	visualElement.innerHTML = generateVisualization(snippet.code);

	return {
		snippet, // Pass through unchanged
		view: visualElement,
	};
};
```

### Hybrid Lens (Transform + View - Synchronous)

```typescript
export const myHybrid = (
	snippet: Snippet,
	config: LensConfig = _config()
): LensOutput => {
	const transformedCode = processCode(snippet.code, config);
	const visualElement = createVisualization(transformedCode);

	return {
		snippet: {
			...snippet,
			code: transformedCode,
		},
		view: visualElement,
	};
};
```

### Async Lens (I/O Operations)

```typescript
export const myAsyncLens = async (
	snippet: Snippet,
	config: LensConfig = _config()
): Promise<LensOutput> => {
	// Real async work: API calls, file I/O, etc.
	const analysisData = await fetch('/api/analyze', {
		method: 'POST',
		body: JSON.stringify({ code: snippet.code }),
	}).then((r) => r.json());

	const element = createAnalysisView(analysisData);

	return {
		snippet, // Pass through unchanged
		view: element,
	};
};
```

### JSX/Preact Lens (Interactive Components)

```tsx
// lens.tsx - Note the .tsx extension for JSX support
export const myJSXLens = async (
	snippet: Snippet,
	config: LensConfig = _config()
): Promise<LensOutput> => {
	const stats = analyzeCode(snippet.code);

	return {
		snippet, // Pass through unchanged
		view: (
			<div
				style={{
					padding: '16px',
					border: '2px solid #007acc',
					borderRadius: '8px',
					backgroundColor: '#f8f9fa',
				}}
			>
				<h3 style={{ color: '#007acc', marginTop: 0 }}>
					📊 Interactive Code Analysis
				</h3>

				<div
					style={{
						display: 'grid',
						gridTemplateColumns:
							'repeat(auto-fit, minmax(100px, 1fr))',
						gap: '12px',
						marginBottom: '16px',
					}}
				>
					<div style={{ textAlign: 'center' }}>
						<div style={{ fontSize: '24px', fontWeight: 'bold' }}>
							{stats.lines}
						</div>
						<div style={{ fontSize: '12px', color: '#666' }}>
							Lines
						</div>
					</div>
					<div style={{ textAlign: 'center' }}>
						<div style={{ fontSize: '24px', fontWeight: 'bold' }}>
							{stats.functions}
						</div>
						<div style={{ fontSize: '12px', color: '#666' }}>
							Functions
						</div>
					</div>
					<div style={{ textAlign: 'center' }}>
						<div style={{ fontSize: '24px', fontWeight: 'bold' }}>
							{stats.complexity}
						</div>
						<div style={{ fontSize: '12px', color: '#666' }}>
							Complexity
						</div>
					</div>
				</div>

				<details>
					<summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
						📝 Source Code
					</summary>
					<pre
						style={{
							backgroundColor: '#fff',
							padding: '12px',
							borderRadius: '4px',
							overflow: 'auto',
							fontSize: '14px',
						}}
					>
						{snippet.code}
					</pre>
				</details>
			</div>
		),
	};
};
```

**JSX Development Notes:**

- Use `.tsx` extension for files with JSX syntax
- Preact is automatically available (configured in tsconfig.json)
- JSX components are rendered to DOM by the web component wrapper
- Style objects use camelCase properties (backgroundColor vs background-color)
- Event handlers can be attached normally (onClick, onChange, etc.)

## Integration Guidelines

### For Simple Lenses (3-10 lines)

- Focus on single pure function
- Minimal or no configuration
- Standard component wrapper

### For Complex Interactive Lenses

- Break into multiple functions
- Rich configuration object
- Custom component setup if needed
- Consider performance implications

### Configuration Patterns

```typescript
// Access through main export
import sl from 'study-lenses-wc-kit';

// Simple config
export const config = () => ({ enabled: true });

// Complex config with factory pattern
export const config = (overrides = {}) =>
	deepMerge(
		{
			display: {
				theme: 'dark',
				animations: true,
			},
			processing: {
				timeout: 5000,
				retries: 3,
			},
		},
		overrides
	);

// Usage with sl.lenses
const defaultConfig = sl.lenses.myLens.config();
const customConfig = sl.lenses.myLens.config({ theme: 'dark' });
```

## Configuration Management

### Config Factory Pattern

All lens configurations use a factory pattern with deep merge for flexible overrides:

```typescript
// Get default configuration
const defaultConfig = sl.lenses.myLens.config();

// Override specific settings
const customConfig = sl.lenses.myLens.config({
	theme: 'dark',
	animations: true,
});

// Nested overrides supported
const advancedConfig = sl.lenses.myLens.config({
	display: {
		theme: 'dark', // Only overrides theme, keeps other display settings
	},
});
```

### Implementation Pattern

```typescript
// config.ts - Factory function with deep merge
import { deepMerge } from '../../utils/deep-merge.js';

const defaultConfig = {
	theme: 'light',
	showDetails: true,
	display: {
		animations: false,
		compact: true,
	},
};

export const config = (overrides = {}) => deepMerge(defaultConfig, overrides);
export default config;

// index.ts - Direct export of config factory
import config from './config.js';

export default {
	lens,
	view,
	config,
};
```

### Migration from Deep Cloning to Factory Pattern

**Previous Pattern (Heavy)**:

```typescript
// OLD: config.ts
export const config = { theme: 'light', debug: false };

// OLD: index.ts
import { deepClone } from '../../utils/deep-clone.js';
get config() {
  return deepClone(_config); // 88-line full clone every access
}
```

**Current Pattern (Elegant)**:

```typescript
// config.ts
import { deepMerge } from '../../utils/deep-merge.js';

const defaultConfig = { theme: 'light', debug: false };
export const config = (overrides = {}) => deepMerge(defaultConfig, overrides);

// index.ts
export default { lens, view, config }; // Just export the factory function
```

**Migration Benefits**:

- **Performance**: 17-line `deepMerge` vs 88-line `deepClone` utility
- **Flexibility**: Supports partial config overrides with `lens.config({ theme: 'dark' })`
- **API Compatibility**: No breaking changes - `lens.config()` still works exactly as before
- **Composability**: Config becomes a proper factory following existing metappet patterns
- **Lighter Weight**: Reuses existing deep-merge utility instead of comprehensive deep-clone
- **Explicit Intent**: Function call pattern makes configuration copying explicit

**Usage Patterns**:

```typescript
// Default usage (same as before)
const cfg = sl.lenses.reverse.config(); // Gets defaults

// Override usage (enhanced capability)
const cfg = sl.lenses.reverse.config({
	theme: 'dark',
	advanced: { timeout: 10000 }, // Deep merge preserves other advanced props
});

// No breaking changes - these both work exactly as before
const config1 = lens.config();
const config2 = lens.config();
config1.theme = 'modified'; // Safe - independent objects
```

**Benefits:**

- **Flexible Overrides**: Partial configuration with deep merge support
- **No Mutations**: Each call returns fresh object with no side effects
- **Performance**: No expensive deep cloning, only when config is needed
- **Type Safety**: Maintains TypeScript inference for configuration options

## Web Component Registration System

Study Lenses WC-Kit provides a comprehensive, type-safe system for automatically registering web components throughout the entire object hierarchy. This system enables seamless auto-discovery and registration of all lens components and UI components from a single import.

### Registration Types

The registration system is built on four core TypeScript interfaces:

```typescript
// Registration function signature
export type RegisterFunction = () => string;

// Object that may have a register function
export interface RegisterableObject {
	register?: RegisterFunction;
	[key: string]: any; // Flexible object traversal
}

// Result of a successful registration
export interface RegistrationResult {
	path: string; // "lenses.reverse" or "ui.studyBar"
	tagName: string; // "sl-lens-reverse" or "sl-ui-study-bar"
}

// Container that may hold registerable objects
export type RegisterableContainer = {
	[key: string]: RegisterableObject | RegisterableContainer | any;
};
```

### Core Registration Function

The `registerAllWC` function provides automatic web component registration:

```typescript
import { registerAllWC } from './utils/register-all-wc.js';
import type { RegistrationResult } from './types.js';

/**
 * Recursively traverse an object and call any 'register' functions found
 *
 * @param obj - Object to traverse (typically the main Study Lenses export)
 * @param path - Current path for debugging (internal use)
 * @returns Array of registration results with path and tag name information
 */
export const registerAllWC = (
	obj: RegisterableContainer,
	path: string = ''
): RegistrationResult[] => {
	// Recursively finds and calls all register() functions
	// Returns detailed results for debugging and verification
};
```

### Automatic Registration Patterns

**Initialization Pattern:**

```typescript
// src/init.ts - Side-effect only file for auto-registration
import sl from './index.js';
import { registerAllWC } from './utils/register-all-wc.js';

// Register all web components on import
const registered = registerAllWC(sl);
console.log(`📦 Study Lenses: Registered ${registered.length} web components`);

// Usage in HTML:
// <script type="module" src="path/to/init.js"></script>
```

**Manual Registration Pattern:**

```typescript
// Selective registration with detailed feedback
import sl from './index.js';
import { registerAllWC } from './utils/register-all-wc.js';
import type { RegistrationResult } from './types.js';

const results: RegistrationResult[] = registerAllWC(sl.lenses);
results.forEach(({ path, tagName }) => {
	console.log(`✅ ${tagName} registered from ${path}`);
});

// Register only UI components
const uiResults: RegistrationResult[] = registerAllWC(sl.ui);
```

### Registration Architecture

**Hierarchical Discovery:**

```typescript
// The function traverses this structure:
const sl = {
	lenses: {
		reverse: {
			register: () => 'sl-lens-reverse', // ← Found and called
			lens: reverseLensFunction,
			config: reverseConfigFactory,
		},
		uppercase: {
			register: () => 'sl-lens-uppercase', // ← Found and called
			lens: uppercaseLensFunction,
		},
	},
	ui: {
		studyBar: {
			register: () => 'sl-ui-study-bar', // ← Found and called
			component: studyBarFunction,
		},
		run: {
			register: () => 'sl-ui-run', // ← Found and called
			component: runFunction,
		},
	},
	study: {
		// No register function - skipped
		pipe: pipeFunction,
	},
};

// Results in:
// [
//   { path: "lenses.reverse", tagName: "sl-lens-reverse" },
//   { path: "lenses.uppercase", tagName: "sl-lens-uppercase" },
//   { path: "ui.studyBar", tagName: "sl-ui-study-bar" },
//   { path: "ui.run", tagName: "sl-ui-run" },
// ]
```

### Error Handling and Debugging

**Comprehensive Error Reporting:**

```typescript
// The registration system provides detailed logging:
// ✅ Registered: sl-lens-reverse (lenses.reverse)
// ✅ Registered: sl-ui-study-bar (ui.studyBar)
// ❌ Failed to register lenses.broken: TypeError: Cannot read property 'call'

// Type-safe error handling
try {
	const results = registerAllWC(sl);
	console.log(`Successfully registered ${results.length} components`);
} catch (error) {
	console.error('Registration failed:', error);
}
```

**Development Debugging:**

```typescript
// Inspect registration results programmatically
const results = registerAllWC(sl);
const byCategory = results.reduce(
	(acc, { path, tagName }) => {
		const category = path.split('.')[0]; // 'lenses', 'ui', etc.
		acc[category] = acc[category] || [];
		acc[category].push(tagName);
		return acc;
	},
	{} as Record<string, string[]>
);

console.log('Registration by category:', byCategory);
// Output: { lenses: ['sl-lens-reverse', 'sl-lens-uppercase'], ui: ['sl-ui-run'] }
```

### Integration with Development Workflow

**Lens Development Pattern:**

```typescript
// lenses/my-lens/index.ts
export default {
	name: 'my-lens',
	lens: myLensFunction,
	register: () => 'sl-lens-my-lens', // ← Discovered by registerAllWC
	config: myConfigFactory,
};

// Automatically registered when registerAllWC(sl.lenses) is called
```

**Testing Registration:**

```typescript
// Test that registration works correctly
import { registerAllWC } from './utils/register-all-wc.js';
import myLens from './lenses/my-lens/index.js';

describe('my-lens registration', () => {
	it('should register with correct tag name', () => {
		const results = registerAllWC({ myLens });
		expect(results).toHaveLength(1);
		expect(results[0].tagName).toBe('sl-lens-my-lens');
		expect(results[0].path).toBe('myLens');
	});
});
```

### Performance and Security

**Performance Characteristics:**

- **O(n) traversal** where n = total number of object properties
- **Lazy execution** - only runs when explicitly called
- **Memory efficient** - no object cloning, direct traversal
- **Type-safe** - full TypeScript support prevents runtime errors

**Security Considerations:**

- **Pure function** - no side effects beyond calling register functions
- **Error isolation** - failed registrations don't stop the process
- **Explicit control** - only calls functions named exactly "register"
- **Path tracking** - full debugging information for security auditing

The registration system provides a robust, type-safe foundation for automatically managing web component lifecycles while maintaining full developer control and debugging capability.

## Performance Considerations

### Pipeline Performance Optimization

The smart pipeline architecture allows for strategic optimization using terminus conditions:

```typescript
// Use terminus conditions strategically
const optimizedPipeline = async (snippet: Snippet, showVisual: boolean) => {
	if (showVisual) {
		// Visual lens terminates early - no unnecessary processing
		return await sl.core.pipeLenses(snippet, [
			sl.lenses.codeMetrics, // Terminates with visual output
			// These won't run:
			// sl.lenses.expensiveAnalysis,
			// sl.lenses.heavyTransform,
		]);
	} else {
		// Transform-only pipeline for better performance
		return await sl.core.pipeLenses(snippet, [
			sl.lenses.reverse.lens, // Just the function
			sl.lenses.uppercase.lens, // Just the function
		]);
	}
};
```

**Performance Characteristics:**

- **Sequential Processing**: O(n) where n = number of lenses until terminus
- **Early Termination**: Stops immediately on first terminus condition  
- **Pure functions are fast** - no object creation overhead
- **Components are cached** - createLensElement returns singleton-like behavior
- **Configuration uses factory pattern** - prevents accidental mutations
- **Error handling is fail-fast** - stops pipeline on first error

### Memory Management for Large Codebases

When processing multiple files, use batching to avoid memory issues:

```typescript
const processLargeCodebase = async (files: string[]) => {
	const results = [];

	// Process files in batches to avoid memory issues
	const batchSize = 10;
	for (let i = 0; i < files.length; i += batchSize) {
		const batch = files.slice(i, i + batchSize);

		const batchResults = await Promise.all(
			batch.map(async (code) => {
				const snippet = { code, lang: 'js', test: false };

				// Use lightweight transform-only lenses
				return await sl.core.pipeLenses(snippet, [
					sl.lenses.codeMetrics.lens, // Extract function only
				]);
			})
		);

		results.push(...batchResults);

		// Allow garbage collection between batches
		if (typeof global !== 'undefined' && global.gc) {
			global.gc();
		}
	}

	return results;
};
```

**Memory Efficiency Guidelines:**

- **Process in batches** for large datasets
- **Use function extracts** (`.lens`) instead of full objects when possible
- **Prefer transform-only pipelines** when visual output isn't needed
- **Allow GC between batches** for long-running processes

## Configuration Management Patterns

### Deep Configuration Merging

Study Lenses supports sophisticated configuration with deep merge capabilities:

```typescript
import sl from 'study-lenses-wc-kit';

// Complex configuration example
const complexConfig = {
	display: {
		theme: 'dark',
		syntax: {
			highlighting: true,
			colorScheme: 'monokai',
		},
		layout: {
			compact: false,
			showMinimap: true,
		},
	},
	processing: {
		timeout: 10000,
		retries: 3,
		validation: {
			strict: true,
			allowJS: true,
		},
	},
};

// Get default config
const defaultConfig = sl.lenses.jsxDemo.config();

// Partial override with deep merge
const customConfig = sl.lenses.jsxDemo.config({
	display: {
		theme: 'light', // Only changes theme
		// syntax and layout remain at defaults
	},
	processing: {
		timeout: 5000, // Only changes timeout
		// retries and validation remain at defaults
	},
});

// Use in pipeline
const result = await sl.core.pipeLenses(snippet, [
	[sl.lenses.jsxDemo, customConfig],
]);
```

### Configuration Factory Patterns

Create reusable configuration factories for common scenarios:

```typescript
// Create reusable configuration factories
const createDarkThemeConfig = (overrides = {}) =>
	sl.lenses.jsxDemo.config({
		display: { theme: 'dark' },
		...overrides,
	});

const createProductionConfig = (overrides = {}) =>
	sl.lenses.jsxDemo.config({
		processing: { strict: true, timeout: 30000 },
		display: { compact: true },
		...overrides,
	});

// Use configuration factories
const darkConfig = createDarkThemeConfig({ processing: { timeout: 15000 } });
const prodConfig = createProductionConfig({ display: { theme: 'dark' } });

// Multiple lenses with different configs
const result = await sl.core.pipeLenses(snippet, [
	[sl.lenses.reverse, darkConfig],
	[sl.lenses.uppercase, prodConfig],
]);
```

### Environment-Specific Configuration

Dynamic configuration based on runtime environment:

```typescript
// Environment-specific configuration
const environments = {
	development: {
		debug: true,
		timeout: 60000,
		showErrors: true,
	},
	production: {
		debug: false,
		timeout: 10000,
		showErrors: false,
	},
	testing: {
		debug: false,
		timeout: 5000,
		showErrors: true,
	},
};

// Dynamic configuration based on environment
const getEnvironmentConfig = (env: string = 'development') => {
	const baseConfig = environments[env] || environments.development;

	return sl.lenses.jsxDemo.config({
		...baseConfig,
		display: {
			theme: env === 'development' ? 'light' : 'dark',
		},
	});
};

// Usage
const config = getEnvironmentConfig(process.env.NODE_ENV);
const result = await sl.core.pipeLenses(snippet, [[sl.lenses.jsxDemo, config]]);
```

**Configuration Best Practices:**

- **Use factory pattern** for reusable configurations
- **Deep merge capabilities** allow partial overrides
- **Environment-aware configs** for different deployment contexts
- **Type safety** maintained through config factory functions

## Package Preparation

When preparing for standalone package release:

1. **Update package.json** with proper exports field
2. **Add TypeScript declaration files** if needed
3. **Create comprehensive README.md**
4. **Add examples directory** with usage samples
5. **Include LICENSE file**
6. **Add CONTRIBUTING.md** for external lens developers

## Critical Files to Understand

- `types.ts` - Core type definitions including web component registration types
- `core/pipe-lenses.ts` - Core pipeline function with terminus conditions (accessible as `sl.core.pipeLenses`)
- `core/index.ts` - Essential functions export (the `sl.core` namespace)
- `utils/extract-code-from-element.ts` - Code discovery with precedence rules
- `utils/register-all-wc.ts` - Automated web component registration system
- `web-components/lens-wrapper.ts` - Component factory
- `register.ts` - Top-level registration

## Key Rules for Contributors

1. **Never break export conventions** - consistency is critical
2. **Always use pure functions** for business logic
3. **Keep components minimal** - just attribute parsing
4. **Follow the lens function signature** - no exceptions
5. **Test all import patterns** - named, default, and generic object
6. **Document complex lenses** - especially configuration options
7. **Write comprehensive tests** - unit tests for every exported function
8. **Create interactive tests** - HTML files for every view component

This package is designed to scale from simple text transforms to complex interactive visualizations while maintaining predictable patterns, clean APIs, and comprehensive testing coverage.

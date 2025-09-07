# Contributing to Study Lenses

Thank you for your interest in contributing to Study Lenses! This guide will help you create new lenses and contribute to the project effectively.

## 🧠 Understanding Study Lenses V2

Study Lenses V2 simplifies the API while maintaining **functional/procedural principles**:

- **Single Main Export**: Everything accessible through `sl` object with focused categories
- **Core Functions**: Essential operations available through `sl.core` namespace
- **Pure Functions**: All business logic lives in pure, testable functions
- **Minimal Components**: Web components are thin wrappers that only parse attributes
- **Smart Pipelines**: Sequential processing until terminus (view or side effect)
- **Universal File Loading**: All components support both `code=""` and `src=""` attributes

## 🔍 Lens Development Guide

> **Usage Pattern Guidance**: When developing lenses, experiment with sequential processing in `<sl-snippet>` to determine which works best for your lens. Optimal usage patterns are **TBD pending community experimentation** - your findings will help establish best practices.

### Lens Function Signature

Every lens must follow this exact signature:

```typescript
async function lensName(
	snippet: Snippet,
	config?: LensConfig
): Promise<LensOutput>;
```

Where:

- `snippet`: Code content with metadata (`{ code: string, lang: string, test: boolean }`)
- `config`: Optional lens-specific configuration (defaults to lens's default config)
- Returns: `{ snippet: Snippet, view: HTMLElement | ComponentChild | null }`

**Key Change**: Arguments are now separate (not destructured from object) for better ergonomics and default config handling.

### Types of Lenses

#### 1. Transform Lens (Code Modification)

```typescript
import _config from './config.js';

export const myTransform = async (
	snippet: Snippet,
	config = _config()
): Promise<LensOutput> => ({
	snippet: {
		...snippet,
		code: transformCode(snippet.code, config),
	},
	view: null, // No visual output - continues pipeline
});
```

#### 2. Visual Lens (Display Generation)

```typescript
import _config from './config.js';

export const myVisual = async (
	snippet: Snippet,
	config = _config()
): Promise<LensOutput> => {
	const element = document.createElement('div');
	element.innerHTML = generateVisualization(snippet.code, config);

	return {
		snippet, // Pass through unchanged
		view: element, // Terminates pipeline with visual output
	};
};
```

#### 3. Hybrid Lens (Transform + Visual)

```typescript
import _config from './config.js';

export const myHybrid = async (
	snippet: Snippet,
	config = _config()
): Promise<LensOutput> => {
	const transformedCode = processCode(snippet.code, config);
	const visualization = createChart(transformedCode, config);

	return {
		snippet: { ...snippet, code: transformedCode },
		view: visualization, // Shows both transformed code and visualization
	};
};
```

#### 4. JSX/Preact Lens (Interactive Components)

```tsx
// lens.tsx - Note the .tsx extension for JSX support
import type { Snippet, LensOutput } from '../../types.js';
import _config from './config.js';

export const lens = async (
	snippet: Snippet,
	config = _config()
): Promise<LensOutput> => {
	const stats = analyzeCode(snippet.code);

	return {
		snippet, // Pass through unchanged
		view: (
			<div style={{ padding: '16px', border: '1px solid #ccc' }}>
				<h3>📊 Interactive Analysis</h3>
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(3, 1fr)',
						gap: '12px',
					}}
				>
					<div>
						<strong>{stats.lines}</strong>
						<div>Lines</div>
					</div>
					<div>
						<strong>{stats.functions}</strong>
						<div>Functions</div>
					</div>
					<div>
						<strong>{stats.complexity}</strong>
						<div>Complexity</div>
					</div>
				</div>
				<details>
					<summary>View Code</summary>
					<pre>{snippet.code}</pre>
				</details>
			</div>
		),
	};
};

export default lens;
```

**JSX Requirements:**

- Use `.tsx` extension for lens files containing JSX
- Install Preact: `npm install preact`
- JSX elements are automatically rendered to DOM by the framework
- For detailed JSX integration technical requirements, see [CLAUDE.md JSX/Preact Integration](./CLAUDE.md#jsxpreact-integration)

## 🔗 Using Custom Lenses in Flexible Pipelines

Study Lenses V2 introduces flexible LensSpec arrays that let you mix custom lenses with built-in library lenses seamlessly:

### Pattern Examples

```typescript
import sl from 'study-lenses-wc-kit';

// Your custom lens function
const myCustomLens = async (snippet, config = {}) => ({
	snippet: { ...snippet, code: snippet.code + ' // processed' },
	view: null,
});

// 4 flexible usage patterns with core API:
const result = await sl.core.pipeLenses(
	{ code: 'hello', lang: 'js', test: false },
	[
		// Pattern 1: Simple custom function
		myCustomLens,

		// Pattern 2: Library lens object (gets name + defaults)
		sl.lenses.reverse,

		// Pattern 3: Custom function with config
		[myCustomLens, { theme: 'dark', debug: true }],

		// Pattern 4: Library lens with config override (deep merged)
		[sl.lenses.uppercase, { preserveSpaces: true }],
	]
);
```

### Custom Lens Function Requirements

Your custom lens functions must follow the same signature as library lenses:

```typescript
async function myCustomLens(
	snippet: Snippet, // Code + metadata
	config?: LensConfig // Optional configuration (your choice of shape)
): Promise<LensOutput> {
	// { snippet, view }
	// Your custom processing...

	return {
		snippet: processedSnippet, // Transform code, or pass through unchanged
		view: optionalVisualElement, // HTMLElement, JSX component, or null
	};
}
```

**Benefits:**

- **No Registration Required**: Custom functions work immediately in pipelines
- **Mix and Match**: Combine custom lenses with library lenses in same pipeline
- **Config Flexibility**: Library lenses automatically deep merge configs with defaults
- **Type Safety**: Full TypeScript support for all patterns

## 📁 Creating a New Lens

### 1. Directory Structure

Create a new directory under `lenses/` with these required files:

```
lenses/my-lens/
├── name.ts       # Lens name (single source of truth)
├── lens.ts       # Pure lens function (or lens.tsx for JSX)
├── view.ts       # Web component wrapper
├── config.ts     # Default configuration
├── register.ts   # Browser registration (side effects only)
└── index.ts      # Barrel exports (no side effects)
```

**File Extensions:**

- Use `.ts` for regular TypeScript lens functions
- Use `.tsx` for lens functions that return JSX components
- All other files remain `.ts` regardless of lens type

### 2. Lens Name Definition

**`name.ts`** - Single source of truth for lens identification:

```typescript
/**
 * Lens Name - Single source of truth for lens identification
 * Used in pipeline processing, configuration keys, and dynamic exports
 */
export const name = 'my-lens';
```

### 3. Function Implementation

**`lens.ts`** - The core logic:

```typescript
import type { Snippet, LensOutput, LensConfig } from '../../types.js';

export const lens = async (
	snippet: Snippet,
	config: LensConfig = _config()
): Promise<LensOutput> => ({
	snippet: {
		...snippet,
		code: processCode(snippet.code, config),
	},
	view: null,
});

export default lens;
```

### 4. Component Wrapper

**`view.ts`** - Minimal web component:

```typescript
import { createLensElement } from '../../components/lens-wrapper.js';
import { myLens } from './lens.js';

export const view = createLensElement('my-lens', lens);
export default view;
```

### 5. Configuration

**`config.ts`** - Config factory with deep merge support:

```typescript
import { deepMerge } from '../../utils/deep-merge.js';

const defaultConfig = {
	enabled: true,
	option1: 'default-value',
	option2: 42,
	display: {
		theme: 'light',
		compact: false,
	},
};

export const config = (overrides = {}) => deepMerge(defaultConfig, overrides);
export default config;
```

### 6. Registration

**`register.ts`** - Browser side effects only:

```typescript
import { view } from './view.js';

// Register web component
if (typeof window !== 'undefined' && 'customElements' in window) {
	if (!customElements.get('sl-lens-my-lens')) {
		customElements.define('sl-lens-my-lens', view);
	}
}
```

### 7. Barrel Exports

**`index.ts`** - Clean import interface with name property:

```typescript
import { name } from './name.js';
import lens from './lens.js';
import view from './view.js';
import config from './config.js';

// Default export only (generic object interface)
export default {
	name, // Self-describing lens name for pipeline consistency
	lens,
	view,
	config,
};
```

**Configuration Factory Pattern:**

- Each `lens.config()` call returns a fresh, independent object
- Supports partial overrides with deep merge: `lens.config({ theme: 'dark' })`
- No mutations - completely side-effect free configuration
- Better performance - no expensive deep cloning, only when config is needed

### 8. Update Main Lens Registry

Add your lens to the main lens registry which uses dynamic key generation based on the lens name:

**`lenses/index.ts`** - Main registry with dynamic key generation:

```typescript
// Import lens objects
import reverse from './reverse/index.js';
import uppercase from './uppercase/index.js';
import lowercase from './lowercase/index.js';
import jsxDemo from './jsx-demo/index.js';
import myLens from './my-lens/index.js'; // Add your lens

// Import names for dynamic key generation
import { name as reverseName } from './reverse/name.js';
import { name as uppercaseName } from './uppercase/name.js';
import { name as lowercaseName } from './lowercase/name.js';
import { name as jsxDemoName } from './jsx-demo/name.js';
import { name as myLensName } from './my-lens/name.js'; // Add your lens name

// Generate export object using names as keys (compile-time deterministic)
export default {
	[reverseName]: reverse, // 'reverse': reverseObj
	[uppercaseName]: uppercase, // 'uppercase': uppercaseObj
	[lowercaseName]: lowercase, // 'lowercase': lowercaseObj
	[jsxDemoName]: jsxDemo, // 'jsx-demo': jsxDemoObj
	[myLensName]: myLens, // 'my-lens': myLensObj
} as const;
```

**Key Benefits of Dynamic Key Generation:**

- **Single Source of Truth**: Lens name defined once in `name.ts`, used everywhere
- **Compile-Time Safety**: TypeScript validates name consistency at build time
- **Runtime Validation**: Pipeline checks name property matches usage key
- **Refactoring Safe**: Rename a lens by only changing its `name.ts` file
- **Hyphenated Names**: Supports complex names like `jsx-demo` seamlessly

## 🧪 Testing Your Lens

Study Lenses uses a comprehensive testing approach with both **automated unit tests** and **interactive browser tests** to ensure lens quality and functionality.

### Testing Architecture

**Two-tier testing system:**

1. **Unit Tests (`.spec.ts`)** - Automated testing with Vitest + Jest syntax
    - Fast feedback during development
    - Code coverage reporting
    - CI/CD pipeline integration
    - BDD-style describe/it/expect syntax

2. **Interactive UI Tests (`.test.html`)** - Manual browser verification
    - Web component registration testing
    - Visual output validation
    - Cross-browser compatibility
    - Real DOM environment testing

### Unit Testing with Vitest

#### Test File Naming Convention

**Place test files next to the code they test** (not in separate directories):

```
src/utils/deep-merge.ts        → src/utils/deep-merge.spec.ts
src/lenses/reverse/lens.ts     → src/lenses/reverse/lens.spec.ts
src/study/pipe.ts              → src/study/pipe.spec.ts
src/web-components/setup-functions.ts → src/web-components/setup-functions.spec.ts
```

This keeps tests close to the implementation for easier maintenance and discovery.

#### BDD Testing Patterns

Use Jest-style `describe`/`it`/`expect` syntax for all tests:

```typescript
// src/utils/deep-merge.spec.ts
import { describe, it, expect } from '@jest/globals';
import { deepMerge } from './deep-merge.js';

describe('deepMerge', () => {
	it('should merge simple objects', () => {
		const result = deepMerge({ a: 1 }, { b: 2 });
		expect(result).toEqual({ a: 1, b: 2 });
	});

	it('should deep merge nested objects', () => {
		const result = deepMerge(
			{ config: { theme: 'light', debug: false } },
			{ config: { debug: true } }
		);
		expect(result).toEqual({
			config: { theme: 'light', debug: true },
		});
	});

	it('should not mutate original objects', () => {
		const original = { a: 1 };
		const override = { b: 2 };
		const result = deepMerge(original, override);

		expect(original).toEqual({ a: 1 });
		expect(override).toEqual({ b: 2 });
		expect(result).toEqual({ a: 1, b: 2 });
	});
});
```

#### Lens Function Testing Template

```typescript
// src/lenses/my-lens/lens.spec.ts
import { describe, it, expect } from '@jest/globals';
import { lens } from './lens.js';
import config from './config.js';

describe('myLens', () => {
	const testSnippet = {
		code: 'function test() { return 42; }',
		lang: 'js',
		test: false,
	};

	it('should transform code correctly', async () => {
		const result = await lens(testSnippet, config());

		expect(result.snippet.code).toContain('expected transformation');
		expect(result.snippet.lang).toBe('js');
		expect(result.snippet.test).toBe(false);
		expect(result.view).toBeNull(); // Transform lens
	});

	it('should handle empty code', async () => {
		const emptySnippet = { code: '', lang: 'js', test: false };
		const result = await lens(emptySnippet, config());

		expect(result.snippet.code).toBe(''); // or whatever makes sense
		expect(result.view).toBeNull();
	});

	it('should respect configuration options', async () => {
		const customConfig = config({ option1: 'custom-value' });
		const result = await lens(testSnippet, customConfig);

		// Test that config affects behavior
		expect(result.snippet.code).toMatch(/custom-value/);
	});

	it('should handle configuration with deep merge', async () => {
		const nestedConfig = config({
			display: { theme: 'dark' },
		});
		const result = await lens(testSnippet, nestedConfig);

		// Verify nested config is applied
		expect(result.snippet.code).toContain('dark theme applied');
	});

	it('should throw descriptive errors on invalid input', async () => {
		const invalidSnippet = { code: null, lang: 'js', test: false };

		await expect(lens(invalidSnippet as any, config())).rejects.toThrow(
			/Invalid snippet code/
		);
	});
});
```

#### Config Factory Testing Template

```typescript
// src/lenses/my-lens/config.spec.ts
import { describe, it, expect } from '@jest/globals';
import { config } from './config.js';

describe('myLens config factory', () => {
	it('should return default config when called with no arguments', () => {
		const defaultConfig = config();

		expect(defaultConfig).toEqual({
			enabled: true,
			option1: 'default-value',
			display: {
				theme: 'light',
				compact: false,
			},
		});
	});

	it('should merge simple overrides', () => {
		const customConfig = config({ enabled: false });

		expect(customConfig.enabled).toBe(false);
		expect(customConfig.option1).toBe('default-value'); // Unchanged
	});

	it('should deep merge nested overrides', () => {
		const customConfig = config({
			display: { theme: 'dark' },
		});

		expect(customConfig.display.theme).toBe('dark');
		expect(customConfig.display.compact).toBe(false); // Preserved
	});

	it('should return independent objects on each call', () => {
		const config1 = config({ option1: 'value1' });
		const config2 = config({ option1: 'value2' });

		expect(config1.option1).toBe('value1');
		expect(config2.option1).toBe('value2');

		// Modify one, other should be unaffected
		config1.option1 = 'modified';
		expect(config2.option1).toBe('value2');
	});
});
```

#### Pipeline Integration Testing

```typescript
// src/core/pipe-lenses.spec.ts
import { describe, it, expect } from '@jest/globals';
import { pipeLenses } from './pipe-lenses.js';
import sl from '../index.js';

describe('core pipeLenses function', () => {
	const testSnippet = {
		code: 'hello world',
		lang: 'js',
		test: false,
	};

	it('should process single lens', async () => {
		const result = await pipeLenses(testSnippet, [sl.lenses.reverse]);

		expect(result.snippet.code).toBe('dlrow olleh');
		expect(result.view).toBeNull();
	});

	it('should process lens chain until terminus', async () => {
		const result = await pipeLenses(testSnippet, [
			sl.lenses.reverse,
			sl.lenses.uppercase,
		]);

		expect(result.snippet.code).toBe('DLROW OLLEH');
		expect(result.view).toBeNull();
	});

	it('should handle custom lens functions', async () => {
		const customLens = async (snippet, config = {}) => ({
			snippet: { ...snippet, code: snippet.code + ' // custom' },
			view: null,
		});

		const result = await pipeLenses(testSnippet, [customLens]);

		expect(result.snippet.code).toBe('hello world // custom');
	});

	it('should handle lens with config override', async () => {
		const result = await pipeLenses(testSnippet, [
			[sl.lenses.reverse, { preserveSpaces: true }],
		]);

		expect(result.snippet.code).toBe('dlrow olleh');
	});

	it('should throw error on invalid lens specs', async () => {
		await expect(pipeLenses(testSnippet, [null as any])).rejects.toThrow();
	});
});
```

### Interactive UI Testing

#### HTML Test File Template

Create a `view.test.html` file next to each `view.ts` file for manual component testing:

```html
<!-- src/lenses/my-lens/view.test.html -->
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>My Lens Component Test</title>
		<style>
			body {
				font-family: system-ui, sans-serif;
				max-width: 1200px;
				margin: 0 auto;
				padding: 20px;
			}
			.test-section {
				margin: 20px 0;
				padding: 20px;
				border: 2px solid #ddd;
				border-radius: 8px;
			}
			.test-section.pass {
				border-color: #28a745;
				background: #f8fff9;
			}
			.test-section.fail {
				border-color: #dc3545;
				background: #fff8f8;
			}
			pre {
				background: #f5f5f5;
				padding: 10px;
				border-radius: 4px;
			}
			.checklist {
				margin: 10px 0;
			}
			.checklist li {
				margin: 5px 0;
			}
		</style>
	</head>
	<body>
		<h1>🧪 My Lens Component Test</h1>

		<!-- Test 1: Basic functionality -->
		<div class="test-section">
			<h2>Test 1: Basic Code Transformation</h2>
			<p>
				<strong>Expected:</strong> Should transform the input code
				according to lens logic
			</p>

			<sl-lens-my-lens
				code="function test() { return 42; }"
			></sl-lens-my-lens>

			<div class="checklist">
				<strong>Manual Verification Checklist:</strong>
				<ul>
					<li>☐ Component renders without errors</li>
					<li>☐ Code transformation is applied correctly</li>
					<li>☐ Output format matches expected pattern</li>
					<li>☐ No console errors</li>
				</ul>
			</div>
		</div>

		<!-- Test 2: Configuration attributes -->
		<div class="test-section">
			<h2>Test 2: Configuration Options</h2>
			<p>
				<strong>Expected:</strong> Should respect configuration passed
				via attributes
			</p>

			<sl-lens-my-lens
				code="console.log('hello world')"
				option1="custom-value"
				theme="dark"
			>
			</sl-lens-my-lens>

			<div class="checklist">
				<strong>Manual Verification Checklist:</strong>
				<ul>
					<li>☐ Custom configuration is applied</li>
					<li>☐ Attributes are parsed correctly</li>
					<li>☐ Visual styling reflects configuration</li>
					<li>☐ Default values preserved for unspecified options</li>
				</ul>
			</div>
		</div>

		<!-- Test 3: File loading -->
		<div class="test-section">
			<h2>Test 3: File Path Loading</h2>
			<p>
				<strong>Expected:</strong> Should load code from file path in
				code attribute
			</p>

			<sl-lens-my-lens
				code="../examples/content/greet.js"
			></sl-lens-my-lens>

			<div class="checklist">
				<strong>Manual Verification Checklist:</strong>
				<ul>
					<li>☐ File content loads correctly</li>
					<li>☐ Language is auto-detected from extension</li>
					<li>☐ Test flag is set appropriately</li>
					<li>☐ Error handling for missing files works</li>
				</ul>
			</div>
		</div>

		<!-- Test 4: Empty/edge cases -->
		<div class="test-section">
			<h2>Test 4: Edge Cases</h2>
			<p>
				<strong>Expected:</strong> Should handle edge cases gracefully
			</p>

			<h3>Empty Code:</h3>
			<sl-lens-my-lens code=""></sl-lens-my-lens>

			<h3>Invalid Configuration:</h3>
			<sl-lens-my-lens
				code="test"
				invalid-attr="bad-value"
			></sl-lens-my-lens>

			<div class="checklist">
				<strong>Manual Verification Checklist:</strong>
				<ul>
					<li>☐ Empty code handled without errors</li>
					<li>☐ Invalid attributes ignored or handled gracefully</li>
					<li>☐ Error messages are user-friendly</li>
					<li>☐ Component doesn't crash on edge cases</li>
				</ul>
			</div>
		</div>

		<!-- Test 5: Integration with other components -->
		<div class="test-section">
			<h2>Test 5: Integration Testing</h2>
			<p><strong>Expected:</strong> Should work correctly in pipelines</p>

			<h3>Pipeline Mode:</h3>
			<sl-snippet
				lenses="my-lens reverse"
				code="hello world"
			></sl-snippet>

			<div class="checklist">
				<strong>Manual Verification Checklist:</strong>
				<ul>
					<li>☐ Works correctly in pipeline mode</li>
					<li>☐ Plays nicely with other lenses</li>
					<li>☐ No conflicts or interference</li>
				</ul>
			</div>
		</div>

		<!-- Import and register the component -->
		<script type="module">
			// Register all components for testing
			import './register.js';
			import '../../reverse/register.js';
			import '../../study/register.js';

			console.log('✅ My Lens component test loaded successfully');

			// Optional: Add interactive testing helpers
			window.testLens = {
				// Helper function to test lens directly
				async testFunction(code, config = {}) {
					const { lens } = await import('./lens.js');
					const { config: configFactory } = await import(
						'./config.js'
					);

					const snippet = { code, lang: 'js', test: false };
					const result = await lens(snippet, configFactory(config));

					console.log('Test result:', result);
					return result;
				},
			};
		</script>
	</body>
</html>
```

#### Component Testing Workflow

1. **Create HTML test file** next to each view.ts
2. **Import component registration** in script tag
3. **Test various scenarios** with different attributes
4. **Manual verification** using checklist approach
5. **Interactive testing** with browser developer tools

### Testing Development Workflow

#### Test-Driven Development (TDD)

1. **Write failing test** for desired functionality
2. **Implement minimal code** to make test pass
3. **Refactor** while keeping tests green
4. **Add more tests** for edge cases and configurations

#### Development Testing Loop

```bash
# Start test watcher during development
npm run test:watch

# Run specific test file
npm test src/lenses/my-lens/lens.spec.ts

# Run tests with coverage
npm run test:coverage

# View test results in UI
npm run test:ui

# Manual browser testing
npm run test:browser
```

#### Pre-Commit Testing Checklist

Before submitting PRs or committing major changes:

- ✅ **Unit tests pass** - All automated tests green
- ✅ **Coverage threshold met** - 80%+ coverage maintained
- ✅ **Manual HTML tests verified** - All interactive scenarios work
- ✅ **Integration tests pass** - Pipeline works
- ✅ **Error handling tested** - Edge cases handled gracefully
- ✅ **TypeScript compilation** - No type errors
- ✅ **Lint checks pass** - Code style consistent

#### Testing Best Practices

**Unit Test Guidelines:**

- **One concern per test** - Each test should verify one behavior
- **Descriptive test names** - Clearly state what is being tested
- **Arrange-Act-Assert** - Structure tests clearly
- **Test edge cases** - Empty inputs, invalid configs, error conditions
- **Mock external dependencies** - Keep tests isolated and fast

**HTML Test Guidelines:**

- **Visual verification** - Test what users actually see
- **Multiple scenarios** - Cover common and edge use cases
- **Manual checklists** - Systematic verification process
- **Integration scenarios** - Test component interactions
- **Cross-browser testing** - Verify compatibility

**Configuration Testing:**

- **Factory function behavior** - Independent objects, deep merge
- **Default values** - Ensure sensible defaults
- **Override scenarios** - Test partial and complete overrides
- **Type safety** - Verify TypeScript inference works

### Advanced Testing Scenarios

#### Testing Async Lenses

```typescript
// src/lenses/async-lens/lens.spec.ts
import { describe, it, expect, vi } from '@jest/globals';
import { lens } from './lens.js';

describe('asyncLens', () => {
	it('should handle async operations', async () => {
		// Mock fetch for testing
		global.fetch = vi.fn().mockResolvedValue({
			text: () => Promise.resolve('processed code'),
		});

		const snippet = { code: 'original code', lang: 'js', test: false };
		const result = await lens(snippet, {});

		expect(result.snippet.code).toBe('processed code');
		expect(fetch).toHaveBeenCalledWith('/api/process', expect.any(Object));
	});

	it('should handle fetch errors gracefully', async () => {
		global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

		const snippet = { code: 'original code', lang: 'js', test: false };

		await expect(lens(snippet, {})).rejects.toThrow('Network error');
	});
});
```

#### Testing JSX Components

```typescript
// src/lenses/jsx-demo/lens.spec.ts
import { describe, it, expect } from '@jest/globals';
import { lens } from './lens.js';
import { render } from 'preact';

describe('jsxDemo lens', () => {
	it('should return JSX component as view', async () => {
		const snippet = { code: 'function test() {}', lang: 'js', test: false };
		const result = await lens(snippet, {});

		expect(result.view).toBeDefined();
		expect(result.view).not.toBeInstanceOf(HTMLElement);

		// Test that JSX can be rendered
		const container = document.createElement('div');
		render(result.view, container);

		expect(container.innerHTML).toContain('Code Analysis');
		expect(container.querySelector('h3')).toBeTruthy();
	});

	it('should analyze code correctly', async () => {
		const snippet = {
			code: 'function add(a, b) {\n  return a + b;\n}',
			lang: 'js',
			test: false,
		};
		const result = await lens(snippet, {});

		const container = document.createElement('div');
		render(result.view, container);

		// Check that analysis is displayed
		expect(container.textContent).toContain('Lines');
		expect(container.textContent).toContain('Functions');
	});
});
```

This comprehensive testing approach ensures lens quality, maintainability, and user confidence while supporting rapid development and continuous integration workflows.

## ⚙️ Configuration Best Practices

### Configuration Patterns

**Simple Configuration:**

```typescript
export const config = {
	enabled: true,
	timeout: 5000,
};
```

**Complex Configuration:**

```typescript
export const config = {
	display: {
		theme: 'light',
		showLineNumbers: true,
		fontSize: 14,
	},
	processing: {
		maxLines: 1000,
		stripComments: false,
		preserveFormatting: true,
	},
	analysis: {
		metrics: ['complexity', 'maintainability'],
		thresholds: {
			complexity: 10,
			maintainability: 70,
		},
	},
};
```

### Configuration Usage in Lenses

```typescript
export const lens = async (
	snippet: Snippet,
	config: LensConfig = _config()
): Promise<LensOutput> => {
	// Config comes from factory function - already safe to use directly
	if (!config.enabled) {
		return { snippet, view: null };
	}

	// Use configuration values directly
	const result = processCode(snippet.code, {
		theme: config.display?.theme ?? 'light',
		maxLines: config.processing?.maxLines ?? 1000,
		enabled: config.enabled,
	});

	return { snippet: { ...snippet, code: result }, view: null };
};
```

**Configuration Access Pattern:**

- Config is passed to lens function from factory: `myLens.config({ customSettings })`
- No need to spread or modify - factory returns fresh objects
- Use optional chaining for nested config: `config.display?.theme`

### Configuration Mutation Safety

```typescript
// ✅ Safe - each call gets independent copy with overrides
const lens1 = sl.lenses.myLens;
const lens2 = sl.lenses.myLens;

const config1 = lens1.config({ theme: 'dark' });
const config2 = lens2.config({ theme: 'light' });

// Each config object is completely independent
console.log(config1.theme); // 'dark'
console.log(config2.theme); // 'light'

// Default configuration unchanged
const defaultConfig = lens1.config();
console.log(defaultConfig.theme); // original default value
```

## 📋 Development Guidelines

### Code Quality

1. **Pure Functions**: Keep business logic in pure functions
2. **Error Handling**: Use descriptive error messages
3. **TypeScript**: Proper typing with interfaces from `types.ts`
4. **Performance**: Avoid heavy computations in components

### Naming Conventions

- **Lens Name** (in `name.ts`): `'my-lens'` (kebab-case, matches directory)
- **Function**: `lens` (generic name, consistent across all lenses)
- **Component**: `view` (generic name)
- **Config**: `config` (matches file name)
- **Element Tag**: `sl-lens-my-lens` (kebab-case with sl-lens- prefix)
- **Directory**: `my-lens/` (kebab-case, matches lens name)

**Lens Name Best Practices:**

- Use kebab-case for consistency with web component naming
- Match the directory name exactly for clarity
- Avoid special characters except hyphens
- Keep names descriptive but concise
- Examples: `'reverse'`, `'uppercase'`, `'jsx-demo'`, `'trace-table'`

### Configuration Best Practices

```typescript
// ✅ Good configuration
export const config = {
	display: {
		theme: 'light',
		showNumbers: true,
	},
	processing: {
		timeout: 5000,
		retries: 3,
	},
};

// ❌ Avoid complex nested objects
export const badConfig = {
	very: { deeply: { nested: { config: true } } },
};
```

### Error Handling

```typescript
export const lens = async (
	snippet: Snippet,
	config: LensConfig = _config()
): Promise<LensOutput> => {
	try {
		const result = processCode(snippet.code, config);
		return { snippet: { ...snippet, code: result }, view: null };
	} catch (error) {
		throw new Error(
			`MyLens failed: ${error instanceof Error ? error.message : String(error)}`
		);
	}
};
```

## 🔄 Pipeline Behavior

### Terminus Conditions

Pipelines stop when:

1. **View Returned**: `{ snippet, view: HTMLElement }` - Visual output
2. **Side Effect**: `{ snippet: null, view: null }` - Action completed
3. **Error**: Exception thrown - Pipeline fails

### Pipeline-Friendly Design

```typescript
// ✅ Transform lens - continues pipeline
return { snippet: modifiedSnippet, view: null };

// ✅ Visual lens - terminates pipeline
return { snippet, view: visualElement };

// ✅ Side effect - terminates pipeline
await saveToFile(snippet.code);
return { snippet: null, view: null };
```

## 🛠️ Development Workflow

1. **Fork & Clone**: Standard GitHub workflow
2. **Create Branch**: Feature branches for new lenses
3. **Develop Lens**: Follow the structure above
4. **Test Thoroughly**: Function, component, and pipeline tests
5. **Update Documentation**: Add examples and descriptions
6. **Submit PR**: Include tests and documentation

## 🎯 Advanced Lens Examples

### Interactive Lens with Events

```typescript
export const interactive = async (
	snippet: Snippet,
	config: LensConfig = _config()
): Promise<LensOutput> => {
	const container = document.createElement('div');
	const button = document.createElement('button');
	const output = document.createElement('pre');

	button.textContent = 'Process Code';
	button.onclick = () => {
		output.textContent = processCode(snippet.code);
	};

	container.appendChild(button);
	container.appendChild(output);

	return { snippet, view: container };
};
```

### Async Processing Lens

```typescript
export const asyncLens = async (
	snippet: Snippet,
	config: LensConfig = _config()
): Promise<LensOutput> => {
	const processed = await fetch('/api/process', {
		method: 'POST',
		body: JSON.stringify({ code: snippet.code, config }),
	}).then((r) => r.text());

	return {
		snippet: { ...snippet, code: processed },
		view: null,
	};
};
```

## 🤝 Contribution Process

1. **Discuss**: Open an issue for new lens ideas
2. **Implement**: Follow the guidelines above
3. **Test**: Ensure all import patterns work
4. **Document**: Update README and examples
5. **Review**: Submit PR with clear description

## 📚 Resources

- **Main README**: Package overview and usage
- **Type Definitions**: `types.ts` - All interfaces
- **Example Lenses**: `lenses/reverse/`, `lenses/uppercase/`
- **Test Files**: `test/` directory for testing patterns
- **[README.md](./README.md)**: Consumer usage patterns and API reference
- **[CLAUDE.md](./CLAUDE.md)**: Technical architecture and implementation deep-dive

---

**Questions?** Open an issue or start a discussion. We're here to help you build amazing lenses! 🔍✨

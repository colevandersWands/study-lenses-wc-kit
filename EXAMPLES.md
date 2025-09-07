# Study Lenses Examples

> Practical usage examples for the Study Lenses WC-Kit

This document provides comprehensive examples showcasing the core API and common usage patterns. For installation and basic API reference, see [README.md](./README.md). For lens development tutorials, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## Table of Contents

- [Core API Examples](#core-api-examples)
- [Web Component Usage](#web-component-usage)
- [Custom Lens Development](#custom-lens-development)
- [Configuration Patterns](#configuration-patterns)
- [Interactive JSX Components](#interactive-jsx-components)
- [Real-World Use Cases](#real-world-use-cases)

## Core API Examples

The `sl.core` namespace provides essential functions for building code study environments.

### Basic Pipeline Processing

```typescript
import sl from 'study-lenses-wc-kit';

// Core function: sl.core.pipeLenses
const { pipeLenses } = sl.core;

// Create a snippet
const snippet = {
	code: 'function greet(name) { return "Hello, " + name; }',
	lang: 'js',
	test: false,
};

// Simple transformation chain
const result = await pipeLenses(snippet, [
	sl.lenses.reverse.lens,
	sl.lenses.uppercase.lens,
]);

console.log(result.snippet.code);
// "} EMAN + " ,OLLEH" + NRUTER { )EMAN(TEERG NOITCNUF"
```

### Mixed Pipeline with Custom Functions

```typescript
import sl from 'study-lenses-wc-kit';

// Custom lens function
const addComment = async (snippet, config = {}) => ({
	snippet: {
		...snippet,
		code: `// ${config.comment || 'Processed'}\n${snippet.code}`,
	},
	view: null,
});

// Mixed pipeline: custom + library lenses
const result = await sl.core.pipeLenses(snippet, [
	// Pattern 1: Custom function with config
	[addComment, { comment: 'Code analysis begins' }],

	// Pattern 2: Library lens
	sl.lenses.reverse,

	// Pattern 3: Library lens with config override
	[sl.lenses.uppercase, { preserveSpaces: true }],
]);

console.log(result.snippet.code);
// Shows commented, reversed, and uppercased code
```

### Terminus Conditions

```typescript
import sl from 'study-lenses-wc-kit';

// Visual lens that terminates pipeline
const codeAnalysis = async (snippet) => {
	const div = document.createElement('div');
	div.innerHTML = `
    <h3>Code Analysis</h3>
    <pre>${snippet.code}</pre>
    <p>Lines: ${snippet.code.split('\n').length}</p>
  `;

	return {
		snippet, // Pass through unchanged
		view: div, // Terminates pipeline with visual output
	};
};

// Pipeline stops at first visual output
const result = await sl.core.pipeLenses(snippet, [
	sl.lenses.reverse.lens,
	codeAnalysis, // <-- Pipeline terminates here
	sl.lenses.uppercase.lens, // Never reached
]);

console.log(result.view.innerHTML); // Shows analysis HTML
```

### File Loading with Core API

```typescript
import sl from 'study-lenses-wc-kit';

// Load snippet from file
const snippet = await sl.snippet.parse('./examples/demo.js');

// Process with core pipeline
const result = await sl.core.pipeLenses(snippet, [
	sl.lenses.uppercase,
	sl.lenses.reverse,
]);

console.log(result.snippet);
// { code: "transformed content", lang: "js", test: false }
```

## Web Component Usage

Study Lenses provides declarative web components for HTML usage.

### Basic Component Usage

```html
<!DOCTYPE html>
<html>
	<head>
		<title>Study Lenses Example</title>
	</head>
	<body>
		<!-- Single lens transformation -->
		<sl-lens-reverse code="console.log('Hello, World!');"></sl-lens-reverse>

		<!-- File loading -->
		<sl-lens-uppercase src="./examples/greet.js"></sl-lens-uppercase>

		<!-- Configuration via attributes -->
		<sl-lens-jsx-demo
			code="function add(a, b) { return a + b; }"
			theme="dark"
		>
		</sl-lens-jsx-demo>

		<!-- Register all components -->
		<script type="module">
			import 'study-lenses-wc-kit/register';
		</script>
	</body>
</html>
```

### Pipeline Mode (Sequential Processing)

```html
<!-- Sequential lens processing in sl-snippet -->
<sl-snippet lenses="reverse uppercase" code="hello world"></sl-snippet>

<!-- With file loading -->
<sl-snippet lenses="uppercase, reverse" src="./demo.js"></sl-snippet>

<!-- Complex pipeline -->
<sl-snippet
	lenses="reverse uppercase jsx-demo"
	code="function test() { return 42; }"
>
</sl-snippet>
```

### Study Panel Mode (Parallel Distribution)

```html
<!-- Parallel processing - same code to multiple lenses -->
<study-lenses
	code="function fibonacci(n) { return n < 2 ? n : fibonacci(n-1) + fibonacci(n-2); }"
>
	<sl-lens-reverse></sl-lens-reverse>
	<sl-lens-uppercase></sl-lens-uppercase>
	<sl-lens-jsx-demo></sl-lens-jsx-demo>
</study-lenses>
```

### Code Discovery Hierarchy

```html
<!-- Example showing 5-level code discovery precedence -->

<!-- 1. Own code attribute (highest priority) -->
<sl-lens-reverse code="console.log('direct')"></sl-lens-reverse>

<!-- 2. Own src attribute (fallback) -->
<sl-lens-uppercase src="./examples/demo.js"></sl-lens-uppercase>

<!-- 3. textContent -->
<sl-lens-lowercase>
	function greet() { console.log("from text"); }
</sl-lens-lowercase>

<!-- 4. Child snippet -->
<sl-lens-reverse>
	<sl-snippet code="console.log('from child')"></sl-snippet>
</sl-lens-reverse>

<!-- 5. Parent or sibling context -->
<study-lenses code="console.log('shared context')">
	<sl-lens-uppercase></sl-lens-uppercase>
	<!-- Uses shared context -->
	<sl-lens-lowercase></sl-lens-lowercase>
	<!-- Uses shared context -->
</study-lenses>
```

## Custom Lens Development

Examples of creating custom lenses for different use cases.

### Simple Transform Lens

```typescript
// custom-lenses/add-semicolons.ts
import type {
	Snippet,
	LensOutput,
	LensConfig,
} from 'study-lenses-wc-kit/types';

// Configuration with defaults
const defaultConfig = {
	force: false, // Add semicolons even if already present
	skipStrings: true, // Don't add semicolons inside string literals
};

export const addSemicolons = async (
	snippet: Snippet,
	config: LensConfig = defaultConfig
): Promise<LensOutput> => {
	const lines = snippet.code.split('\n');

	const processedLines = lines.map((line) => {
		const trimmed = line.trim();

		// Skip empty lines and comments
		if (!trimmed || trimmed.startsWith('//')) {
			return line;
		}

		// Skip if already has semicolon (unless force is true)
		if (trimmed.endsWith(';') && !config.force) {
			return line;
		}

		// Add semicolon to statements
		if (trimmed.match(/^(let|const|var|return|throw|break|continue)\s/)) {
			return line + (trimmed.endsWith(';') ? '' : ';');
		}

		return line;
	});

	return {
		snippet: {
			...snippet,
			code: processedLines.join('\n'),
		},
		view: null, // Transform lens - continues pipeline
	};
};

// Usage
const result = await sl.core.pipeLenses(snippet, [
	[addSemicolons, { force: true, skipStrings: true }],
	sl.lenses.uppercase,
]);
```

### Interactive Visual Lens

```typescript
// custom-lenses/code-metrics.ts
import type {
	Snippet,
	LensOutput,
	LensConfig,
} from 'study-lenses-wc-kit/types';

const defaultConfig = {
	showComplexity: true,
	showMetrics: ['lines', 'functions', 'classes'],
	theme: 'light',
};

export const codeMetrics = async (
	snippet: Snippet,
	config: LensConfig = defaultConfig
): Promise<LensOutput> => {
	// Analyze code
	const analysis = analyzeCode(snippet.code);

	// Create interactive UI
	const container = document.createElement('div');
	container.className = `metrics-container theme-${config.theme}`;

	// Metrics grid
	const metricsGrid = document.createElement('div');
	metricsGrid.className = 'metrics-grid';

	if (config.showMetrics.includes('lines')) {
		metricsGrid.appendChild(createMetricCard('Lines', analysis.lines));
	}

	if (config.showMetrics.includes('functions')) {
		metricsGrid.appendChild(
			createMetricCard('Functions', analysis.functions)
		);
	}

	if (config.showMetrics.includes('classes')) {
		metricsGrid.appendChild(createMetricCard('Classes', analysis.classes));
	}

	// Complexity chart (if enabled)
	if (config.showComplexity) {
		const complexityChart = createComplexityVisualization(
			analysis.complexity
		);
		container.appendChild(complexityChart);
	}

	container.appendChild(metricsGrid);

	// Add interactive features
	addInteractiveFeatures(container, snippet, analysis);

	return {
		snippet, // Pass through unchanged
		view: container, // Terminates pipeline with visual output
	};
};

// Helper functions
function analyzeCode(code: string) {
	return {
		lines: code.split('\n').length,
		functions: (code.match(/function\s+\w+/g) || []).length,
		classes: (code.match(/class\s+\w+/g) || []).length,
		complexity: calculateCyclomaticComplexity(code),
	};
}

function createMetricCard(label: string, value: number): HTMLElement {
	const card = document.createElement('div');
	card.className = 'metric-card';
	card.innerHTML = `
    <div class="metric-value">${value}</div>
    <div class="metric-label">${label}</div>
  `;
	return card;
}

function createComplexityVisualization(complexity: number): HTMLElement {
	const chart = document.createElement('div');
	chart.className = 'complexity-chart';

	// Simple bar chart
	const bar = document.createElement('div');
	bar.className = 'complexity-bar';
	bar.style.width = `${Math.min(complexity * 10, 100)}%`;
	bar.style.backgroundColor =
		complexity > 10 ? '#dc3545' : complexity > 5 ? '#ffc107' : '#28a745';

	chart.appendChild(bar);
	return chart;
}

function addInteractiveFeatures(
	container: HTMLElement,
	snippet: Snippet,
	analysis: any
) {
	// Add click handlers for detailed views
	const detailButton = document.createElement('button');
	detailButton.textContent = 'Show Details';
	detailButton.onclick = () => showDetailedAnalysis(analysis);

	container.appendChild(detailButton);
}

// Usage in pipeline
const result = await sl.core.pipeLenses(snippet, [
	sl.lenses.uppercase, // Transform first
	[codeMetrics, { theme: 'dark', showComplexity: true }], // Then visualize
]);

// result.view contains the interactive metrics dashboard
```

### JSX Interactive Component

```tsx
// custom-lenses/interactive-editor.tsx
import type {
	Snippet,
	LensOutput,
	LensConfig,
} from 'study-lenses-wc-kit/types';
import { useState } from 'preact/hooks';

const defaultConfig = {
	readOnly: false,
	theme: 'light',
	showLineNumbers: true,
};

export const interactiveEditor = async (
	snippet: Snippet,
	config: LensConfig = defaultConfig
): Promise<LensOutput> => {
	// JSX Component with state
	const EditorComponent = () => {
		const [code, setCode] = useState(snippet.code);
		const [isEditing, setIsEditing] = useState(!config.readOnly);

		const handleRun = () => {
			try {
				// Safe code execution (implement your own runner)
				const result = executeJavaScript(code);
				console.log('Execution result:', result);
			} catch (error) {
				console.error('Execution failed:', error);
			}
		};

		return (
			<div
				style={{
					border: '2px solid #ddd',
					borderRadius: '8px',
					padding: '16px',
					backgroundColor:
						config.theme === 'dark' ? '#2d3748' : '#ffffff',
					color: config.theme === 'dark' ? '#e2e8f0' : '#2d3748',
					fontFamily: 'Monaco, Consolas, monospace',
				}}
			>
				<div
					style={{
						marginBottom: '12px',
						display: 'flex',
						gap: '8px',
					}}
				>
					<button
						onClick={() => setIsEditing(!isEditing)}
						style={{
							padding: '4px 8px',
							backgroundColor: isEditing ? '#dc3545' : '#28a745',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
						}}
					>
						{isEditing ? '📝 Stop Editing' : '✏️ Edit Code'}
					</button>

					<button
						onClick={handleRun}
						style={{
							padding: '4px 8px',
							backgroundColor: '#007bff',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
						}}
					>
						▶️ Run
					</button>
				</div>

				{isEditing ? (
					<textarea
						value={code}
						onChange={(e) => setCode(e.target.value)}
						style={{
							width: '100%',
							minHeight: '200px',
							fontFamily: 'inherit',
							fontSize: '14px',
							border: '1px solid #ccc',
							borderRadius: '4px',
							padding: '8px',
							backgroundColor:
								config.theme === 'dark' ? '#1a202c' : '#f8f9fa',
							color: 'inherit',
						}}
					/>
				) : (
					<pre
						style={{
							backgroundColor:
								config.theme === 'dark' ? '#1a202c' : '#f8f9fa',
							padding: '12px',
							borderRadius: '4px',
							overflow: 'auto',
							margin: 0,
						}}
					>
						{config.showLineNumbers && (
							<code
								style={{
									color: '#6c757d',
									marginRight: '12px',
								}}
							>
								{code
									.split('\n')
									.map((_, i) => `${i + 1}`)
									.join('\n')}
							</code>
						)}
						<code>{code}</code>
					</pre>
				)}

				<div
					style={{
						marginTop: '8px',
						fontSize: '12px',
						color: '#6c757d',
					}}
				>
					Language: {snippet.lang} | Lines: {code.split('\n').length}
				</div>
			</div>
		);
	};

	return {
		snippet: { ...snippet, code }, // May have been modified in editor
		view: <EditorComponent />, // JSX component terminates pipeline
	};
};

// Usage
const result = await sl.core.pipeLenses(snippet, [
	[interactiveEditor, { theme: 'dark', readOnly: false }],
]);

// result.view contains interactive JSX editor component
```

## Configuration Patterns

Examples of flexible configuration management.

### Deep Configuration Merging

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

### Configuration Factory Pattern

```typescript
// custom-config-factory.ts
import sl from 'study-lenses-wc-kit';

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

```typescript
// config/environments.ts
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

## Interactive JSX Components

Advanced examples of interactive JSX-based lenses.

### Code Playground with Live Execution

```tsx
// interactive-playground.tsx
import { useState, useEffect } from 'preact/hooks';
import type { Snippet, LensOutput } from 'study-lenses-wc-kit/types';

export const codePlayground = async (
	snippet: Snippet,
	config = {}
): Promise<LensOutput> => {
	const PlaygroundComponent = () => {
		const [code, setCode] = useState(snippet.code);
		const [output, setOutput] = useState('');
		const [isRunning, setIsRunning] = useState(false);
		const [error, setError] = useState(null);

		const executeCode = async () => {
			setIsRunning(true);
			setError(null);

			try {
				// Capture console output
				let consoleOutput = '';
				const originalLog = console.log;
				console.log = (...args) => {
					consoleOutput += args.join(' ') + '\n';
					originalLog(...args);
				};

				// Execute code in safe context
				const func = new Function('return ' + code);
				const result = func();

				// Restore console
				console.log = originalLog;

				setOutput(
					consoleOutput + (result !== undefined ? String(result) : '')
				);
			} catch (err) {
				setError(err.message);
			} finally {
				setIsRunning(false);
			}
		};

		// Auto-run on code changes (debounced)
		useEffect(() => {
			const timer = setTimeout(() => {
				if (code.trim()) executeCode();
			}, 1000);

			return () => clearTimeout(timer);
		}, [code]);

		return (
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '1fr 1fr',
					gap: '16px',
					padding: '16px',
					border: '2px solid #e2e8f0',
					borderRadius: '8px',
					backgroundColor: '#f8f9fa',
					fontFamily: 'Monaco, Consolas, monospace',
					minHeight: '400px',
				}}
			>
				{/* Code Editor */}
				<div>
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							marginBottom: '8px',
						}}
					>
						<h3 style={{ margin: 0, fontSize: '16px' }}>📝 Code</h3>
						<button
							onClick={executeCode}
							disabled={isRunning}
							style={{
								padding: '4px 8px',
								backgroundColor: isRunning
									? '#6c757d'
									: '#28a745',
								color: 'white',
								border: 'none',
								borderRadius: '4px',
								cursor: isRunning ? 'wait' : 'pointer',
							}}
						>
							{isRunning ? '⏳ Running...' : '▶️ Run'}
						</button>
					</div>

					<textarea
						value={code}
						onChange={(e) => setCode(e.target.value)}
						style={{
							width: '100%',
							height: '300px',
							fontFamily: 'inherit',
							fontSize: '14px',
							border: '1px solid #ccc',
							borderRadius: '4px',
							padding: '8px',
							backgroundColor: 'white',
							resize: 'vertical',
						}}
						placeholder="Enter your JavaScript code here..."
					/>
				</div>

				{/* Output Panel */}
				<div>
					<h3
						style={{
							margin: 0,
							marginBottom: '8px',
							fontSize: '16px',
						}}
					>
						📊 Output
					</h3>

					<div
						style={{
							height: '300px',
							border: '1px solid #ccc',
							borderRadius: '4px',
							padding: '8px',
							backgroundColor: error ? '#fff5f5' : 'white',
							overflow: 'auto',
							fontFamily: 'inherit',
						}}
					>
						{error ? (
							<div style={{ color: '#dc3545' }}>
								<strong>Error:</strong> {error}
							</div>
						) : (
							<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
								{output || 'Run code to see output...'}
							</pre>
						)}
					</div>

					<div
						style={{
							marginTop: '8px',
							fontSize: '12px',
							color: '#6c757d',
							display: 'flex',
							justifyContent: 'space-between',
						}}
					>
						<span>Auto-run: 1s delay</span>
						<span>Lang: {snippet.lang}</span>
					</div>
				</div>
			</div>
		);
	};

	return {
		snippet, // Pass through unchanged
		view: <PlaygroundComponent />,
	};
};
```

### Code Comparison Tool

```tsx
// code-comparison.tsx
import { useState } from 'preact/hooks';
import type { Snippet, LensOutput } from 'study-lenses-wc-kit/types';

export const codeComparison = async (
	snippet: Snippet,
	config = { compareWith: '' }
): Promise<LensOutput> => {
	const ComparisonComponent = () => {
		const [leftCode, setLeftCode] = useState(snippet.code);
		const [rightCode, setRightCode] = useState(config.compareWith || '');
		const [differences, setDifferences] = useState([]);

		const highlightDifferences = () => {
			// Simple diff algorithm (implement a more sophisticated one)
			const leftLines = leftCode.split('\n');
			const rightLines = rightCode.split('\n');
			const maxLines = Math.max(leftLines.length, rightLines.length);

			const diffs = [];
			for (let i = 0; i < maxLines; i++) {
				const left = leftLines[i] || '';
				const right = rightLines[i] || '';

				if (left !== right) {
					diffs.push({
						line: i + 1,
						left: left,
						right: right,
						type: !left ? 'added' : !right ? 'removed' : 'modified',
					});
				}
			}

			setDifferences(diffs);
		};

		useState(() => {
			if (rightCode) highlightDifferences();
		}, [leftCode, rightCode]);

		return (
			<div
				style={{
					border: '2px solid #e2e8f0',
					borderRadius: '8px',
					padding: '16px',
					backgroundColor: '#f8f9fa',
				}}
			>
				<h3 style={{ margin: '0 0 16px 0' }}>🔍 Code Comparison</h3>

				<div
					style={{
						display: 'grid',
						gridTemplateColumns: '1fr 1fr',
						gap: '16px',
						marginBottom: '16px',
					}}
				>
					{/* Left Panel */}
					<div>
						<label
							style={{
								display: 'block',
								marginBottom: '4px',
								fontWeight: 'bold',
							}}
						>
							Original Code
						</label>
						<textarea
							value={leftCode}
							onChange={(e) => setLeftCode(e.target.value)}
							style={{
								width: '100%',
								height: '200px',
								fontFamily: 'Monaco, Consolas, monospace',
								fontSize: '12px',
								border: '1px solid #ccc',
								borderRadius: '4px',
								padding: '8px',
							}}
						/>
					</div>

					{/* Right Panel */}
					<div>
						<label
							style={{
								display: 'block',
								marginBottom: '4px',
								fontWeight: 'bold',
							}}
						>
							Compare With
						</label>
						<textarea
							value={rightCode}
							onChange={(e) => setRightCode(e.target.value)}
							style={{
								width: '100%',
								height: '200px',
								fontFamily: 'Monaco, Consolas, monospace',
								fontSize: '12px',
								border: '1px solid #ccc',
								borderRadius: '4px',
								padding: '8px',
							}}
							placeholder="Paste code to compare..."
						/>
					</div>
				</div>

				<button
					onClick={highlightDifferences}
					style={{
						padding: '8px 16px',
						backgroundColor: '#007bff',
						color: 'white',
						border: 'none',
						borderRadius: '4px',
						cursor: 'pointer',
						marginBottom: '16px',
					}}
				>
					🔄 Compare
				</button>

				{/* Differences Display */}
				{differences.length > 0 && (
					<div>
						<h4 style={{ margin: '0 0 8px 0' }}>
							Differences ({differences.length} changes)
						</h4>

						<div
							style={{
								border: '1px solid #ccc',
								borderRadius: '4px',
								maxHeight: '300px',
								overflow: 'auto',
								backgroundColor: 'white',
							}}
						>
							{differences.map((diff, index) => (
								<div
									key={index}
									style={{
										padding: '8px',
										borderBottom:
											index < differences.length - 1
												? '1px solid #eee'
												: 'none',
										backgroundColor:
											diff.type === 'added'
												? '#d4edda'
												: diff.type === 'removed'
													? '#f8d7da'
													: '#fff3cd',
									}}
								>
									<div
										style={{
											fontSize: '12px',
											fontWeight: 'bold',
											marginBottom: '4px',
										}}
									>
										Line {diff.line} ({diff.type})
									</div>

									<div
										style={{
											display: 'grid',
											gridTemplateColumns: '1fr 1fr',
											gap: '8px',
										}}
									>
										<div>
											<div
												style={{
													fontSize: '10px',
													color: '#6c757d',
												}}
											>
												Original:
											</div>
											<code
												style={{
													display: 'block',
													fontSize: '11px',
													backgroundColor: '#f8f9fa',
													padding: '2px 4px',
													borderRadius: '2px',
												}}
											>
												{diff.left || '(empty)'}
											</code>
										</div>

										<div>
											<div
												style={{
													fontSize: '10px',
													color: '#6c757d',
												}}
											>
												Compare:
											</div>
											<code
												style={{
													display: 'block',
													fontSize: '11px',
													backgroundColor: '#f8f9fa',
													padding: '2px 4px',
													borderRadius: '2px',
												}}
											>
												{diff.right || '(empty)'}
											</code>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{differences.length === 0 && rightCode && (
					<div
						style={{
							padding: '16px',
							backgroundColor: '#d4edda',
							borderRadius: '4px',
							color: '#155724',
						}}
					>
						✅ No differences found - codes are identical!
					</div>
				)}
			</div>
		);
	};

	return {
		snippet, // Pass through unchanged
		view: <ComparisonComponent />,
	};
};
```

## Real-World Use Cases

Practical examples for common educational and development scenarios.

### Learning Platform Integration

```typescript
// learning-platform-example.ts
import sl from 'study-lenses-wc-kit';

// Educational code analysis pipeline
const createLearningPipeline = (
	difficulty: 'beginner' | 'intermediate' | 'advanced'
) => {
	const baseLenses = [
		// Always start with code metrics
		[
			sl.lenses.codeMetrics,
			{
				showComplexity: difficulty !== 'beginner',
				detailed: difficulty === 'advanced',
			},
		],
	];

	if (difficulty === 'beginner') {
		// Simple visual analysis for beginners
		baseLenses.push(sl.lenses.jsxDemo);
	} else if (difficulty === 'intermediate') {
		// Interactive playground for experimentation
		baseLenses.push([codePlayground, { autoRun: true }]);
	} else {
		// Advanced comparison and analysis
		baseLenses.push(
			[codeComparison, { enableAdvancedMetrics: true }],
			[interactiveEditor, { showAST: true }]
		);
	}

	return baseLenses;
};

// Usage in learning platform
const analyzeStudentCode = async (code: string, studentLevel: string) => {
	const snippet = { code, lang: 'js', test: false };
	const pipeline = createLearningPipeline(studentLevel as any);

	const result = await sl.core.pipeLenses(snippet, pipeline);

	return {
		transformedCode: result.snippet?.code,
		visualAnalysis: result.view,
		educational: true,
	};
};
```

### Code Review Automation

```typescript
// code-review-automation.ts
import sl from 'study-lenses-wc-kit';

// Automated code review pipeline
const createReviewPipeline = (
	reviewType: 'security' | 'quality' | 'performance'
) => {
	const pipeline = [];

	// Base analysis
	pipeline.push([codeMetrics, { includeQualityScore: true }]);

	switch (reviewType) {
		case 'security':
			pipeline.push(
				[securityAnalysis, { strictMode: true }],
				[vulnerabilityScanner, { checkCommonIssues: true }]
			);
			break;

		case 'quality':
			pipeline.push(
				[codeQualityAnalysis, { includeRefactoringTips: true }],
				[bestPracticesChecker, { framework: 'react' }]
			);
			break;

		case 'performance':
			pipeline.push(
				[performanceAnalysis, { detectBottlenecks: true }],
				[optimizationSuggestions, { targetEnvironment: 'browser' }]
			);
			break;
	}

	return pipeline;
};

// Integration with CI/CD
const automatedCodeReview = async (
	pullRequestCode: string,
	reviewConfig: any
) => {
	const snippet = {
		code: pullRequestCode,
		lang: 'js',
		test: reviewConfig.isTestFile || false,
	};

	const pipeline = createReviewPipeline(reviewConfig.reviewType);
	const result = await sl.core.pipeLenses(snippet, pipeline);

	return {
		reviewComments: extractReviewComments(result.view),
		score: calculateCodeQuality(result.snippet),
		suggestions: extractSuggestions(result.view),
	};
};
```

### Documentation Generation

```typescript
// doc-generation-example.ts
import sl from 'study-lenses-wc-kit';

// Documentation generation pipeline
const documentationPipeline = [
	// Extract documentation from code
	[extractComments, { includeInline: true }],

	// Analyze function signatures
	[functionAnalysis, { includeTypes: true }],

	// Generate interactive examples
	[codePlayground, { showExamples: true }],

	// Create markdown documentation
	[markdownGenerator, { template: 'api-reference' }],
];

const generateDocumentation = async (sourceCode: string) => {
	const snippet = { code: sourceCode, lang: 'js', test: false };
	const result = await sl.core.pipeLenses(snippet, documentationPipeline);

	return {
		documentation: result.snippet?.code, // Generated markdown
		interactive: result.view, // Interactive examples
	};
};
```

### Development Tools Integration

```html
<!-- VS Code Extension Example -->
<div class="vscode-panel">
	<h3>Code Analysis</h3>

	<!-- Quick analysis -->
	<sl-lens-code-metrics
		code="{{currentSelection}}"
		show-complexity="true"
		theme="{{editorTheme}}"
	>
	</sl-lens-code-metrics>

	<!-- Interactive playground for testing -->
	<sl-lens-interactive-playground
		code="{{currentSelection}}"
		auto-run="{{preferences.autoRun}}"
		show-console="true"
	>
	</sl-lens-interactive-playground>
</div>

<script type="module">
	// VS Code extension integration
	import sl from 'study-lenses-wc-kit/register';

	// Listen for editor selection changes
	vscode.window.onDidChangeTextEditorSelection((event) => {
		const selectedText = event.textEditor.document.getText(
			event.selections[0]
		);

		// Update all lens components with new code
		document.querySelectorAll('[code]').forEach((element) => {
			element.setAttribute('code', selectedText);
		});
	});
</script>
```

## Performance Tips

### Optimizing Pipeline Performance

```typescript
// performance-optimized-pipeline.ts
import sl from 'study-lenses-wc-kit';

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

### Memory Management

```typescript
// memory-efficient-processing.ts
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

---

This examples document demonstrates the flexibility and power of Study Lenses for building educational code analysis tools, development utilities, and interactive learning environments. For more advanced use cases and technical details, see [CLAUDE.md](./CLAUDE.md).

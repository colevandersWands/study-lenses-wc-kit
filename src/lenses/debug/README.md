# Debug Lens

A Study Lens that automatically detects programming languages and wraps code with appropriate debugger statements for various development environments.

## Overview

The Debug Lens transforms source code by adding debugging breakpoints in language-specific formats, making it easy to step through code execution during development and learning.

## Supported Languages

- **JavaScript/TypeScript** (`js`, `mjs`, `ts`, `tsx`) - Uses `debugger;` statements
- **Python** (`python`, `py`) - Uses `import pdb; pdb.set_trace()` statements
- **Java** (`java`) - Uses `// Add breakpoint here` comments
- **C/C++** (`c`, `cpp`, `cxx`) - Uses `// Add breakpoint here` comments
- **Go** (`go`) - Uses `// Add breakpoint here` comments
- **Rust** (`rust`, `rs`) - Uses `// Add breakpoint here` comments
- **Ruby** (`ruby`, `rb`) - Uses `# Add breakpoint here` comments
- **Unknown languages** - Defaults to JavaScript-style `debugger;` statements

## Usage

### Basic Usage

```html
<!-- JavaScript code -->
<sl-lens-debug code="console.log('Hello, World!')"></sl-lens-debug>

<!-- Python code -->
<sl-lens-debug code="print('Hello, World!')" lang="python"></sl-lens-debug>

<!-- From file -->
<sl-lens-debug src="./examples/content/greet.js"></sl-lens-debug>
```

### Configuration Options

```html
<!-- Disable debugger injection -->
<sl-lens-debug
	code="console.log('no debugging');"
	config='{"enabled": false}'
></sl-lens-debug>

<!-- Custom line spacing -->
<sl-lens-debug
	code="function test() { return 42; }"
	config='{"lineSpacing": 1}'
></sl-lens-debug>

<!-- Custom prefix and suffix -->
<sl-lens-debug
	code="console.log('custom');"
	config='{
    "customPrefix": ">>> DEBUG START <<<", 
    "customSuffix": ">>> DEBUG END <<<"
  }'
></sl-lens-debug>
```

## Configuration

The debug lens supports the following configuration options:

| Option         | Type             | Default | Description                                         |
| -------------- | ---------------- | ------- | --------------------------------------------------- |
| `enabled`      | `boolean`        | `true`  | Enable/disable debugger injection                   |
| `customPrefix` | `string \| null` | `null`  | Custom prefix instead of language-specific debugger |
| `customSuffix` | `string \| null` | `null`  | Custom suffix instead of language-specific debugger |
| `lineSpacing`  | `number`         | `3`     | Number of blank lines before and after code         |

### Configuration Examples

```javascript
// Default configuration
const config = {
	enabled: true,
	customPrefix: null,
	customSuffix: null,
	lineSpacing: 3,
};

// Disabled debugger
const disabledConfig = {
	enabled: false,
};

// Custom debugging markers
const customConfig = {
	customPrefix: '=== DEBUG START ===',
	customSuffix: '=== DEBUG END ===',
	lineSpacing: 1,
};
```

## Output Examples

### JavaScript

**Input:**

```javascript
console.log('Hello, World!');
```

**Output:**

```javascript
/* ----------------------------- */
debugger;

console.log('Hello, World!');

/* ----------------------------- */
debugger;
```

### Python

**Input:**

```python
print('Hello, World!')
```

**Output:**

```python
# ----------------------------- #
import pdb; pdb.set_trace()



print('Hello, World!')



# ----------------------------- #
import pdb; pdb.set_trace()
```

### Java

**Input:**

```java
System.out.println("Hello, World!");
```

**Output:**

```java
/* ----------------------------- */
// Add breakpoint here



System.out.println("Hello, World!");



/* ----------------------------- */
// Add breakpoint here
```

## API Reference

### Lens Function

```typescript
function lens(snippet: Snippet, config?: DebugConfig): LensOutput;
```

**Parameters:**

- `snippet`: Code snippet with `code`, `lang`, and `test` properties
- `config`: Optional configuration object

**Returns:** `LensOutput` with modified snippet containing debugger statements

### Configuration Factory

```typescript
function config(overrides?: Partial<DebugConfig>): DebugConfig;
```

**Parameters:**

- `overrides`: Partial configuration to merge with defaults

**Returns:** Complete configuration object

### Web Component Registration

```typescript
function register(): string;
```

**Returns:** The registered web component tag name (`sl-lens-debug`)

## Language Detection

The lens automatically detects the programming language from the `snippet.lang` property and applies appropriate debugging statements:

- **Case-insensitive matching** - `PYTHON`, `python`, and `py` all work
- **Extension-based detection** - `.mjs` files are treated as JavaScript
- **Fallback behavior** - Unknown languages default to JavaScript-style `debugger;`

## Integration

### Programmatic Usage

```javascript
import debugger from './lenses/debugger/index.js';

// Transform code with debugger statements
const snippet = { code: 'console.log("test");', lang: 'js', test: false };
const result = debugger.lens(snippet);
console.log(result.snippet.code); // Code with debugger statements

// Custom configuration
const config = debugger.config({ lineSpacing: 1 });
const result2 = debugger.lens(snippet, config);
```

### Web Component Usage

```javascript
// Register the component
import '../path/to/debugger/register.js';

// Use in HTML
document.body.innerHTML = `
  <sl-lens-debug code="function test() { return 42; }"></sl-lens-debug>
`;
```

## Testing

The debug lens includes comprehensive test coverage:

- **Unit tests** (`lens.spec.ts`, `config.spec.ts`) - Automated testing of all functionality
- **Interactive tests** (`wc.test.html`) - Manual browser testing with live examples

Run tests with:

```bash
npm test
```

## Contributing

See the main [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines on extending the debug lens or creating new lenses.

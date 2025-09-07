# Trace Tables UI Component

Interactive trace tables for code analysis with draggable, resizable interface for tracking variable states, operations, and execution steps during code execution.

## Features

- **Three Table Types**: steps, values, operators - different interfaces for different debugging needs
- **Interactive Interface**: Draggable and resizable tables with close buttons
- **Shadow DOM**: Encapsulated styling that won't conflict with page styles
- **Flexible Configuration**: Works standalone or with code discovery from parent elements
- **Dynamic Management**: Add/remove rows and columns during debugging sessions

## Usage

### Basic Usage

```html
<!-- Default values table -->
<sl-ui-trace-tables></sl-ui-trace-tables>

<!-- Specific table type -->
<sl-ui-trace-tables type="steps"></sl-ui-trace-tables>
<sl-ui-trace-tables type="operators"></sl-ui-trace-tables>
<sl-ui-trace-tables type="values"></sl-ui-trace-tables>
```

### With Code Context

```html
<!-- Table gets code context from parent study-bar -->
<sl-ui-study-bar code="let x = 5; x = x + 1; console.log(x);">
	<sl-ui-run></sl-ui-run>
	<sl-ui-trace-tables type="steps"></sl-ui-trace-tables>
</sl-ui-study-bar>

<!-- Table with direct code attribute -->
<sl-ui-trace-tables
	code="function add(a, b) { return a + b; }"
	type="values"
></sl-ui-trace-tables>

<!-- Load from file -->
<sl-ui-trace-tables src="./algorithm.js" type="operators"></sl-ui-trace-tables>
```

### Legacy Attribute Support

```html
<!-- Backward compatibility with legacy attributes -->
<sl-ui-trace-tables steps></sl-ui-trace-tables>
<sl-ui-trace-tables values></sl-ui-trace-tables>
<sl-ui-trace-tables operators></sl-ui-trace-tables>
```

## Table Types

### Steps Table (`type="steps"`)

Tracks execution flow and step-by-step progression through code:

- **Line numbers** and **code statements**
- **Execution order** tracking
- **Control flow** visualization
- **Best for**: Understanding algorithm flow and debugging logic

### Values Table (`type="values"`)

Tracks variable values and state changes:

- **Variable names** and **current values**
- **Type information** and **change history**
- **Scope tracking** for nested functions
- **Best for**: Variable debugging and state inspection

### Operators Table (`type="operators"`)

Tracks operations and computational steps:

- **Operation types** (arithmetic, logical, comparison)
- **Operands** and **results**
- **Expression evaluation** tracking
- **Best for**: Mathematical debugging and expression analysis

## Interactive Features

### Dragging and Positioning

- **Drag to move**: Click and drag tables to reposition
- **Double-click**: Enable/disable dragging
- **Single-click**: Lock position
- **Auto-positioning**: Tables appear centered initially

### Table Management

- **Close button**: Remove table from interface
- **Resizable**: Drag corners/edges to resize
- **Row/Column controls**: Add or remove data as needed
- **Shadow DOM**: Isolated styling prevents conflicts

## API Reference

### Component Function

```typescript
component(snippet: Snippet | null = null, type?: TableTypeName): HTMLElement
```

**Parameters:**

- `snippet`: Code snippet with `code`, `lang`, and `test` properties (optional)
- `type`: Table type - 'steps' | 'values' | 'operators' (default: 'values')

**Returns:** HTMLElement with interactive trace table

### Registration

```typescript
register(): string
```

**Returns:** The registered web component tag name (`sl-ui-trace-tables`)

### Programmatic Usage

```javascript
import sl from 'study-lenses-wc-kit';

// Create trace table programmatically
const snippet = { code: 'let x = 42;', lang: 'js', test: false };
const table = sl.ui.traceTables.component(snippet, 'values');
document.body.appendChild(table);

// Register component for HTML usage
const tagName = sl.ui.traceTables.register(); // Returns 'sl-ui-trace-tables'
```

## Integration with Study Tools

### With Study Bar

```html
<sl-ui-study-bar code="complex algorithm code">
	<sl-ui-run></sl-ui-run>
	<sl-ui-trace-tables type="steps"></sl-ui-trace-tables>
	<sl-ui-trace-tables type="values"></sl-ui-trace-tables>
</sl-ui-study-bar>
```

### Multiple Tables

```html
<!-- Track different aspects of same code -->
<div
	code="function fibonacci(n) { return n < 2 ? n : fibonacci(n-1) + fibonacci(n-2); }"
>
	<sl-ui-trace-tables type="steps"></sl-ui-trace-tables>
	<sl-ui-trace-tables type="values"></sl-ui-trace-tables>
	<sl-ui-trace-tables type="operators"></sl-ui-trace-tables>
</div>
```

## Styling and Customization

The component uses Shadow DOM for style encapsulation. Tables include:

- **Responsive design** that adapts to content
- **Professional styling** with consistent theme
- **Interactive feedback** for dragging and resizing
- **Clear visual hierarchy** for debugging information

## Educational Use Cases

1. **Algorithm Visualization**: Step through sorting, searching, and graph algorithms
2. **Variable Tracking**: Monitor state changes in complex functions
3. **Expression Analysis**: Break down mathematical computations
4. **Debugging Training**: Teach systematic debugging approaches
5. **Code Review**: Visualize execution paths for review sessions

## Browser Compatibility

- **Modern browsers** with Shadow DOM support
- **Custom Elements v1** specification
- **ES2018+** JavaScript features
- **No external dependencies** beyond the Study Lenses framework

The trace tables component provides a powerful, flexible interface for code analysis and debugging education, integrating seamlessly with the Study Lenses ecosystem.

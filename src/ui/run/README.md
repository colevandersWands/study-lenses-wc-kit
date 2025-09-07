# Run UI Component

A pure function UI component that provides an execution button with configurable controls for running JavaScript code through the Study Lenses pipeline.

## Overview

The Run UI component renders execution controls (debug checkbox, loop guard controls) and executes code using the `pipeLenses` function. It provides no visual feedback - execution happens silently with output going to the console.

## Usage

### Basic Usage

```html
<sl-ui-run code="console.log('Hello World');"></sl-ui-run>
```

### Within Study Bar (Recommended)

```html
<sl-ui-study-bar code="console.log('Shared code context');">
  <sl-ui-run></sl-ui-run>
</sl-ui-study-bar>
```

### Multiple Run Components

```html
<sl-ui-study-bar code="console.log('Both buttons will run this code');">
  <sl-ui-run></sl-ui-run>
  <sl-ui-run></sl-ui-run>
</sl-ui-study-bar>
```

## Controls

- **▶️ Run Button** - Executes the code through the lens pipeline
- **Debug Checkbox** - Adds debugger statements before/after code execution  
- **Loop Guard Checkbox** - Enables loop protection with AST transformation
- **Loop Guard Max** - Number input for maximum loop iterations (disabled unless loop guard is active)

## Language Support

- **JavaScript (.js)** - Executed as script type
- **ES Modules (.mjs)** - Executed as module type  
- **Dynamic Test Detection** - Test mode determined from snippet.test property

## Pipeline Behavior

The component builds different lens pipelines based on control settings:

1. **Basic**: `[run]`
2. **Loop Guard Only**: `[loopGuard, run]` 
3. **Loop Guard + Format**: `[loopGuard, format, run]` (when loop guard is enabled, formatting is applied after)
4. **Debug Mode**: `[run]` with debug config

### Conditional Formatting

Formatting is only applied in the pipeline **after** loop guards if loop guard is enabled. Otherwise code runs as-is.

## Code Discovery

Follows the standard 5-level precedence hierarchy:

1. Own `code=""` attribute (including file paths)
2. Own `src=""` attribute  
3. textContent
4. Child `<sl-snippet>`
5. Parent/sibling snippet context (via study-bar event system)

## Technical Implementation

- **Pure Function**: `component(snippet | null) => HTMLElement`
- **No DOM Feedback**: Execution results only in console, no visual success/error states
- **Event-Driven**: Requests code from parent study-bar via custom events
- **Terminal Pipeline**: Run lens returns `{ snippet: undefined, ui: null }` to end processing

## API Reference

### Component Function

```typescript
function component(snippet: Snippet | null = null): HTMLElement
```

**Parameters:**
- `snippet` - Optional snippet object. If null, will request from parent study-bar

**Returns:**
- HTMLElement with run button and controls

### HTML Attributes

- `code=""` - JavaScript code to execute
- `src=""` - Path to JavaScript file 
- `lang=""` - Language (js/mjs, defaults to 'js')
- `test` - Boolean attribute indicating test code

## Examples

### Debug Mode
```html
<sl-ui-run code="const x = 42; console.log(x);"></sl-ui-run>
<!-- Check debug checkbox and run - adds debugger statements -->
```

### Loop Protection
```html
<sl-ui-run code="for(let i = 0; i < 1000; i++) { console.log(i); }"></sl-ui-run>
<!-- Enable loop guard with max 100 to protect against long loops -->
```

### ES Modules
```html
<sl-ui-run code="export const greeting = 'Hello'; console.log(greeting);" lang="mjs"></sl-ui-run>
<!-- Automatically detected as module type for execution -->
```

### Test Code
```html
<sl-ui-run code="console.assert(2 + 2 === 4, 'Math works');" test></sl-ui-run>
<!-- Test attribute automatically passed to execution config -->
```
# JSX Demo Lens

> Interactive visual lens showcasing JSX/Preact integration with code analysis dashboard

The JSX Demo lens demonstrates the power of JSX/Preact components in Study Lenses by creating an interactive dashboard that analyzes code and displays statistics in a visually appealing format.

## Features

- **Visual output**: Terminates pipeline with interactive JSX component
- **Code analysis**: Displays lines, words, and character counts
- **Interactive UI**: Expandable code preview with formatted display
- **JSX/Preact powered**: Demonstrates modern React-style component integration
- **Preserves metadata**: Shows language and test mode information

## Usage

### In Pipeline (Terminal Lens)

```typescript
import { studyLenses } from 'study-lenses';

const result = await studyLenses.study.pipe(
  { code: 'function hello() {\n  return "world";\n}', lang: 'js', test: false },
  [studyLenses.lenses['jsx-demo']]
);

// result.view contains JSX component - pipeline stops here
console.log(result.view); // JSX component ready for rendering
```

### Individual Function

```typescript
import { studyLenses } from 'study-lenses';

const result = await studyLenses.lenses['jsx-demo'].lens({
  code: 'const x = 42;',
  lang: 'js',
  test: false,
});

// Returns JSX dashboard component
console.log(result.snippet.code); // Original code unchanged
console.log(result.view); // Interactive JSX component
```

### Web Component

```html
<sl-lens-jsx-demo code="function test() { return 42; }"></sl-lens-jsx-demo>
```

### After Code Transformations

```typescript
// Transform first, then visualize
const result = await studyLenses.study.pipe({ code: 'hello world', lang: 'js', test: false }, [
  studyLenses.lenses.uppercase, // Transform to "HELLO WORLD"
  studyLenses.lenses.reverse, // Transform to "DLROW OLLEH"
  studyLenses.lenses['jsx-demo'], // Visualize final result
]);
// Shows analysis dashboard for "DLROW OLLEH"
```

## Configuration

The JSX Demo lens requires no configuration - it uses an empty config object by default.

```typescript
// Default configuration (empty)
const config = studyLenses.lenses['jsx-demo'].config();
console.log(config); // {}
```

## Visual Components

### Statistics Dashboard

- **Lines Count**: Number of lines in the code
- **Words Count**: Number of space-separated words
- **Characters Count**: Total character count including spaces

### Interactive Elements

- **Expandable Code Preview**: Click "📝 Code Preview" to show/hide code
- **Formatted Display**: Code displayed in monospace with syntax highlighting
- **Metadata Display**: Shows detected language and test mode status

### Styling

- **Modern Design**: Clean card-based layout with rounded borders
- **Color Coding**: Different colors for each statistic (green, yellow, red)
- **Responsive Grid**: Statistics adapt to container width
- **Professional Typography**: System fonts for readability

## Examples

### Simple Function Analysis

```typescript
Input:  "function add(a, b) { return a + b; }"
Output:
- Lines: 1
- Words: 9
- Characters: 36
- Language: js
- Test mode: OFF
```

### Multi-line Code

```typescript
Input:  "const x = 5;\nconst y = 10;\nconst sum = x + y;"
Output:
- Lines: 3
- Words: 14
- Characters: 42
- Language: js
- Test mode: OFF
```

### Test File Detection

```typescript
// With test: true
Input:  "test('adds numbers', () => { expect(add(2,3)).toBe(5); })"
Output:
- Lines: 1
- Words: 8
- Characters: 55
- Language: js
- Test mode: ON
```

## Use Cases

- **Code complexity visualization**: Quickly see code metrics
- **Pipeline termination**: End processing chains with visual output
- **JSX integration demonstration**: Show how to build interactive components
- **Educational dashboards**: Teach students about code analysis
- **Before/after comparisons**: Visualize effects of transformations

## Pipeline Behavior

- **Input**: Any code string (typically after transformations)
- **Processing**: Analyzes code for statistics and metadata
- **Output**: Interactive JSX component with visual dashboard
- **Pipeline flow**: **Terminates pipeline** - no further lenses processed

## Technical Features

### JSX/Preact Integration

- Uses modern JSX syntax with TypeScript support
- Leverages Preact for lightweight React-style components
- Demonstrates inline styling with JavaScript objects
- Shows component composition patterns

### Component Architecture

```tsx
<div style={{ container styles }}>
  <h3>Title</h3>
  <div style={{ grid styles }}>
    {/* Statistics cards */}
  </div>
  <details>
    <summary>Expandable content</summary>
    <pre>{code}</pre>
  </details>
  <div>Metadata</div>
</div>
```

## Customization Examples

### With Custom Configuration (Future)

```typescript
// Future enhancement possibilities
const customConfig = studyLenses.lenses['jsx-demo'].config({
  theme: 'dark',
  showAdvancedStats: true,
  enableSyntaxHighlight: true,
});
```

## Import

```typescript
// Via main export (recommended)
import { studyLenses } from 'study-lenses';
const jsxDemoLens = studyLenses.lenses['jsx-demo'];

// Direct import
import jsxDemoLens from 'study-lenses/lenses/jsx-demo/lens.js';
```

## Requirements

### Dependencies

- **Preact**: JSX rendering engine (`preact@^10.0.0`)
- **TypeScript**: JSX compilation support
- **Modern Browser**: ES2018+ with JSX support

### Build Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "preact"
  }
}
```

## Related

- **Transform lenses**: Use before jsx-demo to analyze transformed code
- **Other visual lenses**: jsx-demo provides template for interactive components
- **Pipeline termination**: jsx-demo stops processing, perfect for final visualization

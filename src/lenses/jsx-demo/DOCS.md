# JSX Demo Lens - Developer Documentation

> Technical implementation details and contribution guide for the JSX Demo lens

## Architecture

The JSX Demo lens demonstrates the Study Lenses V2 JSX/Preact integration architecture with visual output and pipeline termination.

### File Structure

```
jsx-demo/
├── name.ts         # Lens identifier ('jsx-demo')
├── lens.tsx        # Core JSX component function (note .tsx extension)
├── view.ts         # Web component wrapper
├── config.ts       # Configuration factory (empty config)
├── register.ts     # Browser registration side effects
├── index.ts        # Barrel exports
└── README.md       # User documentation
```

## Implementation Details

### Core Function (JSX Component)

```typescript
// lens.tsx (note .tsx extension for JSX support)
export const lens = async (snippet: Snippet, config = _config()): Promise<LensOutput> => {
  const lines = snippet.code.split('\n');
  const wordCount = snippet.code.split(/\s+/).filter(word => word.length > 0).length;
  const charCount = snippet.code.length;

  return {
    snippet, // Pass through unchanged
    view: (
      <div style={{ /* JSX component */ }}>
        {/* Interactive dashboard */}
      </div>
    )
  };
};
```

**Algorithm Features**:

- **Line counting**: Split by newlines, count array length
- **Word counting**: Split by whitespace, filter empty strings
- **Character counting**: String length property
- **JSX rendering**: Returns Preact JSX component
- **Pipeline termination**: Returns view, stopping further processing

### JSX Component Structure

```tsx
// Component hierarchy
<div>                          // Container with styling
  <h3>                        // Title header
  <div>                       // Grid container for stats
    <div> Lines </div>        // Individual stat cards
    <div> Words </div>
    <div> Characters </div>
  </div>
  <details>                   // Expandable code preview
    <summary>                 // Click to expand
    <pre>                     // Formatted code display
  </details>
  <div>                       // Metadata footer
</div>
```

### Styling Approach

- **Inline styles**: JavaScript objects for maintainability
- **Grid layout**: Responsive statistics cards
- **CSS-in-JS**: Modern styling approach
- **No external CSS**: Self-contained component

**Style Object Pattern**:

```typescript
const containerStyle = {
	padding: '16px',
	border: '2px solid #007acc',
	borderRadius: '8px',
	backgroundColor: '#f8f9fa',
	fontFamily: 'system-ui, sans-serif',
};
```

### Configuration

```typescript
// config.ts
const defaultConfig = {};
export const config = (overrides = {}) => deepMerge(defaultConfig, overrides);
```

**Design Decision**: Empty configuration

- Visual component needs no user configuration
- Future extensions possible (themes, display options)
- Consistent with factory pattern

## JSX/Preact Integration

### Technical Requirements

- **File extension**: Must use `.tsx` for JSX syntax
- **TypeScript config**: JSX compilation with Preact
- **Import source**: Automatic Preact integration
- **Rendering**: Handled by web component wrapper

### Build Configuration

```json
// tsconfig.json requirements
{
	"compilerOptions": {
		"jsx": "react-jsx",
		"jsxImportSource": "preact"
	}
}
```

### Rendering Pipeline

1. **Lens execution**: Returns JSX component in `LensOutput.view`
2. **Type detection**: `renderView` function detects JSX vs HTMLElement
3. **Preact rendering**: Uses `render(view, container)` for JSX
4. **DOM mounting**: Component rendered to web component container

```typescript
// Web component rendering (setup-functions.ts)
const renderView = (
	container: HTMLElement,
	view: HTMLElement | ComponentChild
): void => {
	if (view instanceof HTMLElement) {
		container.appendChild(view); // Regular DOM
	} else {
		render(view, container); // JSX with Preact
	}
};
```

## Testing

### Unit Testing

```typescript
describe('jsx-demo lens', () => {
	test('analyzes simple code', async () => {
		const result = await lens({
			code: 'hello world',
			lang: 'js',
			test: false,
		});
		expect(result.snippet.code).toBe('hello world'); // Unchanged
		expect(result.view).toBeTruthy(); // JSX component present
	});

	test('counts lines correctly', async () => {
		const result = await lens({
			code: 'line1\nline2\nline3',
			lang: 'js',
			test: false,
		});
		// Would need JSX testing utilities to inspect component
	});

	test('terminates pipeline', async () => {
		const result = await lens({ code: 'test', lang: 'js', test: false });
		expect(result.view).not.toBeNull(); // Should terminate
	});
});
```

### JSX Component Testing

- **Enzyme/Testing Library**: For component testing
- **DOM rendering**: Test actual component output
- **Event handling**: Test interactive elements
- **Accessibility**: Screen reader compatibility

### Integration Testing

- **Pipeline termination**: Verify stops processing
- **Web component**: Test attribute handling
- **Browser compatibility**: Cross-browser JSX rendering

## Performance Characteristics

**Analysis Benchmarks** (approximate):

- 100 chars: ~0.1ms analysis + JSX creation
- 1,000 chars: ~0.5ms analysis + JSX creation
- 10,000 chars: ~2ms analysis + JSX creation

**Rendering Performance**:

- **JSX compilation**: Compile-time (TypeScript)
- **Component creation**: Runtime JSX instantiation
- **DOM rendering**: Preact virtual DOM efficiency
- **Memory usage**: Lightweight component tree

**Optimization Notes**:

- **Pure component**: No state changes after creation
- **No re-renders**: Static component after initial render
- **Efficient counting**: Single-pass analysis algorithms

## Extension Points

### Visual Enhancements

1. **Syntax highlighting**: Code preview with colors
2. **Interactive elements**: Click handlers, form inputs
3. **Data visualization**: Charts, graphs for metrics
4. **Theme support**: Dark mode, color schemes

### Analysis Extensions

```typescript
// Future config structure
interface JSXDemoConfig {
	theme: 'light' | 'dark';
	showAdvancedStats: boolean;
	syntaxHighlight: boolean;
	interactive: boolean;
	customMetrics: string[];
}
```

### Advanced Features

1. **Code complexity analysis**: Cyclomatic complexity
2. **AST parsing**: Structural analysis
3. **Error detection**: Syntax validation
4. **Performance metrics**: Timing information

## Contributing

### Development Setup

1. Clone repository
2. Install dependencies: `npm install preact`
3. Ensure TypeScript JSX configuration
4. Test in browser with JSX support

### JSX Development Guidelines

- **Use TypeScript**: Full type safety with JSX
- **Inline styles**: Self-contained styling
- **Accessibility**: ARIA labels, semantic HTML
- **Performance**: Avoid complex computations in render

### File Naming Convention

- **Main function**: `lens.tsx` (not `.ts`)
- **Other files**: Standard `.ts` extension
- **Import paths**: Use `.js` in imports (TypeScript handles)

### Testing JSX Components

```typescript
// Example test structure
import { render } from '@testing-library/preact';
import { lens } from './lens.tsx';

test('renders analysis dashboard', async () => {
	const result = await lens(testSnippet);
	const { container } = render(result.view);

	expect(container.textContent).toContain('Code Analysis');
	expect(container.querySelector('h3')).toBeTruthy();
});
```

## Dependencies

- **External**:
    - `preact@^10.0.0` - JSX rendering engine
    - TypeScript with JSX support
- **Internal**:
    - `../../types.js` - Type definitions
    - `./config.js` - Configuration factory
    - `../../utils/deep-merge.js` - Config merging

## Browser Compatibility

### Modern Browser Requirements

- **ES2018+**: Async/await, object spread
- **JSX Support**: Via TypeScript compilation
- **Preact**: Lightweight React alternative
- **DOM APIs**: Standard element manipulation

### JSX Compilation

- **Build time**: TypeScript compiles JSX to JavaScript
- **Runtime**: Preact handles component rendering
- **No Babel**: TypeScript handles JSX transformation

## Security Considerations

- **XSS Protection**: Preact escapes content by default
- **Safe rendering**: No `dangerouslySetInnerHTML` usage
- **Content sanitization**: Code display is text-only
- **No eval**: No dynamic code execution

## Accessibility

### Screen Reader Support

- **Semantic HTML**: Proper heading structure
- **ARIA labels**: Descriptive labels for statistics
- **Keyboard navigation**: Focusable interactive elements
- **Color independence**: Information not color-dependent

### Implementation Examples

```tsx
// Accessible component structure
<div role="main" aria-label="Code analysis dashboard">
	<h3 id="analysis-title">Code Analysis</h3>
	<div role="group" aria-labelledby="analysis-title">
		<div aria-label={`${lines.length} lines of code`}>
			<div aria-hidden="true">{lines.length}</div>
			<div>Lines</div>
		</div>
	</div>
</div>
```

## Future Enhancements

### Interactive Features

1. **Code editing**: Inline editor with live analysis
2. **Export functionality**: Download analysis as PDF/CSV
3. **Comparison mode**: Before/after transformation views
4. **Sharing**: Generate shareable analysis links

### Advanced Analysis

1. **Language-specific metrics**: Function count, complexity
2. **Code quality scores**: Maintainability index
3. **Performance analysis**: Time/space complexity hints
4. **Educational insights**: Learning recommendations

This lens serves as the reference implementation for JSX/Preact integration in Study Lenses V2, demonstrating modern component patterns and visual pipeline termination.

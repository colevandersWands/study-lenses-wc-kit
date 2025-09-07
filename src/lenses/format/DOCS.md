# Format Lens Technical Documentation

## Architecture

The Format lens is implemented as a self-contained transform lens with no view component. All Prettier integration logic is contained within the lens directory for maximum portability and minimal external dependencies.

### File Structure

```
src/lenses/format/
├── name.ts           # Lens identifier ('format')
├── lens.ts           # Main transform function
├── format-utils.ts   # Self-contained Prettier integration
├── config.ts         # Configuration factory with classic defaults
├── lens.spec.ts      # Comprehensive unit tests
├── config.spec.ts    # Configuration tests
├── index.ts          # Barrel export
├── README.md         # User documentation
├── DOCS.md           # This technical documentation
└── GUIDE.md          # Usage examples and patterns
```

### Dependencies

**Runtime Dependencies:**

- `prettier/standalone` - Core Prettier formatting engine
- `prettier/plugins/babel` - JavaScript/JSX parsing support
- `prettier/plugins/estree` - AST parsing utilities
- `../../utils/deep-merge.js` - Configuration merging (only external dependency)

**No External Utilities:**

- Does not depend on `src/utils/prettier-format.ts`
- All Prettier logic is self-contained within `format-utils.ts`
- Complete isolation from parent project utilities

## Implementation Details

### Format Utilities (`format-utils.ts`)

#### Core Function: `formatJavaScript`

```typescript
export async function formatJavaScript(
	code: string,
	options: PrettierOptions
): Promise<string>;
```

**Features:**

- Handles empty/whitespace-only code gracefully
- Includes Prettier plugins automatically (`parserBabel`, `parserEstree`)
- Returns original code with error comment on failure
- Comprehensive error logging to console

**Error Handling Strategy:**

```typescript
try {
  return await format(code, { plugins: [...], ...options });
} catch (error) {
  console.warn('Format lens: Prettier formatting failed:', error);
  return code + '\n// Unable to format code - check console for details';
}
```

#### Parser Selection: `selectParser`

```typescript
export function selectParser(lang: string): string;
```

**Language Mapping:**

- `'js'`, `'mjs'`, `'javascript'` → `'babel'`
- `'ts'`, `'typescript'` → `'typescript'`
- `'jsx'` → `'babel'`
- `'tsx'` → `'typescript'`
- Default → `'babel'`

### Lens Function (`lens.ts`)

#### Signature

```typescript
export const lens = async (
  snippet: Snippet,
  config = _config()
): Promise<LensOutput>
```

#### Processing Pipeline

1. **Validation**: Check if code can be formatted using `canFormat()`
2. **Parser Selection**: Auto-detect parser based on `snippet.lang`
3. **Configuration Merge**: Combine user config with auto-selected parser
4. **Formatting**: Call `formatJavaScript()` with final configuration
5. **Result Assembly**: Return transformed snippet with null view

#### Error Boundaries

The lens implements multiple error handling layers:

1. **Input Validation**: Early return for empty/invalid code
2. **Formatter Errors**: Handled by `formatJavaScript()`
3. **Unexpected Errors**: Final catch block with error comment injection

```typescript
try {
	const formattedCode = await formatJavaScript(snippet.code, finalConfig);
	return { snippet: { ...snippet, code: formattedCode }, view: null };
} catch (error) {
	console.error('Format lens: Unexpected error:', error);
	return {
		snippet: {
			...snippet,
			code:
				snippet.code +
				'\n// Format lens: Unexpected formatting error occurred',
		},
		view: null,
	};
}
```

### Configuration System (`config.ts`)

#### Factory Pattern Implementation

```typescript
export const config = (
	overrides: Partial<PrettierOptions> = {}
): PrettierOptions => {
	return deepMerge(defaultConfig, overrides || {});
};
```

#### Classic Default Philosophy

The Format lens uses **classic tab-based defaults** rather than modern Prettier defaults:

| Option          | Classic Default | Modern Default | Rationale                                |
| --------------- | --------------- | -------------- | ---------------------------------------- |
| `useTabs`       | `true`          | `false`        | Professional codebases often prefer tabs |
| `tabWidth`      | `4`             | `2`            | Classic 4-space tab width                |
| `singleQuote`   | `false`         | `true`         | Double quotes are more traditional       |
| `trailingComma` | `'none'`        | `'es5'`        | Conservative approach for legacy support |
| `arrowParens`   | `'always'`      | `'avoid'`      | Explicit parentheses for clarity         |

#### Deep Merge Support

Uses the existing `deepMerge` utility to allow partial configuration overrides:

```typescript
// Only override specific options, preserve others
const customConfig = config({
	singleQuote: true, // Override
	// useTabs: true (preserved from defaults)
	// tabWidth: 4 (preserved from defaults)
});
```

## Testing Strategy

### Unit Tests (`lens.spec.ts`)

**Test Categories:**

1. **Basic Functionality**: Simple code formatting with defaults
2. **Classic Configuration**: Verify tab-based, double-quote defaults
3. **Custom Configuration**: Test override scenarios
4. **Language Detection**: Parser selection for different languages
5. **Error Handling**: Malformed code, empty input, edge cases
6. **Metadata Preservation**: Ensure `snippet.lang` and `snippet.test` are maintained

**Key Test Scenarios:**

```typescript
// Classic defaults verification
expect(result.snippet.code).toMatch(/\t/); // Tab indentation
expect(result.snippet.code).toContain('"hello"'); // Double quotes
expect(result.snippet.code).not.toMatch(/,\s*}/); // No trailing commas

// Language-specific formatting
const mjsResult = await lens({
	code: "import{x}from'./mod'",
	lang: 'mjs',
	test: false,
});
expect(mjsResult.snippet.code).toContain('import { x } from "./mod"');
```

### Configuration Tests (`config.spec.ts`)

**Test Categories:**

1. **Default Configuration**: Verify classic tab-based defaults
2. **Override Behavior**: Simple and nested option overrides
3. **Factory Independence**: Ensure each call returns independent objects
4. **Edge Cases**: Null/undefined overrides, empty objects
5. **Team Standards**: Common formatting style configurations

## Performance Characteristics

### Async Processing

- Uses Prettier's async API to prevent UI blocking
- Suitable for processing in lens pipelines without performance impact
- Memory efficient - processes one snippet at a time

### Plugin Loading

- Prettier plugins (`babel`, `estree`) are imported once at module load
- No runtime plugin loading overhead
- Consistent parser availability across all formatting operations

### Error Recovery

- Formatting failures don't crash pipelines
- Original code is preserved with error comments
- Graceful degradation maintains pipeline flow

## Integration Points

### Study Lens Registry

Registered in `src/lenses/index.ts` using dynamic key generation:

```typescript
import format from './format/index.js';
export default {
	[format.name]: format, // 'format': formatObj
};
```

### Pipeline Compatibility

- **Transform-Only**: Always returns `{ snippet, view: null }`
- **Terminus Conditions**: Never terminates pipeline (view is always null)
- **Error Handling**: Failures don't break pipeline chain
- **Configuration**: Supports all LensSpec patterns

```typescript
// All these patterns work
await sl.study.pipe(snippet, [
	sl.lenses.format, // Object with default config
	[sl.lenses.format.lens, {}], // Function with empty config
	[sl.lenses.format, { singleQuote: true }], // Object with overrides
]);
```

### Type System Integration

- Full TypeScript support with proper `LensOutput` typing
- `PrettierOptions` interface matches Prettier's configuration schema
- No type assertions or `any` types in public APIs

## Maintenance Notes

### Adding New Prettier Options

1. Update `PrettierOptions` interface in `format-utils.ts`
2. Add option to `defaultConfig` in `config.ts` if needed
3. Update tests in `config.spec.ts`
4. Document new option in README.md

### Parser Support Extension

1. Add new language mapping in `selectParser()` function
2. Update tests to verify parser selection
3. Document supported languages in README.md

### Error Handling Enhancement

1. Modify error messages in `formatJavaScript()`
2. Update error handling tests
3. Consider telemetry/metrics for error rates

## Security Considerations

- **No Code Execution**: Prettier only parses and reformats, doesn't execute
- **Input Sanitization**: Prettier validates syntax before formatting
- **Error Information**: Error messages are safe to display (no sensitive data)
- **Dependencies**: Uses official Prettier packages from npm registry

## Future Enhancement Opportunities

1. **Configuration Presets**: Add common team style presets
2. **Custom Parsers**: Support for additional language parsers
3. **Formatting Metrics**: Code complexity analysis during formatting
4. **Performance Monitoring**: Track formatting time and success rates
5. **Plugin System**: Allow custom Prettier plugins

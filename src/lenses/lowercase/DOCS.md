# Lowercase Lens - Developer Documentation

> Technical implementation details and contribution guide for the Lowercase lens

## Architecture

The Lowercase lens follows the Study Lenses V2 architecture with separate argument pattern and factory configuration.

### File Structure

```
lowercase/
├── name.ts         # Lens identifier ('lowercase')
├── lens.ts         # Core transformation function
├── view.ts         # Web component wrapper
├── config.ts       # Configuration factory (empty config)
├── register.ts     # Browser registration side effects
├── index.ts        # Barrel exports
└── README.md       # User documentation
```

## Implementation Details

### Core Function

```typescript
// lens.ts
export const lens = (snippet: Snippet, config = _config()): LensOutput => ({
	snippet: {
		...snippet,
		code: snippet.code.toLowerCase(),
	},
	view: null, // Transform lens - no visual output
});
```

**Algorithm**: Native string lowercase conversion using `String.prototype.toLowerCase()`

- Time complexity: O(n) where n is string length
- Space complexity: O(n) for new string
- Leverages native browser/runtime optimizations
- Handles Unicode case conversion correctly

### Configuration

```typescript
// config.ts
const defaultConfig = {};
export const config = (overrides = {}) => deepMerge(defaultConfig, overrides);
```

**Design Decision**: Empty configuration object

- Native toLowerCase() handles all cases correctly
- No configuration needed for standard case conversion
- Extensible for future enhancements (locale-specific rules, selective conversion)

### Web Component Integration

```typescript
// view.ts
export const view = createLensElement('lowercase', lens);
```

Uses the standard lens element factory with automatic:

- Code extraction from attributes
- Config parsing from element attributes
- Result rendering to DOM

## Testing

### Unit Testing

```typescript
// Test cases to verify
describe('lowercase lens', () => {
	test('converts uppercase to lowercase', () => {
		const result = lens({ code: 'HELLO', lang: 'js', test: false });
		expect(result.snippet.code).toBe('hello');
	});

	test('handles mixed case', () => {
		const result = lens({ code: 'HeLLo WoRLd', lang: 'js', test: false });
		expect(result.snippet.code).toBe('hello world');
	});

	test('preserves non-alphabetic characters', () => {
		const result = lens({ code: 'LET X = 42;', lang: 'js', test: false });
		expect(result.snippet.code).toBe('let x = 42;');
	});

	test('handles unicode characters', () => {
		const result = lens({ code: 'CAFÉ', lang: 'js', test: false });
		expect(result.snippet.code).toBe('café');
	});

	test('preserves metadata', () => {
		const input = { code: 'TEST', lang: 'python', test: true };
		const result = lens(input);
		expect(result.snippet.lang).toBe('python');
		expect(result.snippet.test).toBe(true);
	});
});
```

### Edge Case Testing

- Empty strings
- Strings with only numbers/symbols
- Unicode characters (accented, non-Latin)
- Very long strings (performance)
- Newlines and whitespace preservation

## Performance Characteristics

**Benchmarks** (approximate):

- 100 chars: ~0.05ms
- 1,000 chars: ~0.2ms
- 10,000 chars: ~1ms
- 100,000 chars: ~8ms

**Memory Usage**:

- Creates new string (immutable)
- Memory usage ~2x input string size
- Native implementation optimized
- Garbage collected after processing

**Browser Optimizations**:

- V8, SpiderMonkey, and other engines optimize `toLowerCase()`
- SIMD instructions used on supported platforms
- Unicode tables cached by runtime

## Extension Points

### Possible Enhancements

1. **Locale-specific conversion**:
    - Turkish: I → ı (not i)
    - Other language-specific rules
    - Proper locale handling

2. **Selective conversion**:
    - Only convert keywords
    - Preserve string literals
    - Skip comments
    - Preserve acronyms/constants

3. **Configuration options**:
    - Locale selection
    - Exclusion patterns
    - Preserve specific case patterns

### Configuration Extension Example

```typescript
// Future config structure
interface LowercaseConfig {
	locale?: string; // 'en-US', 'tr-TR', etc.
	preserveStrings?: boolean;
	preserveComments?: boolean;
	preserveConstants?: boolean; // Keep ALL_CAPS words
	excludePatterns?: RegExp[];
}
```

## Contributing

### Development Setup

1. Clone repository
2. Install dependencies: `npm install`
3. Run tests: Open `test/test.html` in browser
4. Test web component: Open example files

### Code Style

- Follow existing TypeScript patterns
- Use synchronous pure functions for transforms
- Maintain pure function approach
- Add JSDoc comments for complex logic

### Adding Features

1. Update `config.ts` with new options
2. Modify `lens.ts` algorithm
3. Add tests for new functionality
4. Update README.md with usage examples
5. Consider Unicode compatibility

### Testing Guidelines

- Test various character sets
- Verify locale handling
- Test pipeline integration
- Check web component attributes
- Performance test with large inputs

## Dependencies

- **External**: None (uses built-in String methods)
- **Internal**:
    - `../../types.js` - Type definitions
    - `./config.js` - Configuration factory
    - `../../utils/deep-merge.js` - Config merging

## Browser Compatibility

Works in all modern browsers supporting:

- ES2015+ (String.prototype.toLowerCase is ES1)
- Unicode case conversion
- Proper locale handling

**Unicode Support**:

- Basic Latin characters: ✓
- Latin Extended: ✓
- Accented characters: ✓
- Non-Latin scripts: ✓ (Arabic, Cyrillic, etc.)
- Locale-specific rules: Browser dependent

## Security Considerations

- No security risks - pure string manipulation
- No code execution or eval usage
- Safe with untrusted input
- No XSS vectors in output
- Unicode normalization handled by browser

## Locale Considerations

The native `toLowerCase()` uses browser's default locale. For specific locale requirements:

```typescript
// Future enhancement possibility
code.toLocaleLowerCase('tr-TR'); // Turkish-specific rules
```

Currently uses browser default, which is typically appropriate for most use cases.

## Common Use Cases in Education

### Code Normalization Pipelines

```typescript
// Normalize mixed-case code for comparison
configs: [sl.lenses.lowercase];
```

### Style Analysis

```typescript
// Convert to lowercase before analyzing naming conventions
configs: [sl.lenses.lowercase, customAnalysisLens];
```

### Text Processing Chains

```typescript
// Multi-step text transformation
configs: [
	sl.lenses.uppercase, // First normalize to all caps
	sl.lenses.lowercase, // Then to lowercase
	sl.lenses.reverse, // Finally reverse
];
```

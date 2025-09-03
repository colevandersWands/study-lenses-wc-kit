# Format Lens

> Transform lens that formats JavaScript/TypeScript code using Prettier with classic tab-based defaults

## Overview

The Format lens is a self-contained transform lens that formats JavaScript, TypeScript, JSX, and other JavaScript-family languages using Prettier. It features classic tab-based formatting defaults suitable for professional codebases while allowing full customization of all Prettier options.

## Key Features

- **Classic Defaults**: Tab-based indentation, double quotes, no trailing commas
- **Full Prettier Integration**: Complete access to all Prettier formatting options
- **Language Detection**: Automatic parser selection based on `snippet.lang`
- **Graceful Degradation**: Returns original code with comment on formatting failure
- **Self-Contained**: No external utility dependencies
- **Transform-Only**: No view component - focused purely on code transformation

## Basic Usage

```typescript
import sl from 'study-lenses-wc-kit';

// Format with classic defaults (tabs, double quotes, no trailing commas)
const result = await sl.lenses.format.lens(snippet);

// Custom configuration
const modernConfig = sl.lenses.format.config({
  useTabs: false,
  tabWidth: 2,
  singleQuote: true,
  trailingComma: 'es5'
});
const result2 = await sl.lenses.format.lens(snippet, modernConfig);

// Pipeline usage
const result3 = await sl.study.pipe(snippet, [
  sl.lenses.format,
  sl.lenses.uppercase
]);
```

## Classic Default Configuration

The Format lens uses classic, professional formatting defaults:

```typescript
{
  parser: 'babel',        // Auto-selected based on language
  useTabs: true,          // Tab indentation
  tabWidth: 4,            // 4-space tab width
  semi: true,             // Always semicolons
  singleQuote: false,     // Double quotes (classic)
  trailingComma: 'none',  // No trailing commas (classic)
  bracketSpacing: true,   // Spaces in object literals
  arrowParens: 'always',  // Always parentheses around arrow params
  printWidth: 80,         // Classic line length
  endOfLine: 'lf',        // Unix line endings
}
```

## Language Support

The lens automatically selects the appropriate Prettier parser based on `snippet.lang`:

- `'js'` → babel parser (standard JavaScript)
- `'mjs'` → babel parser (ES modules)
- `'ts'` → typescript parser (TypeScript)
- `'jsx'` → babel parser (JSX)
- `'tsx'` → typescript parser (TypeScript JSX)
- Other languages → babel parser (default)

## Configuration Examples

### Modern Team Standards

```typescript
// Airbnb-style configuration
const airbnbConfig = sl.lenses.format.config({
  useTabs: false,
  tabWidth: 2,
  singleQuote: true,
  trailingComma: 'all',
  arrowParens: 'avoid'
});

// Google-style configuration
const googleConfig = sl.lenses.format.config({
  useTabs: false,
  tabWidth: 2,
  singleQuote: true,
  trailingComma: 'es5',
  arrowParens: 'always'
});
```

### Custom Formatting Rules

```typescript
// Compact style
const compactConfig = sl.lenses.format.config({
  printWidth: 120,
  bracketSpacing: false,
  semi: false
});

// Legacy codebase style
const legacyConfig = sl.lenses.format.config({
  useTabs: true,
  tabWidth: 8,
  printWidth: 120,
  bracketSameLine: true
});
```

## Error Handling

The Format lens includes robust error handling:

1. **Empty Code**: Returns empty code unchanged
2. **Whitespace-Only**: Returns whitespace unchanged  
3. **Malformed Code**: Returns original code with error comment
4. **Prettier Errors**: Graceful degradation with console warning

Example of error handling:

```javascript
// Input: malformed code
const malformed = 'const x = {{{ invalid syntax';

// Output: original code + comment
const x = {{{ invalid syntax
// Unable to format code - check console for details
```

## Pipeline Integration

Works seamlessly in lens pipelines:

```typescript
// Sequential formatting and transformation
await sl.study.pipe(snippet, [
  sl.lenses.format,        // Format first
  sl.lenses.reverse,       // Then reverse
  [sl.lenses.format, {     // Format again with custom config
    singleQuote: true
  }]
]);
```

## Performance Notes

- **Async Processing**: Uses async Prettier API for non-blocking operation
- **Parser Caching**: Prettier plugins are loaded once and reused
- **Error Boundaries**: Formatting failures don't crash the pipeline
- **Memory Efficient**: Only processes one snippet at a time

## TypeScript Support

Full TypeScript integration with proper typing:

```typescript
import type { Snippet, LensOutput } from 'study-lenses-wc-kit';

const snippet: Snippet = {
  code: 'interface Test{name:string;}',
  lang: 'ts',
  test: false
};

const result: Promise<LensOutput> = sl.lenses.format.lens(snippet);
```

## Common Use Cases

1. **Code Standardization**: Apply consistent formatting across codebases
2. **Before/After Comparisons**: Format code before applying other transformations
3. **Educational Tools**: Show properly formatted code to students
4. **Legacy Code Modernization**: Update formatting while preserving logic
5. **Team Onboarding**: Demonstrate team coding standards

## Troubleshooting

### Formatting Fails
- Check browser console for Prettier error details
- Verify code syntax is valid JavaScript/TypeScript
- Try reducing `printWidth` for complex expressions

### Wrong Parser Selected
- Ensure `snippet.lang` is set correctly (`'js'`, `'ts'`, etc.)
- Override parser in config if needed: `config({ parser: 'typescript' })`

### Unexpected Output
- Review configuration - Format lens uses classic defaults, not Prettier defaults
- Check for conflicting config options
- Verify input code is clean (no mixed line endings, etc.)

## See Also

- [Technical Documentation](./DOCS.md) - Implementation details and architecture
- [Usage Guide](./GUIDE.md) - Comprehensive examples and patterns  
- [Contributing Guide](../../CONTRIBUTING.md) - How to extend or modify the lens
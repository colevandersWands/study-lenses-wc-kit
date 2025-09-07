# Lowercase Lens

> Pure text transformation lens that converts all text to lowercase

The Lowercase lens is a simple transform lens that converts all characters in code to lowercase, creating a more uniform appearance while preserving the original structure.

## Features

- **Pure transformation**: No visual output, continues pipeline
- **Case conversion**: Converts all alphabetic characters to lowercase
- **Zero configuration**: Works out of the box with no setup required
- **Structure preservation**: Maintains spacing, punctuation, and formatting
- **Preserves metadata**: Maintains language and test flags from original snippet

## Usage

### In Pipeline

```typescript
import { studyLenses } from 'study-lenses';

const result = await sl.study.pipe(
	{ code: 'HELLO WORLD', lang: 'js', test: false },
	[sl.lenses.lowercase]
);

console.log(result.snippet.code); // "hello world"
```

### Individual Function

```typescript
import { studyLenses } from 'study-lenses';

const result = await sl.lenses.lowercase.lens({
	code: 'HELLO WORLD',
	lang: 'js',
	test: false,
});

console.log(result.snippet.code); // "hello world"
```

### Web Component

```html
<sl-lens-lowercase code="HELLO WORLD"></sl-lens-lowercase>
```

## Configuration

The Lowercase lens requires no configuration - it uses an empty config object by default.

```typescript
// Default configuration (empty)
const config = sl.lenses.lowercase.config();
console.log(config); // {}
```

## Examples

### Basic Text

```typescript
Input: 'HELLO';
Output: 'hello';
```

### Mixed Case Code

```typescript
Input: 'FUNCTION AddNumbers() { RETURN 5; }';
Output: 'function addnumbers() { return 5; }';
```

### Preserves Structure

```typescript
Input: 'CONST X = 42;\nCONST Y = X * 2;';
Output: 'const x = 42;\nconst y = x * 2;';
```

### Numbers and Symbols

```typescript
Input: 'LET COUNT = 0; // INITIALIZE COUNTER';
Output: 'let count = 0; // initialize counter';
```

## Use Cases

- **Code normalization**: Create consistent lowercase code style
- **Case-insensitive analysis**: Prepare code for comparison operations
- **Style standardization**: Convert code to lowercase conventions
- **Text preprocessing**: Normalize case before further processing
- **Pipeline composition**: Combine with other transforms for complex effects

## Pipeline Behavior

- **Input**: Any code string
- **Processing**: Character-by-character case conversion
- **Output**: Transformed snippet with lowercase code
- **Pipeline flow**: Continues to next lens (no terminus)

## Combination Examples

### Uppercase then Lowercase (Normalization)

```typescript
const result = await sl.study.pipe(
	{ code: 'MiXeD cAsE cOdE', lang: 'js', test: false },
	[
		studyLenses.lenses.uppercase, // First: normalize to all caps
		sl.lenses.lowercase, // Then: convert to all lowercase
	]
);

console.log(result.snippet.code); // "mixed case code"
```

### With Reverse and JSX Demo

```typescript
const result = await sl.study.pipe(
	{ code: 'FUNCTION TEST() {}', lang: 'js', test: false },
	[
		sl.lenses.lowercase,
		studyLenses.lenses.reverse,
		studyLenses.lenses['jsx-demo'],
	]
);
// Shows analysis of "}{ )(tset noitcnuf" with character counts
```

## Import

```typescript
// Via main export (recommended)
import { studyLenses } from 'study-lenses';
const lowercaseLens = sl.lenses.lowercase;

// Direct import
import lowercaseLens from 'study-lenses/lenses/lowercase/lens.js';
```

## Related

- **uppercase**: Opposite transformation (converts to uppercase)
- **reverse**: Text manipulation while preserving case
- Use with jsx-demo to visualize case transformation effects

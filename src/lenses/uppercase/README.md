# Uppercase Lens

> Pure text transformation lens that converts all text to uppercase

The Uppercase lens is a simple transform lens that converts all characters in code to uppercase, making text more prominent while preserving the original structure.

## Features

- **Pure transformation**: No visual output, continues pipeline
- **Case conversion**: Converts all alphabetic characters to uppercase
- **Zero configuration**: Works out of the box with no setup required
- **Structure preservation**: Maintains spacing, punctuation, and formatting
- **Preserves metadata**: Maintains language and test flags from original snippet

## Usage

### In Pipeline

```typescript
import { studyLenses } from 'study-lenses';

const result = await studyLenses.study.pipe({ code: 'hello world', lang: 'js', test: false }, [
  studyLenses.lenses.uppercase,
]);

console.log(result.snippet.code); // "HELLO WORLD"
```

### Individual Function

```typescript
import { studyLenses } from 'study-lenses';

const result = await studyLenses.lenses.uppercase.lens({
  code: 'hello world',
  lang: 'js',
  test: false,
});

console.log(result.snippet.code); // "HELLO WORLD"
```

### Web Component

```html
<sl-lens-uppercase code="hello world"></sl-lens-uppercase>
```

## Configuration

The Uppercase lens requires no configuration - it uses an empty config object by default.

```typescript
// Default configuration (empty)
const config = studyLenses.lenses.uppercase.config();
console.log(config); // {}
```

## Examples

### Basic Text

```typescript
Input: 'hello';
Output: 'HELLO';
```

### Mixed Case Code

```typescript
Input: 'function addNumbers() { return 5; }';
Output: 'FUNCTION ADDNUMBERS() { RETURN 5; }';
```

### Preserves Structure

```typescript
Input: 'const x = 42;\nconst y = x * 2;';
Output: 'CONST X = 42;\nCONST Y = X * 2;';
```

### Numbers and Symbols

```typescript
Input: 'let count = 0; // Initialize counter';
Output: 'LET COUNT = 0; // INITIALIZE COUNTER';
```

## Use Cases

- **Code emphasis**: Make code more visually prominent
- **Constant highlighting**: Transform variables to look like constants
- **Text preprocessing**: Prepare code for case-insensitive analysis
- **Visual consistency**: Standardize case across different code samples
- **Pipeline composition**: Combine with other transforms (reverse + uppercase)

## Pipeline Behavior

- **Input**: Any code string
- **Processing**: Character-by-character case conversion
- **Output**: Transformed snippet with uppercase code
- **Pipeline flow**: Continues to next lens (no terminus)

## Combination Examples

### With Reverse Lens

```typescript
const result = await studyLenses.study.pipe({ code: 'hello world', lang: 'js', test: false }, [
  studyLenses.lenses.reverse,
  studyLenses.lenses.uppercase,
]);

console.log(result.snippet.code); // "DLROW OLLEH"
```

### With JSX Demo

```typescript
const result = await studyLenses.study.pipe(
  { code: 'function test() {}', lang: 'js', test: false },
  [studyLenses.lenses.uppercase, studyLenses.lenses['jsx-demo']]
);
// Shows analysis of "FUNCTION TEST() {}" with character counts
```

## Import

```typescript
// Via main export (recommended)
import { studyLenses } from 'study-lenses';
const uppercaseLens = studyLenses.lenses.uppercase;

// Direct import
import uppercaseLens from 'study-lenses/lenses/uppercase/lens.js';
```

## Related

- **lowercase**: Opposite transformation (converts to lowercase)
- **reverse**: Text manipulation while preserving case
- Use with jsx-demo to visualize case transformation effects

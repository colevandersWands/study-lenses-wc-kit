# Reverse Lens

> Pure text transformation lens that reverses code character by character

The Reverse lens is a simple transform lens that reverses the entire code string character by character, creating a mirror image of the original text.

## Features

- **Pure transformation**: No visual output, continues pipeline
- **Character-level reversal**: Reverses every character including spaces and punctuation
- **Zero configuration**: Works out of the box with no setup required
- **Preserves metadata**: Maintains language and test flags from original snippet

## Usage

### In Pipeline

```typescript
import { studyLenses } from 'study-lenses';

const result = await sl.study.pipe(
	{ code: 'hello world', lang: 'js', test: false },
	[studyLenses.lenses.reverse]
);

console.log(result.snippet.code); // "dlrow olleh"
```

### Individual Function

```typescript
import { studyLenses } from 'study-lenses';

const result = await sl.lenses.reverse.lens({
	code: 'hello world',
	lang: 'js',
	test: false,
});

console.log(result.snippet.code); // "dlrow olleh"
```

### Web Component

```html
<sl-lens-reverse code="hello world"></sl-lens-reverse>
```

## Configuration

The Reverse lens requires no configuration - it uses an empty config object by default.

```typescript
// Default configuration (empty)
const config = sl.lenses.reverse.config();
console.log(config); // {}
```

## Examples

### Basic Text

```typescript
Input: 'hello';
Output: 'olleh';
```

### Code with Spaces

```typescript
Input: 'function add() { return 5; }';
Output: '{ ;5 nruter { )(dda noitcnuf';
```

### Multi-line Code

```typescript
Input: 'line 1\nline 2';
Output: '2 enil\n1 enil';
```

## Use Cases

- **Code obfuscation demonstrations**: Show how text can be transformed while preserving structure
- **Pattern recognition exercises**: Help students identify code patterns even when reversed
- **String manipulation examples**: Demonstrate basic text transformation techniques
- **Pipeline testing**: Use as a simple, predictable transformation in complex pipelines

## Pipeline Behavior

- **Input**: Any code string
- **Processing**: Character-by-character reversal
- **Output**: Transformed snippet with reversed code
- **Pipeline flow**: Continues to next lens (no terminus)

## Import

```typescript
// Via main export (recommended)
import { studyLenses } from 'study-lenses';
const reverseLens = sl.lenses.reverse;

// Direct import
import reverseLens from 'study-lenses/lenses/reverse/lens.js';
```

## Related

- **uppercase**: Transforms case while preserving character order
- **lowercase**: Transforms case while preserving character order
- Use with jsx-demo to visualize character count changes

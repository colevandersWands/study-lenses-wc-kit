# Loop Guard Lens 🛡️

A transform lens that prevents infinite loops by injecting safety counters into JavaScript loop constructs during AST transformation.

## Features

- **AST-based transformation** - Uses recast and estree-walker for robust loop detection
- **Six loop types supported** - for, while, do-while, for-of, for-in, for-await-of  
- **Configurable protection** - Choose which loop types to guard and iteration limits
- **Educational safety** - Prevents browser freezing in interactive learning environments
- **Graceful error handling** - Falls back to original code on parsing failures
- **Transform-only lens** - No visual component, pure code transformation

## Usage

### As Web Component

```html
<!-- Basic usage with default configuration -->
<sl-lens-loop-guard code="for (let i = 0; i < Infinity; i++) { console.log(i); }"></sl-lens-loop-guard>

<!-- Custom configuration -->
<sl-lens-loop-guard 
  code="while (true) { work(); }"
  config='{"max": 500, "loops": ["while", "for"]}'></sl-lens-loop-guard>

<!-- File loading -->
<sl-lens-loop-guard src="./examples/unsafe-loops.js"></sl-lens-loop-guard>
```

### As Lens Function

```javascript
import studyLenses from 'study-lenses-wc-kit';

const loopGuard = studyLenses.lenses['loop-guard'];

// Basic usage
const snippet = {
  code: 'for (let i = 0; i < Infinity; i++) { console.log(i); }',
  lang: 'javascript',
  test: false
};

const result = loopGuard.lens(snippet);
console.log(result.snippet.code);
// Output includes: let loopGuard_1 = 0; and safety checks

// Custom configuration
const config = loopGuard.config({
  max: 500,
  loops: ['for', 'while'] // Only guard these loop types
});

const result = loopGuard.lens(snippet, config);
```

### In Pipeline

```javascript
import { pipe } from 'study-lenses-wc-kit';

// Add loop protection before other transformations
const result = await pipe(snippet, [
  loopGuard.lens,
  otherTransforms.lens
]);
```

## Configuration

```typescript
interface LoopGuardConfig {
  /** Maximum loop iterations before throwing RangeError */
  max: number;
  
  /** Which loop types to guard */
  loops: LoopType[];
}

type LoopType = 
  | 'for'         // for (let i = 0; i < 10; i++)
  | 'while'       // while (condition)
  | 'do-while'    // do { } while (condition)
  | 'for-of'      // for (const item of array)
  | 'for-in'      // for (const key in object)
  | 'for-await-of'; // for await (const item of asyncIterable)
```

### Default Configuration

```javascript
const defaultConfig = {
  max: 1000,
  loops: ['for', 'while', 'do-while', 'for-of', 'for-in', 'for-await-of']
};
```

### Configuration Examples

```javascript
// Only guard for and while loops with lower limit
const config = loopGuard.config({
  max: 100,
  loops: ['for', 'while']
});

// Guard all loops but with higher limit
const config = loopGuard.config({
  max: 5000
});

// Only guard async loops
const config = loopGuard.config({
  loops: ['for-await-of']
});
```

## Examples

### Input Code

```javascript
function fibonacci(n) {
  let a = 0, b = 1;
  for (let i = 0; i < n; i++) {
    [a, b] = [b, a + b];
  }
  return a;
}

while (true) {
  console.log('This would run forever!');
}
```

### Output Code (with default config)

```javascript
function fibonacci(n) {
  let a = 0, b = 1;
  let loopGuard_1 = 0;
  for (let i = 0; i < n; i++) {
    loopGuard_1++;
    if (loopGuard_1 > 1000) {
      throw new RangeError("loopGuard_1 is greater than 1000");
    }
    [a, b] = [b, a + b];
  }
  return a;
}

let loopGuard_2 = 0;
while (true) {
  loopGuard_2++;
  if (loopGuard_2 > 1000) {
    throw new RangeError("loopGuard_2 is greater than 1000");
  }
  console.log('This would run forever!');
}
```

## How It Works

1. **AST Parsing** - Code is parsed into an Abstract Syntax Tree using recast
2. **Loop Detection** - estree-walker traverses the AST to find configured loop types  
3. **Guard Injection** - Unique counter variables and safety checks are inserted
4. **Code Generation** - Modified AST is converted back to JavaScript code

### Guard Pattern

Each protected loop gets:
- A unique counter variable: `let loopGuard_N = 0;`
- Increment statement: `loopGuard_N++;`
- Safety check: `if (loopGuard_N > max) { throw new RangeError(...); }`

### Loop Type Detection

The lens uses AST node types to identify loops:
- `ForStatement` → 'for'
- `WhileStatement` → 'while'  
- `DoWhileStatement` → 'do-while'
- `ForInStatement` → 'for-in'
- `ForOfStatement` → 'for-of' or 'for-await-of' (based on `await` property)

## Error Handling

The lens gracefully handles various error conditions:

- **Parse errors** - Returns original code unchanged
- **Malformed JavaScript** - Logs warning, returns original code
- **Unsupported syntax** - Falls back gracefully (e.g., for-await-of parsing issues)

## Educational Use Cases

Perfect for interactive coding environments:

- **Code playgrounds** - Prevent infinite loops from crashing the browser
- **Tutorial systems** - Allow experimentation with loop constructs safely
- **Coding exercises** - Protect against common beginner mistakes
- **Live coding demos** - Run user-submitted code with confidence

## Performance Notes

- **Selective processing** - Only processes configured loop types
- **Unique guards** - Each loop gets its own counter to avoid conflicts
- **AST-based** - Robust parsing handles complex nested structures
- **Minimal overhead** - Guards only add a few lines per loop

## Limitations

- **for-await-of support** - Limited by parser capabilities, may fall back
- **Dynamic loops** - Cannot protect against dynamically generated loops
- **Eval protection** - Does not prevent infinite loops in eval'd code
- **Recursive functions** - Does not protect against infinite recursion

## Related Lenses

- **format lens** - Format code before/after adding guards
- **jsx-demo lens** - Display protected code with visual annotations
- **run-it lens** - Execute protected code safely in sandboxed environment

## Technical Details

- **Dependencies** - Uses recast (AST manipulation) and estree-walker (traversal)
- **TypeScript** - Fully typed with comprehensive interfaces
- **Testing** - 24 unit tests covering all loop types and configurations
- **Self-contained** - All AST utilities included, no external service dependencies
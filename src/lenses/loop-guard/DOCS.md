# Loop Guard Lens - Technical Documentation

## API Reference

### Core Function

```typescript
function lens(snippet: Snippet, config?: LoopGuardConfig): LensOutput;
```

Transforms JavaScript code to include loop guards that prevent infinite loops.

**Parameters:**

- `snippet: Snippet` - Input code with metadata
- `config: LoopGuardConfig` - Configuration options (optional)

**Returns:** `LensOutput` with transformed code and null view

**Example:**

```javascript
const result = lens(
	{ code: 'while (true) { work(); }', lang: 'js', test: false },
	{ max: 100, loops: ['while'] }
);
```

### Configuration Factory

```typescript
function config(overrides?: Partial<LoopGuardConfig>): LoopGuardConfig;
```

Creates configuration object with deep merge support.

**Parameters:**

- `overrides: Partial<LoopGuardConfig>` - Configuration overrides

**Returns:** Complete configuration object

**Example:**

```javascript
const customConfig = config({
	max: 500,
	loops: ['for', 'while'],
});
```

### Types

```typescript
interface LoopGuardConfig {
	max: number; // Maximum iterations before error
	loops: LoopType[]; // Which loop types to guard
}

type LoopType =
	| 'for' // C-style for loops
	| 'while' // While loops
	| 'do-while' // Do-while loops
	| 'for-of' // For-of loops
	| 'for-in' // For-in loops
	| 'for-await-of'; // Async for-of loops

interface Snippet {
	code: string; // JavaScript source code
	lang: string; // Language identifier
	test: boolean; // Whether this is test code
}

interface LensOutput {
	snippet: Snippet | null | undefined | false; // Transformed snippet
	view: null; // Always null (transform lens)
}
```

## Implementation Details

### AST Transformation Process

1. **Code Parsing**

    ```javascript
    const ast = recast.parse(evalCode);
    ```

2. **AST Traversal**

    ```javascript
    const guardedTree = walk(ast, {
    	enter(node) {
    		/* Skip generated nodes */
    	},
    	leave(node, parent) {
    		/* Process loop nodes */
    	},
    });
    ```

3. **Loop Guard Generation**

    ```javascript
    const { variable, check } = generateLoopGuard(id, max);
    // variable: let loopGuard_N = 0;
    // check: [loopGuard_N++; if(...) throw ...]
    ```

4. **Code Injection**
    - Counter variable inserted before loop
    - Safety checks inserted at loop body start
    - Single-statement bodies wrapped in blocks

5. **Code Generation**
    ```javascript
    const result = recast.print(guardedTree).code;
    ```

### Loop Detection Algorithm

```javascript
function getLoopType(node: Node): LoopType | null {
  switch (node.type) {
    case 'ForStatement': return 'for';
    case 'WhileStatement': return 'while';
    case 'DoWhileStatement': return 'do-while';
    case 'ForInStatement': return 'for-in';
    case 'ForOfStatement':
      return node.await === true ? 'for-await-of' : 'for-of';
    default: return null;
  }
}
```

### Guard Generation Pattern

Each loop gets a unique guard with three components:

1. **Counter Variable**

    ```javascript
    let loopGuard_${id} = 0;
    ```

2. **Increment Statement**

    ```javascript
    loopGuard_${id}++;
    ```

3. **Safety Check**
    ```javascript
    if (loopGuard_${id} > ${max}) {
      throw new RangeError("loopGuard_${id} is greater than ${max}");
    }
    ```

### Block Statement Handling

Single-statement loop bodies are automatically wrapped:

**Input:**

```javascript
for (let i = 0; i < 10; i++) console.log(i);
```

**Transformation:**

```javascript
let loopGuard_1 = 0;
for (let i = 0; i < 10; i++) {
	loopGuard_1++;
	if (loopGuard_1 > 1000) {
		throw new RangeError('loopGuard_1 is greater than 1000');
	}
	console.log(i);
}
```

## Configuration System

### Deep Merge Behavior

The configuration system supports partial overrides:

```javascript
// Default config
const defaultConfig = {
	max: 1000,
	loops: ['for', 'while', 'do-while', 'for-of', 'for-in', 'for-await-of'],
};

// Partial override - only changes max, keeps all loop types
const config1 = config({ max: 500 });

// Selective loop types - only guards specific loops
const config2 = config({
	loops: ['for', 'while'],
});

// Complete override
const config3 = config({
	max: 100,
	loops: ['for-await-of'],
});
```

### Runtime Configuration

Configuration can be modified at runtime for different scenarios:

```javascript
// Development - lower limits, all loops
const devConfig = config({ max: 100 });

// Production - higher limits, critical loops only
const prodConfig = config({
	max: 10000,
	loops: ['while', 'do-while'], // Infinite loop prone
});

// Testing - very low limits for quick failure
const testConfig = config({ max: 10 });
```

## Error Handling Strategy

### Parse Error Recovery

```javascript
try {
	const ast = recast.parse(code);
	// ... transformation logic
} catch (error) {
	console.warn('Loop guard parsing failed:', error);
	return code; // Return original unchanged
}
```

### Graceful Degradation

- **Syntax errors** → Original code returned
- **Unsupported features** → Subset of loops protected
- **for-await-of issues** → Other loops still protected
- **Malformed AST** → Safe fallback to no protection

### Error Messages

Runtime errors include context for debugging:

```javascript
throw new RangeError('loopGuard_1 is greater than 1000');
//                    ^^^^^^^^^^ ^^^^^^^^^^^^^^^^^^^^
//                    Guard ID   Configured limit
```

## Performance Considerations

### AST Processing Overhead

- **Parse time** - O(n) where n = code size
- **Traversal time** - O(nodes) for AST walking
- **Generation time** - O(n) for code reconstruction
- **Memory usage** - Temporary AST in memory during processing

### Loop Detection Efficiency

- **Early termination** - Skips non-configured loop types
- **Single pass** - All loops processed in one traversal
- **Minimal branching** - Simple type-based dispatch
- **No recursion** - Iterative AST walking

### Runtime Performance Impact

Generated guards add minimal overhead:

- **Counter increment** - Single arithmetic operation per iteration
- **Boundary check** - Simple comparison per iteration
- **Error generation** - Only on limit exceeded (exceptional case)

## Integration Patterns

### With Format Lens

```javascript
// Format after adding guards
await pipe(snippet, [loopGuard.lens, format.lens]);

// Or format before (preserves guard formatting)
await pipe(snippet, [format.lens, loopGuard.lens]);
```

### With JSX Demo Lens

```javascript
// Transform then visualize
await pipe(snippet, [
	loopGuard.lens,
	jsxDemo, // Shows protected code with visual annotations
]);
```

### With Multiple Guards

```javascript
// Different protection levels for different contexts
const strictGuards = loopGuard.config({ max: 10 });
const looseGuards = loopGuard.config({ max: 100000 });

// Apply based on code context
const guards = isUserCode ? strictGuards : looseGuards;
const result = loopGuard.lens(snippet, guards);
```

## Testing Strategy

### Unit Test Categories

1. **Loop Type Coverage** - Each of 6 loop types individually tested
2. **Configuration Tests** - Various config combinations verified
3. **Edge Cases** - Empty code, malformed syntax, nested loops
4. **Error Handling** - Parse failures, unsupported syntax
5. **Integration** - Pipeline behavior, lens composition

### Test Fixtures

```javascript
const testCases = {
	basicFor: 'for (let i = 0; i < 10; i++) { console.log(i); }',
	nestedLoops:
		'for (let i = 0; i < 3; i++) { for (let j = 0; j < 2; j++) { work(i, j); } }',
	singleLine: 'while (condition) doWork();',
	malformed: 'for (let i = 0 i < 10; i++) { work(); }', // Missing semicolon
	forAwaitOf:
		'async function f() { for await (const x of gen()) { process(x); } }',
};
```

### Assertion Patterns

```javascript
// Guard presence verification
expect(result.snippet.code).toContain('loopGuard_1');
expect(result.snippet.code).toContain('loopGuard_1++');
expect(result.snippet.code).toContain('if (loopGuard_1 > 1000)');

// Configuration compliance
expect(result.snippet.code).toMatch(/loopGuard_\d+ > 500/); // Custom limit

// Lens contract compliance
expect(result.view).toBeNull(); // Transform lens
expect(result.snippet.lang).toBe(originalSnippet.lang); // Metadata preserved
```

## Debugging Tools

### Debug Mode

Enable verbose logging:

```javascript
const config = loopGuard.config({
	debug: true, // If we added this feature
	max: 100,
});
```

### Guard Inspection

Examine generated guards:

```javascript
const result = loopGuard.lens(snippet, config);
const guardCount = (result.snippet.code.match(/loopGuard_/g) || []).length / 3;
console.log(`Generated ${guardCount} loop guards`);
```

### AST Debugging

For development and troubleshooting:

```javascript
// Access to utility functions for debugging
import { countLoops, isLoopNode } from './utils/ast-transform.js';

const loopCount = countLoops(snippet.code);
console.log(`Found ${loopCount} loops in code`);
```

## Extension Points

### Custom Loop Types

To support new loop constructs, extend the `getLoopType` function:

```javascript
function getLoopType(node: Node): LoopType | null {
  switch (node.type) {
    // ... existing cases
    case 'CustomLoopType':
      return 'custom-loop';
    default:
      return null;
  }
}
```

### Custom Guard Patterns

Modify `generateLoopGuard` for different safety mechanisms:

```javascript
const generateLoopGuard = (id: number, max: number) => {
  // Custom counter logic
  // Custom error handling
  // Custom messaging
};
```

### Alternative Parsers

Replace recast with different AST libraries:

```javascript
// Using @babel/parser instead of recast
import { parse } from '@babel/parser';
import generate from '@babel/generator';
```

This technical documentation provides the complete implementation details needed for maintenance, extension, and integration of the loop-guard lens.

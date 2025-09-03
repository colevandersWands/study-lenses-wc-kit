# Format Lens Usage Guide

This guide provides comprehensive examples and patterns for using the Format lens effectively in various scenarios.

## Quick Start

```typescript
import sl from 'study-lenses-wc-kit';

// Basic formatting with classic defaults
const snippet = {
  code: 'const x=1;if(x>0){console.log("positive");}',
  lang: 'js',
  test: false
};

const result = await sl.lenses.format.lens(snippet);
console.log(result.snippet.code);
// Output:
// const x = 1;
// if (x > 0) {
// 	console.log("positive");
// }
```

## Configuration Patterns

### Classic Professional Style (Default)

The Format lens uses classic, conservative defaults suitable for professional codebases:

```typescript
const classicResult = await sl.lenses.format.lens(snippet);
// Uses: tabs, double quotes, no trailing commas, always parentheses
```

### Modern Team Standards

#### Airbnb Style Guide

```typescript
const airbnbConfig = sl.lenses.format.config({
  useTabs: false,
  tabWidth: 2,
  singleQuote: true,
  trailingComma: 'all',
  arrowParens: 'avoid'
});

const airbnbResult = await sl.lenses.format.lens(snippet, airbnbConfig);
```

#### Google JavaScript Style Guide

```typescript
const googleConfig = sl.lenses.format.config({
  useTabs: false,
  tabWidth: 2,
  singleQuote: true,
  trailingComma: 'es5'
});

const googleResult = await sl.lenses.format.lens(snippet, googleConfig);
```

#### Prettier Default Style

```typescript
const prettierConfig = sl.lenses.format.config({
  useTabs: false,
  tabWidth: 2,
  trailingComma: 'es5'
  // singleQuote: false (default)
  // arrowParens: 'always' (default)
});

const prettierResult = await sl.lenses.format.lens(snippet, prettierConfig);
```

### Custom Formatting Rules

#### Compact Style

```typescript
const compactConfig = sl.lenses.format.config({
  printWidth: 120,
  bracketSpacing: false,
  bracketSameLine: true,
  arrowParens: 'avoid'
});

// Before: const obj = { a: 1, b: 2 };
// After:  const obj = {a: 1, b: 2};
```

#### Legacy Codebase Style

```typescript
const legacyConfig = sl.lenses.format.config({
  useTabs: true,
  tabWidth: 8,
  printWidth: 120,
  semi: false,
  singleQuote: true
});

// Uses 8-space tabs, no semicolons, single quotes
```

## Language-Specific Examples

### JavaScript (Standard)

```typescript
const jsSnippet = {
  code: 'function hello(name){return`Hello, ${name}!`;}',
  lang: 'js',
  test: false
};

const jsResult = await sl.lenses.format.lens(jsSnippet);
// Output: function hello(name) {
//   return `Hello, ${name}!`;
// }
```

### ES Modules

```typescript
const moduleSnippet = {
  code: 'import{Component}from"react";export default function App(){return<div>Hello</div>;}',
  lang: 'mjs',
  test: false
};

const moduleResult = await sl.lenses.format.lens(moduleSnippet);
// Output: import { Component } from "react";
//         export default function App() {
//           return <div>Hello</div>;
//         }
```

### TypeScript

```typescript
const tsSnippet = {
  code: 'interface User{name:string;age?:number;}const user:User={name:"John"};',
  lang: 'ts',
  test: false
};

const tsResult = await sl.lenses.format.lens(tsSnippet);
// Output: interface User {
//           name: string;
//           age?: number;
//         }
//         const user: User = { name: "John" };
```

### JSX Components

```typescript
const jsxSnippet = {
  code: 'const Button=({onClick,children})=><button onClick={onClick} className="btn">{children}</button>;',
  lang: 'jsx',
  test: false
};

const jsxResult = await sl.lenses.format.lens(jsxSnippet);
// Output: const Button = ({ onClick, children }) => (
//           <button onClick={onClick} className="btn">
//             {children}
//           </button>
//         );
```

## Pipeline Usage Patterns

### Sequential Formatting and Transformation

```typescript
// Format → transform → format again
const result = await sl.study.pipe(snippet, [
  sl.lenses.format,           // Clean up initial formatting
  sl.lenses.reverse,          // Apply transformation
  [sl.lenses.format, {        // Reformat with custom style
    singleQuote: true,
    trailingComma: 'es5'
  }]
]);
```

### Before/After Code Analysis

```typescript
// Compare original vs formatted code
const original = snippet.code;
const formatted = await sl.study.pipe(snippet, [sl.lenses.format]);

console.log('Original:', original);
console.log('Formatted:', formatted.snippet.code);
console.log('Improvement:', formatted.snippet.code.length < original.length ? 'More compact' : 'More readable');
```

### Multi-Stage Processing

```typescript
// Complex transformation pipeline
const result = await sl.study.pipe(snippet, [
  // 1. Initial cleanup
  sl.lenses.format,
  
  // 2. Apply transformations
  customTransformLens,
  
  // 3. Final formatting with team standards
  [sl.lenses.format, teamConfig],
  
  // 4. Optional uppercase for emphasis
  sl.lenses.uppercase
]);
```

## Error Handling Examples

### Malformed Code

```typescript
const malformedSnippet = {
  code: 'const x = {{{ invalid syntax here',
  lang: 'js',
  test: false
};

const result = await sl.lenses.format.lens(malformedSnippet);
// Output: const x = {{{ invalid syntax here
//         // Unable to format code - check console for details
```

### Empty or Whitespace Code

```typescript
const emptySnippet = { code: '', lang: 'js', test: false };
const whitespaceSnippet = { code: '   \n  \t  ', lang: 'js', test: false };

const emptyResult = await sl.lenses.format.lens(emptySnippet);
const whitespaceResult = await sl.lenses.format.lens(whitespaceSnippet);

// Both return original code unchanged
console.log(emptyResult.snippet.code); // ''
console.log(whitespaceResult.snippet.code); // '   \n  \t  '
```

### Robust Pipeline Error Handling

```typescript
const robustPipeline = async (snippet) => {
  try {
    return await sl.study.pipe(snippet, [
      sl.lenses.format,
      someOtherLens,
      [sl.lenses.format, finalConfig]
    ]);
  } catch (error) {
    console.error('Pipeline failed:', error);
    // Fallback to just formatting
    return await sl.lenses.format.lens(snippet);
  }
};
```

## Advanced Configuration Techniques

### Dynamic Configuration Based on Language

```typescript
const getConfigForLanguage = (lang: string) => {
  const baseConfig = sl.lenses.format.config();
  
  switch (lang) {
    case 'ts':
    case 'tsx':
      return sl.lenses.format.config({
        ...baseConfig,
        singleQuote: true,
        trailingComma: 'all'
      });
    
    case 'jsx':
      return sl.lenses.format.config({
        ...baseConfig,
        jsxSingleQuote: true,
        bracketSameLine: false
      });
    
    default:
      return baseConfig;
  }
};

const adaptiveResult = await sl.lenses.format.lens(
  snippet, 
  getConfigForLanguage(snippet.lang)
);
```

### Configuration Composition

```typescript
const createTeamConfig = (overrides = {}) => {
  const teamStandards = {
    useTabs: false,
    tabWidth: 2,
    singleQuote: true,
    trailingComma: 'es5'
  };
  
  return sl.lenses.format.config({
    ...teamStandards,
    ...overrides
  });
};

// Different team preferences
const frontendConfig = createTeamConfig({ printWidth: 100 });
const backendConfig = createTeamConfig({ printWidth: 120, semi: false });
```

### Conditional Formatting

```typescript
const formatIfNeeded = async (snippet, threshold = 100) => {
  // Only format if code is above length threshold
  if (snippet.code.length < threshold) {
    return { snippet, view: null };
  }
  
  return await sl.lenses.format.lens(snippet);
};

const smartFormatLens = async (snippet, config) => {
  const compactConfig = sl.lenses.format.config({
    ...config,
    printWidth: 120,
    bracketSpacing: false
  });
  
  return await sl.lenses.format.lens(snippet, compactConfig);
};
```

## Testing and Validation

### Unit Test Patterns

```typescript
// Test custom configuration
const testConfig = sl.lenses.format.config({
  singleQuote: true,
  useTabs: false,
  tabWidth: 2
});

const testSnippet = {
  code: 'const msg="hello world";',
  lang: 'js',
  test: false
};

const result = await sl.lenses.format.lens(testSnippet, testConfig);

// Verify formatting applied correctly
expect(result.snippet.code).toContain("'hello world'"); // Single quotes
expect(result.snippet.code).toMatch(/  /); // 2-space indentation
expect(result.view).toBeNull(); // Transform-only lens
```

### Integration Testing

```typescript
// Test in pipeline context
const pipelineTest = async () => {
  const input = { code: 'const x=1;const y=2;', lang: 'js', test: false };
  
  const result = await sl.study.pipe(input, [
    sl.lenses.format,
    customLens,
    [sl.lenses.format, { printWidth: 40 }]
  ]);
  
  // Verify pipeline completes successfully
  expect(result.snippet.code).toBeDefined();
  expect(result.view).toBeDefined(); // Final lens might have view
};
```

## Performance Optimization

### Batch Processing

```typescript
const formatMultipleSnippets = async (snippets, config) => {
  const results = await Promise.all(
    snippets.map(snippet => 
      sl.lenses.format.lens(snippet, config)
    )
  );
  
  return results;
};

// Process array of snippets efficiently
const configs = snippets.map(s => getConfigForLanguage(s.lang));
const results = await Promise.all(
  snippets.map((snippet, i) => 
    sl.lenses.format.lens(snippet, configs[i])
  )
);
```

### Configuration Reuse

```typescript
// Reuse configuration objects for better performance
const sharedConfig = sl.lenses.format.config({
  useTabs: false,
  singleQuote: true,
  trailingComma: 'es5'
});

// Use same config for multiple operations
const results = await Promise.all([
  sl.lenses.format.lens(snippet1, sharedConfig),
  sl.lenses.format.lens(snippet2, sharedConfig),
  sl.lenses.format.lens(snippet3, sharedConfig)
]);
```

## Common Pitfalls and Solutions

### Issue: Wrong Parser Selected

```typescript
// Problem: TypeScript interface formatted as JavaScript
const tsSnippet = { code: 'interface User { name: string; }', lang: 'typescript', test: false };

// Solution: Ensure correct language identifier
const correctedSnippet = { ...tsSnippet, lang: 'ts' }; // Use 'ts', not 'typescript'

// Or override parser explicitly
const result = await sl.lenses.format.lens(tsSnippet, 
  sl.lenses.format.config({ parser: 'typescript' })
);
```

### Issue: Configuration Not Applied

```typescript
// Problem: Expecting spaces but getting tabs
const config = { useTabs: false }; // Wrong: not using config factory

// Solution: Always use config factory
const correctConfig = sl.lenses.format.config({ useTabs: false });
const result = await sl.lenses.format.lens(snippet, correctConfig);
```

### Issue: Formatting Fails Silently

```typescript
// Problem: Not checking for error comments
const result = await sl.lenses.format.lens(malformedSnippet);

// Solution: Check for error indicators
if (result.snippet.code.includes('// Unable to format code')) {
  console.log('Formatting failed, check original code for syntax errors');
}
```

## Best Practices

1. **Always Use Config Factory**: Use `sl.lenses.format.config()` for consistent behavior
2. **Test with Edge Cases**: Verify behavior with empty, malformed, and complex code
3. **Check Language Support**: Ensure `snippet.lang` is set correctly
4. **Handle Errors Gracefully**: Format failures shouldn't break your application
5. **Reuse Configurations**: Create shared config objects for better performance
6. **Document Team Standards**: Make formatting rules explicit and consistent
7. **Pipeline Placement**: Format early in pipelines to clean up input code

This guide covers the most common usage patterns. For implementation details, see [DOCS.md](./DOCS.md).
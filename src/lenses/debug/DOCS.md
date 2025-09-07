# Debugger Lens Technical Documentation

## Architecture Overview

The Debugger Lens is implemented as a **transform-only lens** that modifies code snippets by wrapping them with language-appropriate debugging statements. It follows the Study Lenses WC-Kit functional/procedural architecture patterns.

## Core Components

### 1. Lens Function (`lens.ts`)

The main transformation logic that detects programming languages and applies appropriate debugging wrappers.

```typescript
export const lens = (snippet: Snippet, config = _config()): LensOutput => {
  if (!config.enabled) {
    return { snippet, ui: null };
  }

  const wrappedCode = wrapWithDebugger(snippet.code, snippet.lang, config);
  
  return {
    snippet: { ...snippet, code: wrappedCode },
    ui: null, // Transform-only lens
  };
};
```

**Key Features:**
- **Language Detection**: Case-insensitive matching on `snippet.lang`
- **Configurable Wrapping**: Supports custom prefix/suffix or language defaults
- **Immutable Operations**: Returns new snippet object without mutating input
- **Transform-Only**: Always returns `ui: null` as this is a code transformation lens

### 2. Configuration System (`config.ts`)

Factory-based configuration with deep merge support for flexible overrides.

```typescript
const defaultConfig = {
  enabled: true,
  customPrefix: null,
  customSuffix: null,
  lineSpacing: 3,
};

export const config = (overrides = {}) => deepMerge(defaultConfig, overrides);
```

**Configuration Properties:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Master switch for debugger injection |
| `customPrefix` | `string \| null` | `null` | Override language-specific prefix |
| `customSuffix` | `string \| null` | `null` | Override language-specific suffix |
| `lineSpacing` | `number` | `3` | Blank lines before/after code |

### 3. Web Component (`wc.ts`)

Minimal wrapper component that parses HTML attributes and delegates to the lens function.

```typescript
export const register = () => {
  const tagName = `sl-lens-${name}`;
  if (!customElements.get(tagName)) {
    const wc = createLensElement(name, lens);
    customElements.define(tagName, wc);
  }
  return tagName;
};
```

**Supported Attributes:**
- `code` - Inline code or file path
- `src` - File path to load code from
- `lang` - Language override (optional, auto-detected from extension)
- `config` - JSON configuration string

## Language Processing Logic

### Language Detection Algorithm

```typescript
const detectLanguage = (lang: string): LanguageInfo => {
  const normalized = lang.toLowerCase();
  
  // JavaScript variants
  if (['js', 'javascript', 'mjs', 'ts', 'typescript', 'tsx'].includes(normalized)) {
    return { type: 'javascript', style: 'c-style' };
  }
  
  // Python
  if (['python', 'py'].includes(normalized)) {
    return { type: 'python', style: 'python' };
  }
  
  // C-style languages with comments
  if (['java', 'c', 'cpp', 'cxx', 'c++', 'go', 'rust', 'rs'].includes(normalized)) {
    return { type: 'c-style', style: 'comment' };
  }
  
  // Ruby
  if (['ruby', 'rb'].includes(normalized)) {
    return { type: 'ruby', style: 'hash-comment' };
  }
  
  // Default fallback
  return { type: 'javascript', style: 'c-style' };
};
```

### Wrapping Strategies

#### JavaScript/TypeScript Style
```
/* ----------------------------- */
debugger;
[spacing]
[code]
[spacing]
/* ----------------------------- */
debugger;
```

#### Python Style
```
# ----------------------------- #
import pdb; pdb.set_trace()
[spacing]
[code]  
[spacing]
# ----------------------------- #
import pdb; pdb.set_trace()
```

#### Comment-Based Languages
```
/* ----------------------------- */
// Add breakpoint here
[spacing]
[code]
[spacing]
/* ----------------------------- */
// Add breakpoint here
```

#### Ruby Style
```
# ----------------------------- #
# Add breakpoint here
[spacing]
[code]
[spacing] 
# ----------------------------- #
# Add breakpoint here
```

### Custom Prefix/Suffix Logic

When `customPrefix` or `customSuffix` is provided in configuration:

```typescript
if (config.customPrefix || config.customSuffix) {
  const prefix = config.customPrefix || '';
  const suffix = config.customSuffix || '';
  const spacing = '\n'.repeat(config.lineSpacing);
  
  return `${prefix}${spacing}${code}${spacing}${suffix}`;
}
```

This completely overrides language-specific wrapping, allowing for custom debugging markers.

## Error Handling

### Language Processing Errors

- **Unknown languages**: Gracefully fall back to JavaScript-style `debugger;` statements
- **Invalid configuration**: Deep merge handles malformed config objects
- **Empty code**: Processes empty strings without errors
- **Missing language**: Defaults to JavaScript when `snippet.lang` is undefined

### Configuration Validation

```typescript
// Handles undefined, null, and malformed config objects
const safeConfig = config(userConfig || {});

// Type-safe property access with defaults
const enabled = safeConfig.enabled !== false; // Defaults to true
const lineSpacing = typeof safeConfig.lineSpacing === 'number' 
  ? safeConfig.lineSpacing 
  : 3;
```

## Performance Characteristics

### Computational Complexity
- **Time Complexity**: O(n) where n = code length (single string concatenation)
- **Space Complexity**: O(n) for output string creation
- **Language Detection**: O(1) with hash map lookup

### Memory Usage
- **Input Preservation**: Original snippet object is never mutated
- **Minimal Allocation**: Only creates new code string and snippet wrapper
- **Configuration Caching**: Config factory can be called multiple times efficiently

### Optimization Notes
- **String Operations**: Uses template literals for efficient concatenation
- **Early Return**: Disabled configuration bypasses all processing
- **Immutable Updates**: Spread operator for efficient object copying

## Testing Strategy

### Unit Test Coverage (`lens.spec.ts`)

- **Language Detection**: All supported languages with case variations
- **Wrapping Formats**: Verify correct debugger statement insertion
- **Configuration Options**: Test all config permutations
- **Edge Cases**: Empty code, unknown languages, malformed input
- **Immutability**: Ensure original snippet is never modified

### Configuration Testing (`config.spec.ts`)

- **Default Behavior**: Factory returns correct defaults
- **Deep Merge**: Nested configuration override scenarios
- **Type Safety**: Handle undefined, null, and invalid values
- **Isolation**: Multiple config calls don't interfere

### Interactive Testing (`wc.test.html`)

- **Visual Verification**: Browser-based testing with live examples
- **Attribute Parsing**: Test `code`, `src`, `lang`, `config` attributes
- **Language Samples**: Real code examples for each supported language
- **Configuration UI**: Interactive config testing with various options

## Integration Points

### Study Lenses Pipeline

```typescript
// Transform-only lens in pipeline
await pipe(snippet, [reverse.lens, debugger.lens, uppercase.lens]);
// Each lens transforms the code sequentially

// Terminal lens in pipeline  
await pipe(snippet, [debugger.lens, jsxDemo]);
// Pipeline stops at jsxDemo view, debugger transformation is preserved
```

### Web Component System

```html
<!-- Declarative usage -->
<sl-lens-debugger code="console.log('test')"></sl-lens-debugger>

<!-- Programmatic usage -->
<script>
  import { register } from './debugger/wc.js';
  const tagName = register(); // Returns 'sl-lens-debugger'
  
  const element = document.createElement(tagName);
  element.setAttribute('code', 'console.log("dynamic")');
  document.body.appendChild(element);
</script>
```

### Configuration Patterns

```typescript
// Library integration
import debugger from './lenses/debugger/index.js';

// Default usage
const result1 = debugger.lens(snippet);

// Configured usage
const customConfig = debugger.config({ 
  lineSpacing: 1,
  customPrefix: '>>> START DEBUG <<<' 
});
const result2 = debugger.lens(snippet, customConfig);

// Web component configuration
document.querySelector('sl-lens-debugger').setAttribute('config', 
  JSON.stringify({ enabled: false })
);
```

## Extension Points

### Adding New Languages

1. **Extend Language Detection:**
```typescript
// Add to detectLanguage function
if (['kotlin', 'kt'].includes(normalized)) {
  return { type: 'kotlin', style: 'c-style' };
}
```

2. **Add Language-Specific Logic:**
```typescript
case 'kotlin':
  return createWrapper(code, '// DEBUG START', '// DEBUG END', config.lineSpacing);
```

3. **Update Tests:**
- Add language detection test cases
- Add formatting verification tests
- Update interactive HTML examples

### Custom Debugging Strategies

```typescript
// Example: Add conditional debugging
const conditionalWrapper = (code: string, condition: string) => {
  return `if (${condition}) { debugger; }\n${code}\nif (${condition}) { debugger; }`;
};

// Example: Add logging integration
const loggingWrapper = (code: string, logLevel: string) => {
  return `console.${logLevel}('DEBUG START');\n${code}\nconsole.${logLevel}('DEBUG END');`;
};
```

### Configuration Extensions

```typescript
// Extended configuration interface
interface ExtendedDebuggerConfig extends DebuggerConfig {
  logLevel?: 'debug' | 'info' | 'warn';
  conditional?: string;
  timestamp?: boolean;
}

// Enhanced config factory
const enhancedConfig = (overrides = {}) => deepMerge({
  ...defaultConfig,
  logLevel: 'debug',
  conditional: null,
  timestamp: false,
}, overrides);
```

## Dependencies

### Internal Dependencies
- `../../utils/deep-merge.js` - Configuration merging
- `../../types.js` - TypeScript interfaces
- `../../web-components/create-lens-element.js` - Component factory

### External Dependencies
None. The debugger lens is completely self-contained with no external library dependencies.

## Browser Compatibility

- **ES2018+**: Uses object spread syntax
- **Template Literals**: ES6 template string support required
- **Web Components**: Custom elements support (polyfill available)
- **No Transpilation**: Pure TypeScript/JavaScript, no build step required

## Migration Guide

### From Manual Debugger Insertion

**Before:**
```javascript
// Manual insertion
debugger;
console.log('Hello, World!');  
debugger;
```

**After:**
```html
<sl-lens-debugger code="console.log('Hello, World!')"></sl-lens-debugger>
```

### From Language-Specific Tools

**Python: From pdb manual insertion:**
```python
# Before
import pdb; pdb.set_trace()
print('Hello, World!')
import pdb; pdb.set_trace()
```

```html
<!-- After -->
<sl-lens-debugger code="print('Hello, World!')" lang="python"></sl-lens-debugger>
```

**Java: From IDE breakpoints to portable comments:**
```html
<!-- Generates portable breakpoint comments -->
<sl-lens-debugger 
  code="System.out.println('Hello, World!');" 
  lang="java"></sl-lens-debugger>
```

This documentation provides comprehensive technical details for maintainers, contributors, and advanced users of the Debugger Lens.
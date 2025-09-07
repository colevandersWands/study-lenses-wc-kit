# Debugger Lens Developer Guide

A step-by-step guide for using the Debugger Lens in educational and development contexts.

## Quick Start

### 1. Basic HTML Usage

The simplest way to add debugging statements to your code:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Debugger Lens Demo</title>
</head>
<body>
  <!-- JavaScript example -->
  <sl-lens-debugger code="console.log('Hello, World!')"></sl-lens-debugger>
  
  <!-- Python example -->
  <sl-lens-debugger 
    code="print('Hello, World!')" 
    lang="python"></sl-lens-debugger>
  
  <!-- Load from file -->
  <sl-lens-debugger src="./my-script.js"></sl-lens-debugger>
  
  <script type="module">
    // Register the component
    import './path/to/study-lenses/register.js';
  </script>
</body>
</html>
```

### 2. JavaScript/Library Integration

```javascript
import debugger from './lenses/debugger/index.js';

// Transform some code
const snippet = { 
  code: 'function greet(name) { return `Hello, ${name}!`; }', 
  lang: 'js', 
  test: false 
};

const result = debugger.lens(snippet);
console.log(result.snippet.code);
/* Output:
/* ----------------------------- */
debugger;



function greet(name) { return `Hello, ${name}!`; }



/* ----------------------------- */
debugger;
*/
```

## Common Use Cases

### 1. Educational Debugging

**Teaching breakpoints and debugging concepts:**

```html
<div class="lesson">
  <h3>Learning JavaScript Debugging</h3>
  <p>The browser debugger statement pauses execution:</p>
  
  <sl-lens-debugger code="
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

console.log(factorial(5));
  "></sl-lens-debugger>
  
  <p>Open browser dev tools and run this code to step through execution.</p>
</div>
```

### 2. Multi-Language Code Comparison

**Show debugging in different languages:**

```html
<div class="language-comparison">
  <div class="language-example">
    <h4>JavaScript</h4>
    <sl-lens-debugger 
      code="function fibonacci(n) { return n < 2 ? n : fibonacci(n-1) + fibonacci(n-2); }"
      lang="js"></sl-lens-debugger>
  </div>
  
  <div class="language-example">
    <h4>Python</h4>
    <sl-lens-debugger 
      code="def fibonacci(n): return n if n < 2 else fibonacci(n-1) + fibonacci(n-2)"
      lang="python"></sl-lens-debugger>
  </div>
  
  <div class="language-example">
    <h4>Java</h4>
    <sl-lens-debugger 
      code="public static int fibonacci(int n) { return n < 2 ? n : fibonacci(n-1) + fibonacci(n-2); }"
      lang="java"></sl-lens-debugger>
  </div>
</div>
```

### 3. Development Workflow Integration

**Transform code files for debugging:**

```javascript
// Build script example
import fs from 'fs';
import debugger from './lenses/debugger/index.js';

const sourceCode = fs.readFileSync('./src/algorithm.js', 'utf8');
const snippet = { code: sourceCode, lang: 'js', test: false };

// Add debugging for development build
const debugConfig = debugger.config({ 
  lineSpacing: 1,  // Compact for development
  enabled: process.env.NODE_ENV === 'development' 
});

const debuggedCode = debugger.lens(snippet, debugConfig).snippet.code;
fs.writeFileSync('./dist/algorithm.debug.js', debuggedCode);
```

## Configuration Recipes

### 1. Disabled for Production

```html
<!-- Only add debuggers in development -->
<sl-lens-debugger 
  code="performanceOptimizedFunction();"
  config='{"enabled": false}'></sl-lens-debugger>
```

```javascript
// Dynamic configuration based on environment
const isDev = process.env.NODE_ENV === 'development';
const config = debugger.config({ enabled: isDev });
```

### 2. Custom Debug Markers

```html
<!-- Use custom markers instead of language defaults -->
<sl-lens-debugger 
  code="criticalBusinessLogic();"
  config='{
    "customPrefix": "=== CRITICAL SECTION START ===",
    "customSuffix": "=== CRITICAL SECTION END ===",
    "lineSpacing": 2
  }'></sl-lens-debugger>
```

### 3. Compact Mode

```html
<!-- Minimal spacing for code-dense examples -->
<sl-lens-debugger 
  code="let result = processData(input);"
  config='{"lineSpacing": 0}'></sl-lens-debugger>
```

### 4. Documentation Mode

```html
<!-- Clear debugging instructions for tutorials -->
<sl-lens-debugger 
  code="fetchUserData(userId).then(render);"
  config='{
    "customPrefix": "// 👆 Set breakpoint here to inspect network requests",
    "customSuffix": "// 👆 Set breakpoint here to inspect rendering data",
    "lineSpacing": 1
  }'></sl-lens-debugger>
```

## Language-Specific Guides

### JavaScript & TypeScript

**Effective for:**
- Browser debugging with DevTools
- Node.js debugging with `--inspect`
- Understanding async/await flow
- Stepping through closures and scope

```html
<sl-lens-debugger code="
async function fetchData() {
  const response = await fetch('/api/data');
  const data = await response.json();
  return data.items.map(item => item.value);
}
" lang="js"></sl-lens-debugger>
```

**Browser Usage:**
1. Open DevTools (F12)
2. Run the generated code
3. Execution pauses at `debugger;` statements
4. Use Step Over (F10) and Step Into (F11)

### Python

**Effective for:**
- Interactive debugging with pdb
- Understanding list comprehensions
- Debugging recursive algorithms
- Inspecting data structures

```html
<sl-lens-debugger code="
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)
" lang="python"></sl-lens-debugger>
```

**Python Debugging:**
1. Run the generated code
2. When pdb breaks: use `n` (next), `s` (step), `c` (continue)
3. Use `p variable_name` to inspect variables
4. Use `l` to see current code context

### Java

**Effective for:**
- IDE breakpoint placement guides
- Teaching debugging concepts
- Code review preparation
- Student lab exercises

```html
<sl-lens-debugger code="
public class BinarySearch {
    public static int search(int[] arr, int target) {
        int left = 0, right = arr.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (arr[mid] == target) return mid;
            if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
}
" lang="java"></sl-lens-debugger>
```

**IDE Integration:**
1. Copy the generated code to your IDE
2. Click in the gutter next to "Add breakpoint here" comments
3. Run in debug mode
4. Use IDE debugging controls

## Teaching Workflows

### 1. Debugging Concepts Course

```html
<div class="lesson-plan">
  <h2>Lesson 3: Introduction to Debugging</h2>
  
  <div class="concept">
    <h3>What are breakpoints?</h3>
    <p>Breakpoints pause program execution so you can inspect the current state.</p>
    
    <sl-lens-debugger code="
let count = 0;
for (let i = 0; i < 5; i++) {
  count += i;
  console.log(`Step ${i}: count = ${count}`);
}
console.log(`Final count: ${count}`);
    " lang="js"></sl-lens-debugger>
  </div>
  
  <div class="exercise">
    <h3>Try it yourself:</h3>
    <ol>
      <li>Copy the code above into browser console</li>
      <li>Open DevTools debugger tab</li>
      <li>Watch how `count` changes at each step</li>
      <li>Use "Step Over" to advance one line at a time</li>
    </ol>
  </div>
</div>
```

### 2. Algorithm Visualization Prep

```html
<div class="algorithm-study">
  <h2>Binary Search Step-by-Step</h2>
  
  <!-- Prepare code for step-through -->
  <sl-lens-debugger 
    config='{"lineSpacing": 1}'
    code="
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1;
}

// Test with sample data
const numbers = [1, 3, 5, 7, 9, 11, 13, 15];
const result = binarySearch(numbers, 7);
console.log('Found at index:', result);
    "></sl-lens-debugger>
  
  <div class="debugging-tips">
    <h3>Debugging Strategy:</h3>
    <ul>
      <li>Watch how `left`, `right`, and `mid` change</li>
      <li>Notice the search space halving each iteration</li>
      <li>Observe the comparison logic at each step</li>
    </ul>
  </div>
</div>
```

### 3. Code Review Sessions

```html
<div class="code-review">
  <h2>Code Review: Potential Bug Investigation</h2>
  
  <!-- Add debugging to suspicious code -->
  <sl-lens-debugger 
    config='{
      "customPrefix": "// 🔍 REVIEW POINT: Check variable state here",
      "customSuffix": "// 🔍 REVIEW POINT: Verify result correctness",
      "lineSpacing": 1
    }'
    code="
function calculateDiscount(price, discountPercent) {
  // Potential issue: what if discountPercent > 100?
  const discount = price * (discountPercent / 100);
  return price - discount;
}
    "></sl-lens-debugger>
  
  <div class="review-questions">
    <h3>Review Questions:</h3>
    <ul>
      <li>What happens with negative discount percentages?</li>
      <li>How does this handle discount percentages over 100%?</li>
      <li>Are there any edge cases we should test?</li>
    </ul>
  </div>
</div>
```

## Advanced Patterns

### 1. Conditional Debugging

```javascript
// Custom wrapper for conditional debugging
function createConditionalDebugger(condition) {
  return debugger.config({
    customPrefix: `if (${condition}) { debugger; }`,
    customSuffix: `if (${condition}) { debugger; }`,
    lineSpacing: 1
  });
}

// Usage
const debugOnError = createConditionalDebugger('error !== null');
const result = debugger.lens(snippet, debugOnError);
```

### 2. Integration with Testing

```html
<!-- Debug failing tests -->
<div class="test-debugging">
  <h3>Test: User Authentication</h3>
  
  <sl-lens-debugger 
    config='{"lineSpacing": 2}'
    code="
function authenticateUser(username, password) {
  // Test is failing here - need to debug
  const user = findUser(username);
  if (!user) return { success: false, error: 'User not found' };
  
  const isValid = validatePassword(password, user.hashedPassword);
  if (!isValid) return { success: false, error: 'Invalid password' };
  
  return { success: true, token: generateToken(user.id) };
}

// Failing test case
const result = authenticateUser('testuser', 'wrongpassword');
console.log('Test result:', result);
    " lang="js"></sl-lens-debugger>
</div>
```

### 3. Performance Debugging

```html
<sl-lens-debugger 
  config='{
    "customPrefix": "console.time(\"performance-check\"); debugger;",
    "customSuffix": "debugger; console.timeEnd(\"performance-check\");",
    "lineSpacing": 1
  }'
  code="
function expensiveOperation(data) {
  // Performance bottleneck investigation
  return data.map(item => {
    return processComplexCalculation(item);
  }).filter(result => result !== null);
}
  "></sl-lens-debugger>
```

## Troubleshooting

### Common Issues

**1. Debugger statements not triggering:**
- Ensure browser DevTools are open
- Check that JavaScript execution isn't disabled
- Verify the code is actually running (check console for errors)

**2. Python pdb not working:**
- Make sure you're running Python interactively or with proper terminal
- Check that `pdb` module is available in your Python environment
- Use `python -i script.py` for interactive debugging

**3. Wrong language detection:**
```html
<!-- Force language detection -->
<sl-lens-debugger 
  code="puts 'Hello, Ruby!'" 
  lang="ruby"></sl-lens-debugger>
```

**4. Configuration not applying:**
```html
<!-- Verify JSON syntax -->
<sl-lens-debugger 
  code="test();"
  config='{"enabled": true, "lineSpacing": 1}'></sl-lens-debugger>
```

### Browser Compatibility

- **Chrome/Edge**: Full support for `debugger;` statements
- **Firefox**: Full support with DevTools
- **Safari**: Requires Web Inspector to be open
- **Mobile browsers**: Limited debugging capabilities

### Best Practices

1. **Keep debugger-wrapped code temporary** - Remove before production
2. **Use meaningful variable names** when debugging to make inspection easier
3. **Combine with console.log()** for additional context
4. **Document debugging intent** with comments
5. **Test in multiple browsers** if targeting cross-browser compatibility

## Next Steps

- **Explore other Study Lenses** - Combine with formatting, tracing, and visualization lenses
- **Create custom configurations** - Build reusable config presets for your use cases
- **Integrate with your workflow** - Add to build scripts, documentation, or teaching materials
- **Contribute improvements** - Submit language support or feature requests

For more advanced usage and customization, see the [Technical Documentation](./DOCS.md).

Happy debugging! 🐛→✨
# Loop Guard Lens - Developer Guide

## Quick Start

### Installation

The loop-guard lens is included with Study Lenses WC-Kit:

```bash
npm install study-lenses-wc-kit
```

### Basic Usage

```javascript
import sl from 'study-lenses-wc-kit';

// Get the loop-guard lens
const loopGuard = sl.lenses['loop-guard'];

// Transform code with default settings
const snippet = {
	code: 'while (true) { console.log("infinite!"); }',
	lang: 'javascript',
	test: false,
};

const result = loopGuard.lens(snippet);
console.log(result.snippet.code);
// Output includes loop guards to prevent infinite execution
```

### Web Component Usage

```html
<!DOCTYPE html>
<html>
	<head>
		<title>Loop Guard Example</title>
	</head>
	<body>
		<!-- Protect dangerous loop code -->
		<sl-lens-loop-guard>
			for (let i = 0; i < Infinity; i++) { console.log("This would crash
			the browser!"); }
		</sl-lens-loop-guard>

		<script type="module">
			import 'study-lenses-wc-kit/register.js';
		</script>
	</body>
</html>
```

## Common Use Cases

### 1. Educational Coding Environments

Protect student code in interactive tutorials:

```javascript
// Tutorial step: demonstrate while loops
const studentCode = `
let count = 0;
while (count < 5) {
  console.log("Count:", count);
  // Student forgot to increment - infinite loop!
}
`;

const safeCode = loopGuard.lens({
	code: studentCode,
	lang: 'javascript',
	test: false,
});

// Now safe to execute in browser
eval(safeCode.snippet.code); // Will throw after 1000 iterations
```

### 2. Code Playground Safety

```html
<!-- Code editor with automatic loop protection -->
<div class="code-playground">
	<textarea id="user-code">
for (let i = 0; i < 10; i++) {
  console.log(i);
}
  </textarea
	>

	<sl-lens-loop-guard id="protected-code"></sl-lens-loop-guard>
</div>

<script>
	const textarea = document.getElementById('user-code');
	const protectedCode = document.getElementById('protected-code');

	textarea.addEventListener('input', () => {
		protectedCode.setAttribute('code', textarea.value);
	});
</script>
```

### 3. Live Coding Demos

```javascript
// Demo with configurable protection levels
const demoConfig = sl.lenses['loop-guard'].config({
	max: 50, // Quick demo limits
	loops: ['for', 'while'], // Focus on common loops
});

function runDemo(userCode) {
	const protected = sl.lenses['loop-guard'].lens(
		{ code: userCode, lang: 'js', test: false },
		demoConfig
	);

	// Safe to execute
	return new Function(protected.snippet.code)();
}
```

## Configuration Guide

### Protection Levels

Choose appropriate limits based on context:

```javascript
const configs = {
	// Strict - for untrusted user code
	strict: loopGuard.config({
		max: 100,
		loops: ['for', 'while', 'do-while', 'for-of', 'for-in', 'for-await-of'],
	}),

	// Moderate - for educational environments
	moderate: loopGuard.config({
		max: 1000, // Default
		loops: ['while', 'do-while'], // Most dangerous loops
	}),

	// Permissive - for trusted code with large datasets
	permissive: loopGuard.config({
		max: 100000,
		loops: ['while'], // Only guard obvious infinite loops
	}),
};
```

### Loop Type Selection

Target specific loop constructs:

```javascript
// Only protect async loops
const asyncOnly = loopGuard.config({
	loops: ['for-await-of'],
});

// Traditional loops only
const traditional = loopGuard.config({
	loops: ['for', 'while', 'do-while'],
});

// Modern ES6+ loops
const modern = loopGuard.config({
	loops: ['for-of', 'for-in', 'for-await-of'],
});
```

### Dynamic Configuration

Adjust protection based on code analysis:

```javascript
function getConfigForCode(code) {
	// Higher limits for simple loops
	const isSimple = !code.includes('while') && !code.includes('do');

	// More loops in educational content
	const hasComments = code.includes('//') || code.includes('/*');

	return loopGuard.config({
		max: isSimple ? 5000 : 1000,
		loops: hasComments
			? ['for', 'while', 'do-while'] // Educational focus
			: ['while', 'do-while'], // Production focus
	});
}
```

## Integration Patterns

### With Other Lenses

```javascript
import { pipe } from 'study-lenses-wc-kit';

// Common pipeline: protect → format → display
const result = await pipe(snippet, [
	sl.lenses['loop-guard'].lens,
	sl.lenses['format'].lens,
	sl.lenses['jsx-demo'], // Terminus with view
]);
```

### Error Boundary Integration

```javascript
function safeTransform(code) {
	try {
		const result = loopGuard.lens({
			code,
			lang: 'javascript',
			test: false,
		});

		return {
			success: true,
			code: result.snippet.code,
		};
	} catch (error) {
		return {
			success: false,
			error: error.message,
			fallback: code, // Original code as fallback
		};
	}
}
```

### React Integration

```jsx
import { useState, useEffect } from 'react';
import sl from 'study-lenses-wc-kit';

function CodeEditor() {
	const [userCode, setUserCode] = useState('');
	const [protectedCode, setProtectedCode] = useState('');

	useEffect(() => {
		const loopGuard = sl.lenses['loop-guard'];
		const result = loopGuard.lens({
			code: userCode,
			lang: 'javascript',
			test: false,
		});
		setProtectedCode(result.snippet.code);
	}, [userCode]);

	return (
		<div>
			<textarea
				value={userCode}
				onChange={(e) => setUserCode(e.target.value)}
				placeholder="Enter JavaScript code..."
			/>
			<pre>{protectedCode}</pre>
		</div>
	);
}
```

## Advanced Techniques

### Custom Guard Messages

While the lens uses standard guard patterns, you can post-process for custom messages:

```javascript
function customizeGuards(protectedCode, context) {
	return protectedCode.replace(
		/throw new RangeError\("loopGuard_(\d+) is greater than (\d+)"\)/g,
		`throw new RangeError("Loop protection activated in ${context} - iteration limit ($2) exceeded")`
	);
}

const result = loopGuard.lens(snippet);
const customized = customizeGuards(result.snippet.code, 'Tutorial Step 3');
```

### Performance Monitoring

Track guard effectiveness:

```javascript
class LoopGuardMonitor {
	constructor() {
		this.protectedLoops = 0;
		this.triggeredGuards = 0;
	}

	wrapWithMonitoring(protectedCode) {
		// Count protected loops
		this.protectedLoops +=
			(protectedCode.match(/loopGuard_\d+/g) || []).length / 3;

		// Wrap RangeError throws to count triggers
		return protectedCode.replace(
			/throw new RangeError\(/g,
			'this.monitor.triggeredGuards++; throw new RangeError('
		);
	}

	getStats() {
		return {
			protectedLoops: this.protectedLoops,
			triggeredGuards: this.triggeredGuards,
			effectiveness: this.triggeredGuards / this.protectedLoops,
		};
	}
}
```

### Conditional Protection

Apply protection based on runtime conditions:

```javascript
function conditionalProtection(code, userLevel) {
	const configs = {
		beginner: { max: 50, loops: ['for', 'while', 'do-while'] },
		intermediate: { max: 500, loops: ['while', 'do-while'] },
		advanced: null, // No protection
	};

	const config = configs[userLevel];
	if (!config) return { code, protected: false };

	const result = loopGuard.lens({ code, lang: 'js', test: false }, config);
	return { code: result.snippet.code, protected: true };
}
```

## Testing Strategies

### Unit Testing Protected Code

```javascript
// Test that guards work correctly
describe('Protected Code Execution', () => {
	it('should prevent infinite loops', () => {
		const infiniteLoop = 'while (true) { console.log("infinite"); }';
		const protected = loopGuard.lens({
			code: infiniteLoop,
			lang: 'javascript',
			test: false,
		});

		expect(() => {
			new Function(protected.snippet.code)();
		}).toThrow(RangeError);
	});

	it('should allow finite loops', () => {
		const finiteLoop = 'for (let i = 0; i < 5; i++) { console.log(i); }';
		const protected = loopGuard.lens({
			code: finiteLoop,
			lang: 'javascript',
			test: false,
		});

		expect(() => {
			new Function(protected.snippet.code)();
		}).not.toThrow();
	});
});
```

### Integration Testing

```javascript
// Test lens pipeline behavior
describe('Pipeline Integration', () => {
	it('should work with format lens', async () => {
		const messy = 'for(let i=0;i<10;i++){console.log(i)}';

		const result = await pipe({ code: messy, lang: 'js', test: false }, [
			sl.lenses['loop-guard'].lens,
			sl.lenses['format'].lens,
		]);

		// Should have both guards and formatting
		expect(result.snippet.code).toContain('loopGuard_1');
		expect(result.snippet.code).toMatch(/for \(/); // Formatted spacing
	});
});
```

### Performance Testing

```javascript
// Benchmark guard overhead
function benchmarkGuards() {
	const testCode = `
    for (let i = 0; i < 1000; i++) {
      Math.random();
    }
  `;

	// Unprotected execution
	const start1 = performance.now();
	new Function(testCode)();
	const unprotected = performance.now() - start1;

	// Protected execution
	const protected = loopGuard.lens({
		code: testCode,
		lang: 'js',
		test: false,
	});

	const start2 = performance.now();
	new Function(protected.snippet.code)();
	const protectedTime = performance.now() - start2;

	console.log({
		unprotected: `${unprotected}ms`,
		protected: `${protectedTime}ms`,
		overhead: `${(((protectedTime - unprotected) / unprotected) * 100).toFixed(1)}%`,
	});
}
```

## Troubleshooting

### Common Issues

#### Guards Not Applied

```javascript
// Check if loop types are configured
const config = loopGuard.config();
console.log('Protected loops:', config.loops);

// Verify code contains detectable loops
const hasLoops = /\b(for|while|do)\b/.test(code);
console.log('Code has loops:', hasLoops);
```

#### Parse Errors

```javascript
// Handle parsing failures gracefully
function safeGuard(code) {
	const original = { code, lang: 'js', test: false };
	const result = loopGuard.lens(original);

	// If parsing failed, result.snippet.code === original.code
	const wasProcessed = result.snippet.code !== original.code;
	console.log('Guard applied:', wasProcessed);

	return result;
}
```

#### Performance Issues

```javascript
// For large codebases, consider selective protection
function selectiveGuard(code) {
	// Only protect if code contains risky patterns
	const riskyPatterns = [
		/while\s*\(\s*true\s*\)/, // while (true)
		/for\s*\(\s*;;\s*\)/, // for (;;)
		/do\s*{.*}\s*while\s*\(\s*true\s*\)/s, // do {} while (true)
	];

	const hasRisk = riskyPatterns.some((pattern) => pattern.test(code));

	if (hasRisk) {
		return loopGuard.lens({ code, lang: 'js', test: false });
	} else {
		return { snippet: { code, lang: 'js', test: false }, view: null };
	}
}
```

### Debugging Tips

1. **Check AST parsing** - Verify code can be parsed by recast
2. **Inspect guard counts** - Count loopGuard\_ occurrences in output
3. **Test configurations** - Verify loop types match your code
4. **Monitor execution** - Wrap guards to track trigger frequency
5. **Profile performance** - Benchmark before/after transformation

## Best Practices

### Security

- **Never trust user input** - Always apply guards to untrusted code
- **Use strict limits** - Start with low limits, increase as needed
- **Monitor execution** - Track guard triggers in production
- **Combine with timeouts** - Guards prevent infinite loops, not slow code

### Performance

- **Cache configurations** - Reuse config objects across transforms
- **Selective protection** - Only guard dangerous loop types
- **Profile overhead** - Measure guard impact on execution time
- **Consider alternatives** - Web Workers for CPU-intensive code

### Maintainability

- **Document configurations** - Explain why specific limits were chosen
- **Version control configs** - Track configuration changes over time
- **Test edge cases** - Verify behavior with malformed code
- **Monitor effectiveness** - Track how often guards trigger

### User Experience

- **Clear error messages** - Help users understand loop limits
- **Progressive limits** - Start strict, relax with user trust
- **Visual feedback** - Show when guards are applied
- **Educational context** - Explain why guards are necessary

This guide provides practical patterns for integrating loop guards into real applications, from simple educational tools to complex interactive coding environments.

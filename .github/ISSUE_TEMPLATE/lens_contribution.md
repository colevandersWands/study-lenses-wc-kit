---
name: New Lens Contribution
about: Propose or contribute a new lens for Study Lenses WC-Kit
title: '[LENS] '
labels: ['lens', 'contribution']
assignees: ''
---

## Lens Overview

**Lens Name**: `your-lens-name`
**Category**: [Transform, Visual, Hybrid, Side Effect]
**Purpose**: Brief description of what this lens does

## Educational Value

How does this lens help with code study/education?

- What concepts does it teach?
- What audience is it for? (beginners, intermediate, advanced)
- How does it fit into learning progressions?

## Functionality Description

Detailed description of what the lens does:

### Input

What kind of code/snippets work best with this lens?

### Processing

How does the lens transform or analyze the code?

### Output

What does the lens produce? (transformed code, visualization, side effects)

## API Design

### Lens Function

```typescript
// Proposed lens function signature
export const lens = async ({
	snippet,
	config,
}: LensInput): Promise<LensOutput> => {
	// Your implementation approach
};
```

### Configuration Options

```typescript
// Default configuration
const defaultConfig = {
	// Your config options
};
```

### Web Component Usage

```html
<!-- How users would use it -->
<sl-lens-your-lens-name code="example" config='{"option": "value"}'></sl-lens-name>
```

## Implementation Status

- [ ] Concept/Planning (this issue)
- [ ] Lens function implemented
- [ ] Web component wrapper
- [ ] Configuration system
- [ ] Tests written
- [ ] Documentation created
- [ ] Ready for review

## Examples

### Input Example

```javascript
// Example code that would be processed
function example() {
	return 'hello world';
}
```

### Expected Output

Describe or show what the lens would produce from the above input.

## Technical Considerations

- Dependencies needed?
- Performance considerations?
- Browser compatibility?
- Integration with existing lenses?

## Testing Strategy

How should this lens be tested?

- Unit tests for the lens function
- Web component integration tests
- Educational effectiveness tests

## Documentation Plan

- [ ] README.md with usage examples
- [ ] DOCS.md with technical details
- [ ] GUIDE.md with educational context
- [ ] Integration examples

## Related Lenses

Are there existing lenses this would work well with? Should it be part of a pipeline?

## Questions/Help Needed

What aspects would you like feedback or help with?

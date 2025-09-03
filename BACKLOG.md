# Study Lenses WC-Kit - Design Backlog

This document captures future design ideas, enhancements, and architectural considerations for the Study Lenses WC-Kit project.

## Interactive Panel Mode - User-Selectable Lens Processing

**Status**: Design Discussion  
**Priority**: Medium  
**Type**: Enhancement  

### Concept

Transform the current "Study Panel Mode" from parallel processing to an **interactive selection interface** where users choose which lens to apply to the shared code.

#### Current vs Proposed Behavior

**Current Study Panel Mode** (parallel processing):
```html
<study-lenses code="function add(a, b) { return a + b; }">
  <sl-lens-reverse></sl-lens-reverse>     <!-- All render simultaneously -->
  <sl-lens-uppercase></sl-lens-uppercase> <!-- All render simultaneously -->
  <sl-lens-format></sl-lens-format>       <!-- All render simultaneously -->
</study-lenses>
```

**Proposed Interactive Panel Mode** (user-selectable):
```html
<study-lenses code="function add(a, b) { return a + b; }">
  <sl-lens-reverse></sl-lens-reverse>     <!-- Shows as selectable button/card -->
  <sl-lens-uppercase></sl-lens-uppercase> <!-- Shows as selectable button/card -->
  <sl-lens-format></sl-lens-format>       <!-- Shows as selectable button/card -->
</study-lenses>
```

**User Experience Flow**:
1. Panel displays interactive buttons/cards for each available lens
2. User clicks "Reverse" → code gets processed by reverse lens → result displayed
3. User clicks "Format" → same original code gets processed by format lens → result displayed
4. Only one lens result shown at a time, driven by user selection

### Design Questions

#### 1. Lens Signature Extension

Current lens object structure:
```typescript
export interface LensObject {
  name: string;
  lens: LensFunction;
  view: any; // Web component class
  config: (overrides?: any) => LensConfig;
}
```

**Proposed additions for panel display**:
```typescript
export interface LensObject {
  name: string;
  lens: LensFunction;
  view: any;
  config: (overrides?: any) => LensConfig;
  
  // Panel mode display components
  button?: () => HTMLElement;           // How lens appears in selection panel
  preview?: () => HTMLElement;          // Quick preview/description for panel
  icon?: string;                        // Visual identifier (emoji or CSS class)
  description?: string;                 // Help text for panel display
  category?: string;                    // Grouping for panel organization
}
```

#### 2. Panel UI/UX Options

**Layout Patterns**:
- **Button Grid**: Like `wc-open-in` tool buttons - compact, icon-focused
- **Card Interface**: Larger cards with descriptions and previews
- **Tabbed Interface**: Browser-style tabs for different lens categories
- **Dropdown Selector**: Compact space-saving option
- **Sidebar Navigation**: Side panel with lens list

**Reference Implementation**: `../wc-open-in` already has selectable tool patterns that could be adapted.

#### 3. State Management Considerations

- **Selection Memory**: Should panel remember last selected lens across sessions?
- **Result Comparison**: Can users compare results (show previous + current)?
- **History**: Should there be a "back" button or history of applied lenses?
- **Configuration**: How to handle per-lens configuration in panel mode?

#### 4. Progressive Enhancement Strategy

```html
<!-- Fallback: traditional parallel rendering if JS disabled -->
<study-lenses code="...">
  <sl-lens-reverse></sl-lens-reverse>   <!-- Rendered by default -->
  <sl-lens-format></sl-lens-format>     <!-- Rendered by default -->
</study-lenses>

<!-- Enhanced: becomes interactive panel when JS loads -->
<script>
  // Transform to interactive panel mode
</script>
```

### Implementation Considerations

#### 1. Panel Component Structure (Conceptual)

```html
<!-- Generated panel UI structure -->
<study-lenses code="..." class="interactive-panel">
  <div class="lens-selector">
    <h3>Choose a lens to apply:</h3>
    <div class="lens-buttons">
      <button class="lens-option" data-lens="reverse">
        <span class="lens-icon">🔄</span>
        <span class="lens-label">Reverse Code</span>
        <span class="lens-description">Reverse character order</span>
      </button>
      <button class="lens-option" data-lens="format">
        <span class="lens-icon">✨</span>
        <span class="lens-label">Format Code</span>
        <span class="lens-description">Clean up formatting and style</span>
      </button>
      <button class="lens-option" data-lens="analyze">
        <span class="lens-icon">📊</span>
        <span class="lens-label">Analyze Code</span>
        <span class="lens-description">Show code metrics and insights</span>
      </button>
    </div>
  </div>
  <div class="lens-output">
    <div class="output-header">
      <h4>Result: <span class="active-lens-name">Reverse Code</span></h4>
    </div>
    <div class="output-content">
      <!-- Selected lens result appears here -->
    </div>
  </div>
</study-lenses>
```

#### 2. Lens Registration Pattern

```typescript
// Enhanced lens object for panel compatibility
export default {
  name: 'reverse',
  lens,
  view,
  config,
  
  // Panel mode enhancements
  panelDisplay: {
    label: 'Reverse Code',
    icon: '🔄',
    description: 'Reverse the order of characters',
    category: 'transforms',
    priority: 1 // Display order in panel
  }
}
```

#### 3. Event Handling & State

```typescript
class StudyPanelElement extends HTMLElement {
  private selectedLens: string | null = null;
  private sourceCode: string = '';
  private lensResults: Map<string, LensOutput> = new Map();
  
  async selectLens(lensName: string) {
    this.selectedLens = lensName;
    
    // Process code with selected lens
    const result = await this.processWithLens(lensName);
    
    // Update display
    this.renderResult(result);
    
    // Update UI state
    this.updateActiveButton(lensName);
  }
}
```

### Open Questions for Exploration

1. **Chaining Support**: Should panel mode support selecting multiple lenses in sequence? (Panel → Pipeline hybrid?)

2. **Configuration UI**: How granular should lens configuration be in panel mode? Should each lens have expandable settings?

3. **Lens Compatibility**: Should lenses opt-in to panel display? Some lenses might not make sense as panel options.

4. **Performance**: How to handle expensive lenses in panel mode? Lazy loading? Progress indicators?

5. **Accessibility**: How to ensure panel interface works well with screen readers and keyboard navigation?

6. **Mobile/Touch**: How should panel selection work on mobile devices?

### Educational Value

This interactive panel concept would significantly enhance the educational value of Study Lenses:

- **Discoverability**: Users can see all available lens options at a glance
- **Experimentation**: Easy "what if" exploration without writing code
- **Learning**: Users understand what each lens does through hands-on interaction
- **Comparison**: Users can quickly switch between different analyses of the same code

### References

- `../wc-open-in/` - Existing pattern for tool selection interfaces
- Current pipeline processing in `src/study/pipe.ts`
- Web component architecture in `src/web-components/`

### Next Steps

1. **Research**: Examine `wc-open-in` implementation for selection patterns
2. **Prototype**: Create minimal interactive panel proof-of-concept
3. **API Design**: Finalize lens object extensions for panel compatibility
4. **UX Testing**: Test different panel layouts with users
5. **Implementation**: Build production version with progressive enhancement

---

## Other Design Ideas

### Enhanced JSX Component Support

**Status**: Future Enhancement  
**Description**: Expand JSX/Preact integration with more sophisticated component patterns, state management, and interactive capabilities.

### Lens Composition Language

**Status**: Research Idea  
**Description**: Domain-specific language for describing complex lens pipelines and compositions declaratively.

### Real-time Collaboration

**Status**: Blue Sky  
**Description**: Multiple users working with the same study lenses session, seeing each other's lens selections and results.

---

*This backlog is a living document. Add new ideas, update status, and refine designs as the project evolves.*
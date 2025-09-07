# Study Bar UI Component

A pure function UI component that manages code distribution to child UI components using a flexbox layout and event-based communication system.

## Overview

The Study Bar component takes a snippet object and an array of child elements, creating a shared context where child components can access the same code through event delegation.

## Usage

### Basic Usage

```html
<sl-ui-study-bar code="console.log('Shared code');">
  <sl-ui-run></sl-ui-run>
</sl-ui-study-bar>
```

### Multiple Child Components

```html
<sl-ui-study-bar code="const data = [1, 2, 3]; console.log(data);">
  <sl-ui-run></sl-ui-run>
  <sl-ui-run></sl-ui-run>
  <sl-ui-lens-selector></sl-ui-lens-selector>
  <sl-ui-open-in></sl-ui-open-in>
</sl-ui-study-bar>
```

### With Different Languages

```html
<sl-ui-study-bar code="export const message = 'ES Module';" lang="mjs">
  <sl-ui-run></sl-ui-run>
</sl-ui-study-bar>

<sl-ui-study-bar code="console.assert(true);" test>
  <sl-ui-run></sl-ui-run>
</sl-ui-study-bar>
```

### File Loading

```html
<sl-ui-study-bar src="./examples/greet.js">
  <sl-ui-run></sl-ui-run>
</sl-ui-study-bar>
```

## Code Discovery

Follows the standard 5-level precedence hierarchy:

1. Own `code=""` attribute (including file paths)
2. Own `src=""` attribute
3. textContent
4. Child `<sl-snippet>`
5. Parent/sibling snippet context

## Child Communication

Child components request code using custom events:

```javascript
// Child component pattern
const event = new CustomEvent('request-code', {
  detail: { callback: (snippet) => { /* use snippet */ } },
  bubbles: true
});
element.dispatchEvent(event);
```

The study-bar listens for these events and provides the snippet data to any child that requests it.

## Layout

- **Flexbox container**: `display: flex`
- **Gap spacing**: `gap: 8px` 
- **Center alignment**: `align-items: center`
- **Wrap support**: `flex-wrap: wrap` for responsive layout

## Technical Implementation

- **Pure Function**: `component(snippet, children) => HTMLElement`
- **Event Delegation**: Uses `addEventListener('request-code')` for child communication
- **Code Caching**: Stores snippet on container for child access
- **Responsive Design**: Flexbox with wrap for various screen sizes

## API Reference

### Component Function

```typescript
function component(snippet: Snippet, children: HTMLElement[]): HTMLElement
```

**Parameters:**
- `snippet` - Snippet object `{ code, lang, test }`
- `children` - Array of HTML elements to render as children

**Returns:**
- HTMLElement with flexbox layout containing all children

### HTML Attributes

- `code=""` - JavaScript code to share with children
- `src=""` - Path to JavaScript file
- `lang=""` - Language (js/mjs, defaults to 'js') 
- `test` - Boolean attribute indicating test code

### Snippet Object

```typescript
interface Snippet {
  code: string;    // Source code content
  lang: string;    // Language identifier ('js', 'mjs')
  test: boolean;   // Whether this is test code
}
```

## Event System

### request-code Event

Child components dispatch this custom event to request code:

```typescript
interface RequestCodeEvent extends CustomEvent {
  detail: {
    callback: (snippet: Snippet) => void;
  };
  bubbles: true; // Must bubble to reach study-bar
}
```

### Event Flow

1. Child component dispatches `request-code` event
2. Event bubbles up to study-bar container  
3. Study-bar's event listener intercepts the event
4. Study-bar calls the provided callback with snippet data
5. Child component receives snippet and can proceed

## Examples

### Complex Setup

```html
<sl-ui-study-bar 
  code="// Complex JavaScript for multiple tools
const users = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 }
];

function processUsers(userList) {
  return userList
    .filter(user => user.age >= 25)
    .map(user => user.name.toUpperCase());
}

console.log('Processed users:', processUsers(users));"
  lang="js">
  
  <!-- Multiple UI components sharing the same code -->
  <sl-ui-run></sl-ui-run>
  <sl-ui-open-in></sl-ui-open-in>
  
</sl-ui-study-bar>
```

### Reactive Updates

For future reactivity (when implemented):

```javascript
// Potential future API for reactive updates
studyBar._studyBarSnippet = { 
  code: 'new code', 
  lang: 'js', 
  test: false 
};
// All children would automatically receive updated code
```

## Integration with Other UI Components

- **sl-ui-run** - Executes the shared code
- **sl-ui-lens-selector** - Applies lenses to shared code
- **sl-ui-open-in** - Opens shared code in external tools

All child UI components are designed to work within study-bar context and will automatically request code when needed.
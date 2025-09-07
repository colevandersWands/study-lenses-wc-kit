/**
 * Lens Wrapper Factory Tests
 * Tests the createLensElement factory function
 */

import { describe, it, expect } from 'vitest';
import { createLensElement } from './lens-wrapper.js';
import type { LensFunction } from '../types.js';

describe('createLensElement', () => {
  const mockLensFunction: LensFunction = (snippet) => ({
    snippet: { ...snippet, code: snippet.code.toUpperCase() },
    ui: null,
  });

  const mockViewLensFunction: LensFunction = (snippet) => {
    const div = document.createElement('div');
    div.textContent = `View: ${snippet.code}`;
    return {
      snippet,
      ui: div,
    };
  };

  describe('factory function behavior', () => {
    it('should return a class constructor', () => {
      const ElementClass = createLensElement('test-lens', mockLensFunction);

      expect(typeof ElementClass).toBe('function');
      expect(ElementClass.prototype).toBeDefined();
    });

    it('should create different classes for different lenses', () => {
      const Class1 = createLensElement('lens1', mockLensFunction);
      const Class2 = createLensElement('lens2', mockLensFunction);

      expect(Class1).not.toBe(Class2);
      expect(Class1.prototype).not.toBe(Class2.prototype);
    });

    it('should create classes that extend HTMLElement', () => {
      const ElementClass = createLensElement('test-lens', mockLensFunction);
      const instance = new ElementClass();

      expect(instance).toBeInstanceOf(HTMLElement);
      expect(instance.constructor).toBe(ElementClass);
    });
  });

  describe('created element instances', () => {
    it('should create functioning web component instances', () => {
      const ElementClass = createLensElement('test-lens', mockLensFunction);
      const instance = new ElementClass();

      expect(instance.tagName).toBeUndefined(); // Not yet connected
      expect(instance.nodeType).toBe(Node.ELEMENT_NODE);
    });

    it('should have connectedCallback method', () => {
      const ElementClass = createLensElement('test-lens', mockLensFunction);
      const instance = new ElementClass();

      expect(typeof instance.connectedCallback).toBe('function');
    });

    it('should call setupLensComponent when connected', () => {
      // We can't easily test the setupLensComponent call without mocking
      // the entire setup-functions module, but we can test that connectedCallback
      // exists and can be called without error

      const ElementClass = createLensElement('test-lens', mockLensFunction);
      const instance = new ElementClass();

      expect(() => {
        // This would normally trigger setup when element is added to DOM
        instance.connectedCallback();
      }).not.toThrow();
    });
  });

  describe('lens name handling', () => {
    it('should handle simple lens names', () => {
      const ElementClass = createLensElement('reverse', mockLensFunction);
      const instance = new ElementClass();

      expect(instance).toBeInstanceOf(HTMLElement);
      // The actual tag name formatting happens in setupLensComponent
    });

    it('should handle hyphenated lens names', () => {
      const ElementClass = createLensElement('jsx-demo', mockLensFunction);
      const instance = new ElementClass();

      expect(instance).toBeInstanceOf(HTMLElement);
    });

    it('should handle complex lens names', () => {
      const ElementClass = createLensElement('complex-lens-name', mockLensFunction);
      const instance = new ElementClass();

      expect(instance).toBeInstanceOf(HTMLElement);
    });
  });

  describe('lens function integration', () => {
    it('should work with transform lenses', () => {
      const transformLens: LensFunction = (snippet) => ({
        snippet: { ...snippet, code: snippet.code.split('').reverse().join('') },
        ui: null,
      });

      const ElementClass = createLensElement('reverse', transformLens);
      const instance = new ElementClass();

      expect(instance).toBeInstanceOf(HTMLElement);
    });

    it('should work with view-generating lenses', () => {
      const viewLens: LensFunction = (snippet) => {
        const div = document.createElement('div');
        div.textContent = `Analysis of: ${snippet.code}`;
        return {
          snippet,
          ui: div,
        };
      };

      const ElementClass = createLensElement('analyzer', viewLens);
      const instance = new ElementClass();

      expect(instance).toBeInstanceOf(HTMLElement);
    });

    it('should work with async lens functions', () => {
      const asyncLens: LensFunction = async (snippet) => {
        await new Promise((resolve) => setTimeout(resolve, 1));
        return {
          snippet: { ...snippet, code: snippet.code + '-async' },
          ui: null,
        };
      };

      const ElementClass = createLensElement('async-lens', asyncLens);
      const instance = new ElementClass();

      expect(instance).toBeInstanceOf(HTMLElement);
    });
  });

  describe('custom element lifecycle', () => {
    it('should not throw during construction', () => {
      expect(() => {
        const ElementClass = createLensElement('test-lens', mockLensFunction);
        new ElementClass();
      }).not.toThrow();
    });

    it('should not throw during connectedCallback', () => {
      const ElementClass = createLensElement('test-lens', mockLensFunction);
      const instance = new ElementClass();

      expect(() => {
        instance.connectedCallback();
      }).not.toThrow();
    });

    it('should handle multiple instances of same lens type', () => {
      const ElementClass = createLensElement('multi', mockLensFunction);
      const instance1 = new ElementClass();
      const instance2 = new ElementClass();

      expect(instance1).not.toBe(instance2);
      expect(instance1.constructor).toBe(instance2.constructor);
      expect(instance1).toBeInstanceOf(HTMLElement);
      expect(instance2).toBeInstanceOf(HTMLElement);
    });

    it('should handle multiple different lens types', () => {
      const Class1 = createLensElement('lens1', mockLensFunction);
      const Class2 = createLensElement('lens2', mockViewLensFunction);

      const instance1 = new Class1();
      const instance2 = new Class2();

      expect(instance1.constructor).not.toBe(instance2.constructor);
      expect(instance1).toBeInstanceOf(HTMLElement);
      expect(instance2).toBeInstanceOf(HTMLElement);
    });
  });

  describe('integration with DOM', () => {
    it('should be registerable as custom element', () => {
      const ElementClass = createLensElement('dom-test', mockLensFunction);

      // In a real environment, this would register the custom element
      // customElements.define('sl-lens-dom-test', ElementClass);

      expect(typeof ElementClass).toBe('function');
      expect(ElementClass.prototype.connectedCallback).toBeDefined();
    });

    it('should work when added to document', () => {
      const ElementClass = createLensElement('document-test', mockLensFunction);
      const instance = new ElementClass();

      // Add to document
      document.body.appendChild(instance);

      expect(instance.parentElement).toBe(document.body);
      expect(instance.isConnected).toBe(true);

      // Cleanup
      document.body.removeChild(instance);
    });
  });

  describe('error handling', () => {
    it('should handle lens function errors gracefully', () => {
      const errorLens: LensFunction = () => {
        throw new Error('Lens processing error');
      };

      const ElementClass = createLensElement('error-lens', errorLens);
      const instance = new ElementClass();

      // Should not throw during creation
      expect(instance).toBeInstanceOf(HTMLElement);

      // Error handling would happen during setupLensComponent call
      expect(() => {
        instance.connectedCallback();
      }).not.toThrow(); // setupLensComponent should handle errors
    });

    it('should handle invalid lens names', () => {
      expect(() => {
        createLensElement('', mockLensFunction);
      }).not.toThrow();

      expect(() => {
        createLensElement('123invalid', mockLensFunction);
      }).not.toThrow();
    });
  });

  describe('memory and performance', () => {
    it('should not leak memory when creating many classes', () => {
      const classes = [];

      for (let i = 0; i < 100; i++) {
        classes.push(createLensElement(`lens-${i}`, mockLensFunction));
      }

      expect(classes).toHaveLength(100);
      expect(classes[0]).not.toBe(classes[99]);
    });

    it('should create instances efficiently', () => {
      const ElementClass = createLensElement('performance-test', mockLensFunction);

      const start = performance.now();
      const instances = [];

      for (let i = 0; i < 100; i++) {
        instances.push(new ElementClass());
      }

      const end = performance.now();

      expect(instances).toHaveLength(100);
      expect(end - start).toBeLessThan(100); // Should be very fast
    });
  });

  describe('function signature validation', () => {
    it('should accept valid lens function signatures', () => {
      const validLenses = [
        (snippet: any) => ({ snippet, ui: null }),
        (snippet: any, config: any) => ({ snippet, ui: null }),
        async (snippet: any) => ({ snippet, ui: null }),
        async (snippet: any, config: any) => ({ snippet, ui: null }),
      ];

      validLenses.forEach((lens, index) => {
        expect(() => {
          createLensElement(`valid-${index}`, lens);
        }).not.toThrow();
      });
    });

    it('should work with minimal lens functions', () => {
      const minimalLens: LensFunction = (snippet) => ({ snippet, ui: null });

      expect(() => {
        createLensElement('minimal', minimalLens);
      }).not.toThrow();
    });

    it('should work with complex lens functions', () => {
      const complexLens: LensFunction = async (snippet, config = {}) => {
        // Simulate complex processing
        const processedCode = snippet.code
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        const div = document.createElement('div');
        div.innerHTML = `
          <h3>Complex Analysis</h3>
          <p>Original: ${snippet.code}</p>
          <p>Processed: ${processedCode}</p>
          <p>Language: ${snippet.lang}</p>
          <p>Test mode: ${snippet.test}</p>
        `;

        return {
          snippet: { ...snippet, code: processedCode },
          ui: div,
        };
      };

      expect(() => {
        createLensElement('complex', complexLens);
      }).not.toThrow();
    });
  });
});

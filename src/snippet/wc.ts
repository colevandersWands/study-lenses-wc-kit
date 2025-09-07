/**
 * Snippet Web Component Registration
 * Register function creates and defines the web component
 */

import lens, { type SnippetOptions } from './parse.js';

/**
 * Register the sl-snippet web component
 * Creates and defines the component only when called
 */
export const register = () => {
  const tagName = 'sl-snippet';
  
  if (!customElements.get(tagName)) {
    // Create the web component class inside the register function
    class SnippetWC extends HTMLElement {
  private _snippet: { code: string; lang: string; test: boolean } | null = null;
  private _loading = false;

  static get observedAttributes() {
    return ['code', 'src', 'lang', 'test'];
  }

  connectedCallback() {
    this.loadSnippet();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.loadSnippet();
    }
  }

  /**
   * Load snippet using same logic as lens
   * code="" takes precedence over src=""
   */
  private async loadSnippet() {
    if (this._loading) return;
    this._loading = true;

    try {
      // Get path or code - code takes precedence
      const code = this.getAttribute('code');
      const src = this.getAttribute('src');
      const pathOrCode = code || src;

      if (!pathOrCode) {
        // Try textContent as fallback
        const textContent = this.textContent?.trim();
        if (textContent) {
          this._snippet = {
            code: textContent,
            lang: this.getAttribute('lang') || 'js',
            test: this.hasAttribute('test'),
          };
          this.render();
        }
        return;
      }

      // Use same signature and logic as lens
      const options: SnippetOptions = {};
      if (this.hasAttribute('lang')) {
        options.lang = this.getAttribute('lang') || undefined;
      }
      if (this.hasAttribute('test')) {
        options.test = true;
      }

      this._snippet = await lens(pathOrCode, options);
      this.render();
    } catch (error) {
      console.error('Failed to load snippet:', error);
      this.renderError(error instanceof Error ? error.message : String(error));
    } finally {
      this._loading = false;
    }
  }

  /**
   * Render the loaded snippet
   */
  private render() {
    if (!this._snippet) return;

    this.innerHTML = '';
    const pre = document.createElement('pre');
    pre.textContent = this._snippet.code;
    pre.setAttribute('data-lang', this._snippet.lang);
    pre.setAttribute('data-test', this._snippet.test.toString());
    pre.style.background = '#f5f5f5';
    pre.style.padding = '10px';
    pre.style.borderRadius = '4px';
    pre.style.overflow = 'auto';
    this.appendChild(pre);
  }

  /**
   * Render error state
   */
  private renderError(message: string) {
    this.innerHTML = '';
    const errorDiv = document.createElement('div');
    errorDiv.style.color = 'red';
    errorDiv.style.padding = '8px';
    errorDiv.style.border = '1px solid red';
    errorDiv.style.borderRadius = '4px';
    errorDiv.style.backgroundColor = '#ffebee';
    errorDiv.textContent = `Snippet loading failed: ${message}`;
    this.appendChild(errorDiv);
  }

  /**
   * Get current snippet data (for programmatic access)
   */
  get snippet() {
    return this._snippet;
  }
    }
    
    customElements.define(tagName, SnippetWC);
  }
  
  return tagName;
};

// Named and default export - ONLY the register function
export default register;

/**
 * Run UI Component - Pure Function Implementation
 * Button with debug checkbox, loop guard checkbox, and max input
 * No DOM feedback - just executes and logs errors to console
 */

import { pipeLenses } from '../../study/pipe.js';
import studyLenses from '../../index.js';
import type { Snippet } from '../../types.js';

/**
 * Run UI pure function - returns controls for code execution
 * @param snippet - Code snippet to execute (can be null, will request from parent)
 * @returns DOM element with run button and execution controls
 */
export const component = (snippet: Snippet | null = null): HTMLElement => {
  const container = document.createElement('div');
  container.style.cssText = 'display: flex; gap: 8px; align-items: center; flex-wrap: wrap;';
  
  let currentSnippet = snippet;
  
  // Run button
  const runButton = document.createElement('button');
  runButton.textContent = '▶️ Run';
  runButton.style.cssText = 'padding: 4px 8px; cursor: pointer;';
  
  // Debug checkbox with label
  const debugLabel = document.createElement('label');
  debugLabel.style.cssText = 'display: flex; align-items: center; gap: 2px; font-size: 12px;';
  const debugCheck = document.createElement('input');
  debugCheck.type = 'checkbox';
  debugLabel.appendChild(debugCheck);
  debugLabel.appendChild(document.createTextNode('Debug'));
  
  // Loop guard checkbox with label
  const guardLabel = document.createElement('label');
  guardLabel.style.cssText = 'display: flex; align-items: center; gap: 2px; font-size: 12px;';
  const guardCheck = document.createElement('input');
  guardCheck.type = 'checkbox';
  guardLabel.appendChild(guardCheck);
  guardLabel.appendChild(document.createTextNode('Loop Guard'));
  
  // Loop guard max input
  const maxInput = document.createElement('input');
  maxInput.type = 'number';
  maxInput.value = '100';
  maxInput.min = '1';
  maxInput.max = '10000';
  maxInput.style.cssText = 'width: 60px; padding: 2px;';
  maxInput.disabled = true; // Disabled by default
  
  // Enable/disable max input based on guard checkbox
  guardCheck.addEventListener('change', () => {
    maxInput.disabled = !guardCheck.checked;
  });
  
  // Run button click handler - no DOM feedback, just execute
  runButton.addEventListener('click', async () => {
    // Get snippet if not provided (request from parent study-bar)
    if (!currentSnippet) {
      const event = new CustomEvent('request-code', {
        detail: { callback: (data: Snippet) => { currentSnippet = data; } },
        bubbles: true
      });
      container.dispatchEvent(event);
    }
    
    if (!currentSnippet?.code) {
      console.warn('Run UI: No code available to execute');
      return;
    }

    try {
      // Build lens pipeline based on control settings
      const lensSpecs = buildPipeline(currentSnippet, {
        debug: debugCheck.checked,
        loopGuard: guardCheck.checked,
        loopGuardMax: parseInt(maxInput.value) || 100
      });
      
      // Execute pipeline - run lens will handle execution, no DOM feedback
      await pipeLenses(currentSnippet, lensSpecs);
      
      // No success feedback in DOM - execution completes silently
    } catch (error) {
      // Just log error to console, no DOM feedback
      console.error('Run UI: Pipeline execution failed:', error);
    }
  });
  
  // Assemble UI elements
  container.appendChild(runButton);
  container.appendChild(debugLabel);
  container.appendChild(guardLabel);
  container.appendChild(maxInput);
  
  return container;
};

/**
 * Helper function to build lens pipeline based on control settings
 * Formatting is only applied after loop guards if they're enabled
 */
const buildPipeline = (snippet: Snippet, controls: any) => {
  const lenses = studyLenses.lenses;
  const pipeline = [];
  
  // Apply loop guard if enabled (before formatting)
  if (controls.loopGuard) {
    pipeline.push([lenses.loopGuard, { 
      active: true, 
      max: controls.loopGuardMax || 100 
    }]);
    
    // Format after loop guard if guard is enabled (and format lens exists)
    if (lenses.format) {
      pipeline.push(lenses.format);
    }
  }
  
  // Add run lens with config (test setting from snippet, debug from controls)
  pipeline.push([lenses.run, {
    debug: controls.debug,
    test: snippet.test // Dynamic from snippet object
  }]);
  
  return pipeline;
};
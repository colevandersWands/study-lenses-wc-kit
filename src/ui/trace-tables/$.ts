/**
 * Lightweight drag functionality for Web Components
 *
 * This module provides a jQuery-like chainable API for adding drag functionality
 * to HTML elements. It includes click/double-click event handling and maintains
 * drag state management.
 *
 * Features:
 * - Mouse-based dragging with proper offset calculation
 * - Enable/disable drag functionality
 * - Chainable API for event handling
 * - Automatic cursor management
 * - Memory cleanup for event listeners
 *
 * @example
 * $(element)
 *   .draggable()
 *   .click(() => $(element).draggable({ disabled: true }))
 *   .dblclick(() => $(element).draggable({ disabled: false }));
 */

/**
 * Configuration options for draggable functionality
 */
interface DragOptions {
	/** Whether dragging should be disabled */
	disabled?: boolean;
}

/**
 * Drag offset coordinates for mouse positioning
 */
interface DragOffset {
	x: number;
	y: number;
}

/**
 * Chainable API interface for drag functionality
 */
interface DragAPI {
	/**
	 * Makes the element draggable or configures drag behavior
	 * @param options - Optional configuration for drag behavior
	 * @returns The chainable API object
	 */
	draggable(options?: DragOptions): DragAPI;

	/**
	 * Adds a click event listener to the element
	 * @param handler - Event handler function
	 * @returns The chainable API object
	 */
	click(handler: (event: MouseEvent) => void): DragAPI;

	/**
	 * Adds a double-click event listener to the element
	 * @param handler - Event handler function
	 * @returns The chainable API object
	 */
	dblclick(handler: (event: MouseEvent) => void): DragAPI;
}

/**
 * Creates a drag-enabled wrapper for an HTML element with jQuery-like API
 *
 * @param element - The HTML element to make draggable
 * @returns Chainable API for drag and event handling
 *
 * @example
 * // Basic dragging
 * $(myElement).draggable();
 *
 * @example
 * // With click/double-click to toggle dragging
 * $(myElement)
 *   .draggable()
 *   .click(() => $(myElement).draggable({ disabled: true }))
 *   .dblclick(() => $(myElement).draggable({ disabled: false }));
 */
export function $(element: HTMLElement): DragAPI {
	// State for draggable functionality
	let isDragEnabled = false;
	let isDragging = false;
	const dragOffset: DragOffset = { x: 0, y: 0 };

	/**
	 * Handles mouse down events to start dragging
	 * @param e - Mouse event
	 */
	const handleMouseDown = (e: MouseEvent): void => {
		if (!isDragEnabled) {
			return;
		}

		isDragging = true;

		// Calculate offset from mouse to element's top-left corner
		const rect = element.getBoundingClientRect();
		dragOffset.x = e.clientX - rect.left;
		dragOffset.y = e.clientY - rect.top;

		// Prevent text selection during drag
		e.preventDefault();

		// Add global mouse event listeners
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);

		// Change cursor to indicate dragging
		document.body.style.cursor = 'grabbing';
	};

	/**
	 * Handles mouse move events during dragging
	 * @param e - Mouse event
	 */
	const handleMouseMove = (e: MouseEvent): void => {
		if (!isDragging) {
			return;
		}

		// Update element position based on mouse position and offset
		element.style.left = e.clientX - dragOffset.x + 'px';
		element.style.top = e.clientY - dragOffset.y + 'px';
	};

	/**
	 * Handles mouse up events to stop dragging
	 */
	const handleMouseUp = (): void => {
		if (!isDragging) {
			return;
		}

		isDragging = false;

		// Remove global mouse event listeners
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);

		// Reset cursor
		document.body.style.cursor = '';
	};

	// Chainable API object
	const api: DragAPI = {
		draggable(options: DragOptions = {}): DragAPI {
			if (options.disabled !== undefined) {
				// Update drag enabled state
				isDragEnabled = !options.disabled;

				// Update cursor style to indicate drag availability
				element.style.cursor = isDragEnabled ? 'grab' : 'default';

				if (options.disabled && isDragging) {
					// Force stop dragging if disabled mid-drag
					handleMouseUp();
				}
			} else {
				// Enable dragging by default
				isDragEnabled = true;
				element.style.cursor = 'grab';

				// Add mousedown listener if not already added
				// Use type assertion since we're adding a custom property
				const elementWithFlag = element as HTMLElement & {
					_dragHandlerAdded?: boolean;
				};
				if (!elementWithFlag._dragHandlerAdded) {
					element.addEventListener('mousedown', handleMouseDown);
					elementWithFlag._dragHandlerAdded = true;
				}
			}

			return api; // chainable
		},

		click(handler: (event: MouseEvent) => void): DragAPI {
			element.addEventListener('click', handler as EventListener);
			return api; // chainable
		},

		dblclick(handler: (event: MouseEvent) => void): DragAPI {
			element.addEventListener('dblclick', handler as EventListener);
			return api; // chainable
		},
	};

	return api;
}

/**
 * Deep Clone Utility Function Tests
 * Tests comprehensive deep cloning with circular references, DOM elements, etc.
 */

import { describe, it, expect } from 'vitest';
import { deepClone } from './deep-clone.js';

describe('deepClone utility function', () => {
	describe('primitive values', () => {
		it('should return primitives unchanged', () => {
			expect(deepClone(null)).toBeNull();
			expect(deepClone(undefined)).toBeUndefined();
			expect(deepClone(true)).toBe(true);
			expect(deepClone(false)).toBe(false);
			expect(deepClone(42)).toBe(42);
			expect(deepClone('hello')).toBe('hello');
		});

		it('should return functions unchanged', () => {
			const fn = () => 'test';
			const cloned = deepClone(fn);

			expect(cloned).toBe(fn);
			expect(cloned()).toBe('test');
		});
	});

	describe('arrays', () => {
		it('should clone simple arrays', () => {
			const original = [1, 2, 3];
			const cloned = deepClone(original);

			expect(cloned).toEqual(original);
			expect(cloned).not.toBe(original);
		});

		it('should deeply clone nested arrays', () => {
			const original = [
				[1, 2],
				[3, [4, 5]],
			];
			const cloned = deepClone(original);

			expect(cloned).toEqual(original);
			expect(cloned).not.toBe(original);
			expect(cloned[0]).not.toBe(original[0]);
			expect(cloned[1]).not.toBe(original[1]);
			expect(cloned[1][1]).not.toBe(original[1][1]);
		});

		it('should clone arrays with mixed types', () => {
			const original = [1, 'test', { key: 'value' }, [1, 2], null];
			const cloned = deepClone(original);

			expect(cloned).toEqual(original);
			expect(cloned).not.toBe(original);
			expect(cloned[2]).not.toBe(original[2]);
			expect(cloned[3]).not.toBe(original[3]);
		});

		it('should handle empty arrays', () => {
			const original: any[] = [];
			const cloned = deepClone(original);

			expect(cloned).toEqual([]);
			expect(cloned).not.toBe(original);
		});
	});

	describe('objects', () => {
		it('should clone simple objects', () => {
			const original = { a: 1, b: 'test', c: true };
			const cloned = deepClone(original);

			expect(cloned).toEqual(original);
			expect(cloned).not.toBe(original);
		});

		it('should deeply clone nested objects', () => {
			const original = {
				level1: {
					level2: {
						level3: 'deep',
					},
					array: [1, 2, 3],
				},
			};
			const cloned = deepClone(original);

			expect(cloned).toEqual(original);
			expect(cloned).not.toBe(original);
			expect(cloned.level1).not.toBe(original.level1);
			expect(cloned.level1.level2).not.toBe(original.level1.level2);
			expect(cloned.level1.array).not.toBe(original.level1.array);
		});

		it('should clone objects with prototype chain', () => {
			const Parent = function (this: any) {
				this.parentProp = 'parent';
			};
			Parent.prototype.parentMethod = function () {
				return 'parent method';
			};

			const Child = function (this: any) {
				Parent.call(this);
				this.childProp = 'child';
			};
			Child.prototype = Object.create(Parent.prototype);
			Child.prototype.childMethod = function () {
				return 'child method';
			};

			const original = new (Child as any)();
			const cloned = deepClone(original);

			expect(cloned.parentProp).toBe('parent');
			expect(cloned.childProp).toBe('child');
			expect(cloned.parentMethod()).toBe('parent method');
			expect(cloned.childMethod()).toBe('child method');
		});

		it('should handle empty objects', () => {
			const original = {};
			const cloned = deepClone(original);

			expect(cloned).toEqual({});
			expect(cloned).not.toBe(original);
		});
	});

	describe('special objects', () => {
		it('should clone Date objects', () => {
			const original = new Date('2023-01-01T00:00:00Z');
			const cloned = deepClone(original);

			expect(cloned).toEqual(original);
			expect(cloned).not.toBe(original);
			expect(cloned).toBeInstanceOf(Date);
			expect(cloned.getTime()).toBe(original.getTime());
		});

		it('should clone RegExp objects', () => {
			const original = /test/gim;
			const cloned = deepClone(original);

			expect(cloned).toEqual(original);
			expect(cloned).not.toBe(original);
			expect(cloned).toBeInstanceOf(RegExp);
			expect(cloned.source).toBe('test');
			expect(cloned.flags).toBe('gim');
		});

		it('should clone Error objects', () => {
			const original = new Error('Test error');
			original.stack = 'Test stack trace';
			const cloned = deepClone(original);

			expect(cloned).not.toBe(original);
			expect(cloned).toBeInstanceOf(Error);
			expect(cloned.message).toBe('Test error');
			expect(cloned.stack).toBe('Test stack trace');
		});

		it('should clone Map objects', () => {
			const original = new Map<any, any>([
				['key1', 'value1'],
				['key2', { nested: 'object' }],
				[{ objKey: true }, 'objectKey'],
			]);
			const cloned = deepClone(original);

			expect(cloned).not.toBe(original);
			expect(cloned).toBeInstanceOf(Map);
			expect(cloned.size).toBe(3);
			expect(cloned.get('key1')).toBe('value1');
			expect(cloned.get('key2')).toEqual({ nested: 'object' });
			expect(cloned.get('key2')).not.toBe(original.get('key2'));
		});

		it('should clone Set objects', () => {
			const original = new Set([1, 'test', { obj: true }, [1, 2, 3]]);
			const cloned = deepClone(original);

			expect(cloned).not.toBe(original);
			expect(cloned).toBeInstanceOf(Set);
			expect(cloned.size).toBe(4);
			expect(cloned.has(1)).toBe(true);
			expect(cloned.has('test')).toBe(true);
		});
	});

	describe('DOM elements (browser environment)', () => {
		it('should clone DOM elements', () => {
			const original = document.createElement('div');
			original.textContent = 'Test content';
			original.setAttribute('data-test', 'value');

			const cloned = deepClone(original) as HTMLElement;

			expect(cloned).not.toBe(original);
			expect(cloned).toBeInstanceOf(HTMLElement);
			expect(cloned.textContent).toBe('Test content');
			expect(cloned.getAttribute('data-test')).toBe('value');
		});

		it('should deeply clone DOM elements with children', () => {
			const original = document.createElement('div');
			const child = document.createElement('span');
			child.textContent = 'Child content';
			original.appendChild(child);

			const cloned = deepClone(original) as HTMLElement;
			const clonedChild = cloned.querySelector('span');

			expect(cloned).not.toBe(original);
			expect(clonedChild).not.toBe(child);
			expect(clonedChild?.textContent).toBe('Child content');
		});
	});

	describe('circular references', () => {
		it('should handle circular references', () => {
			const original: any = { name: 'circular' };
			original.self = original;

			const cloned = deepClone(original);

			expect(cloned).not.toBe(original);
			expect(cloned.name).toBe('circular');
			expect(cloned.self).toBe(cloned);
			expect(cloned.self).not.toBe(original);
		});

		it('should handle complex circular references', () => {
			const a: any = { name: 'a' };
			const b: any = { name: 'b' };
			const c: any = { name: 'c' };

			a.ref = b;
			b.ref = c;
			c.ref = a; // Circular reference

			const cloned = deepClone(a);

			expect(cloned).not.toBe(a);
			expect(cloned.ref).not.toBe(b);
			expect(cloned.ref.ref).not.toBe(c);
			expect(cloned.ref.ref.ref).toBe(cloned); // Should point to cloned a
		});

		it('should handle array circular references', () => {
			const original: any[] = [1, 2];
			original.push(original); // Circular reference

			const cloned = deepClone(original);

			expect(cloned).not.toBe(original);
			expect(cloned[0]).toBe(1);
			expect(cloned[1]).toBe(2);
			expect(cloned[2]).toBe(cloned);
		});
	});

	describe('edge cases', () => {
		it('should handle window object (browser)', () => {
			if (typeof window !== 'undefined') {
				const cloned = deepClone(window);
				expect(cloned).toBe(window); // Should return same reference
			}
		});

		it('should handle read-only properties gracefully', () => {
			const original = {};
			Object.defineProperty(original, 'readOnly', {
				value: 'readonly',
				writable: false,
				configurable: false,
			});

			const cloned = deepClone(original);

			expect(cloned).not.toBe(original);
			// Should not throw error due to read-only property
		});

		it('should handle very large objects', () => {
			const original: any = {};
			for (let i = 0; i < 1000; i++) {
				original[`key${i}`] = { value: i, nested: { deep: i * 2 } };
			}

			const cloned = deepClone(original);

			expect(cloned).not.toBe(original);
			expect(cloned.key0.value).toBe(0);
			expect(cloned.key999.nested.deep).toBe(1998);
			expect(cloned.key0).not.toBe(original.key0);
		});

		it('should handle deeply nested structures', () => {
			const original: any = { level: 0 };
			let current = original;

			// Create 100 levels of nesting
			for (let i = 1; i < 100; i++) {
				current.next = { level: i };
				current = current.next;
			}

			const cloned = deepClone(original);

			expect(cloned).not.toBe(original);
			expect(cloned.level).toBe(0);

			let clonedCurrent = cloned;
			for (let i = 1; i < 100; i++) {
				expect(clonedCurrent.next.level).toBe(i);
				clonedCurrent = clonedCurrent.next;
			}
		});

		it('should preserve property descriptors', () => {
			const original = {};
			Object.defineProperty(original, 'configurable', {
				value: 'test',
				configurable: true,
				enumerable: true,
				writable: true,
			});

			const cloned = deepClone(original);
			const descriptor = Object.getOwnPropertyDescriptor(
				cloned,
				'configurable'
			);

			expect(descriptor?.value).toBe('test');
			expect(descriptor?.configurable).toBe(true);
			expect(descriptor?.enumerable).toBe(true);
			expect(descriptor?.writable).toBe(true);
		});
	});

	describe('performance and memory', () => {
		it('should not cause memory leaks with large circular structures', () => {
			const original: any = { id: 1 };
			const items: any[] = [original];

			// Create many circular references
			for (let i = 2; i <= 100; i++) {
				const item = { id: i, prev: items[i - 2] };
				items[i - 2].next = item;
				items.push(item);
			}

			const cloned = deepClone(original);

			expect(cloned).not.toBe(original);
			expect(cloned.id).toBe(1);
			expect(cloned.next?.id).toBe(2);
		});
	});

	describe('mixed complex scenarios', () => {
		it('should handle complex mixed data structures', () => {
			const original = {
				string: 'test',
				number: 42,
				boolean: true,
				null: null,
				undefined: undefined,
				date: new Date('2023-01-01'),
				regex: /test/gi,
				array: [1, { nested: 'value' }, [1, 2]],
				map: new Map([['key', 'value']]),
				set: new Set([1, 2, 3]),
				function: () => 'test',
				deeply: {
					nested: {
						object: {
							with: {
								many: {
									levels: 'deep',
								},
							},
						},
					},
				},
			};

			const cloned = deepClone(original);

			expect(cloned).toEqual(original);
			expect(cloned).not.toBe(original);
			expect(cloned.array).not.toBe(original.array);
			expect(cloned.array[1]).not.toBe(original.array[1]);
			expect(cloned.map).not.toBe(original.map);
			expect(cloned.set).not.toBe(original.set);
			expect(cloned.deeply.nested.object.with.many).not.toBe(
				original.deeply.nested.object.with.many
			);
		});
	});
});

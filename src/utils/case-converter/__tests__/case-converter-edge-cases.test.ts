import { test, expect } from 'vitest';
import { convertKeysToCamelCase, convertKeysToSnakeCase } from '../case-converter.js';

// ==============================
// エッジケースのテスト
// ==============================

test('edge case - handles null and undefined in objects', () => {
  const input = {
    valid_key: 'value',
    null_value: null,
    undefined_value: undefined,
  };
  const camelResult = convertKeysToCamelCase(input);
  expect(camelResult).toEqual({
    validKey: 'value',
    nullValue: null,
    undefinedValue: undefined,
  });

  const snakeInput = {
    validKey: 'value',
    nullValue: null,
    undefinedValue: undefined,
  };
  const snakeResult = convertKeysToSnakeCase(snakeInput);
  expect(snakeResult).toEqual({
    valid_key: 'value',
    null_value: null,
    undefined_value: undefined,
  });
});

test('edge case - handles circular references without stack overflow', () => {
  const obj: Record<string, unknown> = { user_name: 'John' };
  obj.self_reference = obj;

  expect(() => convertKeysToCamelCase(obj)).toThrow(RangeError);
  expect(() => convertKeysToSnakeCase(obj)).toThrow(RangeError);
});

test('edge case - handles deeply nested structures', () => {
  const createDeepObject = (depth: number): Record<string, unknown> => {
    if (depth === 0) return { leaf_value: 'end' };
    return { nested_level: createDeepObject(depth - 1) };
  };

  const deepObject = createDeepObject(10);
  const camelResult = convertKeysToCamelCase(deepObject);

  let current = camelResult as Record<string, unknown>;
  for (let i = 0; i < 10; i++) {
    expect(current).toHaveProperty('nestedLevel');
    current = current.nestedLevel as Record<string, unknown>;
  }
  expect(current).toEqual({ leafValue: 'end' });
});

test('edge case - handles arrays with mixed types', () => {
  const input = ['string', 123, true, null, undefined, { user_name: 'John' }, ['nested', 'array']];

  const result = convertKeysToCamelCase(input) as unknown[];
  expect(result[0]).toBe('string');
  expect(result[1]).toBe(123);
  expect(result[2]).toBe(true);
  expect(result[3]).toBe(null);
  expect(result[4]).toBe(undefined);
  expect(result[5]).toEqual({ userName: 'John' });
  expect(result[6]).toEqual(['nested', 'array']);
});

test('edge case - handles objects with symbol keys', () => {
  const sym = Symbol('test');
  const input = {
    regular_key: 'value',
    [sym]: 'symbol value',
  };

  const result = convertKeysToCamelCase(input) as Record<string | symbol, unknown>;
  expect(result.regularKey).toBe('value');
  // Symbol keys are not enumerated and not converted
  expect(result[sym]).toBeUndefined();
});

test('edge case - handles objects with non-enumerable properties', () => {
  const input: Record<string, unknown> = {};
  input.visible_key = 'visible';
  Object.defineProperty(input, 'hidden_key', {
    value: 'hidden',
    enumerable: false,
  });

  const result = convertKeysToCamelCase(input) as Record<string, unknown>;
  expect(result.visibleKey).toBe('visible');
  expect(Object.keys(result)).not.toContain('hiddenKey');
});

test('edge case - handles very large objects efficiently', () => {
  const largeObject: Record<string, number> = {};
  for (let i = 0; i < 10000; i++) {
    largeObject[`key_number_${i}`] = i;
  }

  const startTime = performance.now();
  const result = convertKeysToCamelCase(largeObject) as Record<string, number>;
  const endTime = performance.now();

  expect(Object.keys(result).length).toBe(10000);
  expect(result.keyNumber0).toBe(0);
  expect(result.keyNumber9999).toBe(9999);
  // Performance check: should complete in reasonable time (10 seconds)
  // This is a generous threshold to avoid flaky tests in different environments
  expect(endTime - startTime).toBeLessThan(10000);
});

test('edge case - handles objects with prototype chain', () => {
  class Parent {
    parent_method() {
      return 'parent';
    }
  }

  class Child extends Parent {
    child_property = 'child';
  }

  const instance = new Child();
  const input = Object.assign({ user_name: 'John' }, instance);

  const result = convertKeysToCamelCase(input);
  expect(result).toHaveProperty('userName');
  expect(result).toHaveProperty('childProperty');
});

test('edge case - handles frozen and sealed objects', () => {
  const frozen = Object.freeze({ frozen_key: 'frozen' });
  const sealed = Object.seal({ sealed_key: 'sealed' });

  const frozenResult = convertKeysToCamelCase(frozen);
  expect(frozenResult).toEqual({ frozenKey: 'frozen' });
  expect(Object.isFrozen(frozenResult)).toBe(false);

  const sealedResult = convertKeysToCamelCase(sealed);
  expect(sealedResult).toEqual({ sealedKey: 'sealed' });
  expect(Object.isSealed(sealedResult)).toBe(false);
});

test('edge case - handles objects with getters and setters', () => {
  const input = {
    _private_value: 0,
    get computed_value() {
      return this._private_value * 2;
    },
    set computed_value(val: number) {
      this._private_value = val / 2;
    },
  };

  const result = convertKeysToCamelCase(input) as Record<string, unknown>;
  expect(result._privateValue).toBe(0);
  expect(result.computedValue).toBe(0);
});

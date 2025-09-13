import { test, expect } from 'vitest';
import { snakeToCamelCase } from '../case-converter.js';

// ==============================
// snakeToCamelCase のテスト
// ==============================

test('snakeToCamelCase - converts basic snake_case to camelCase', () => {
  expect(snakeToCamelCase('snake_case')).toBe('snakeCase');
  expect(snakeToCamelCase('hello_world')).toBe('helloWorld');
  expect(snakeToCamelCase('user_id')).toBe('userId');
});

test('snakeToCamelCase - converts multiple underscores', () => {
  expect(snakeToCamelCase('very_long_snake_case_string')).toBe('veryLongSnakeCaseString');
  expect(snakeToCamelCase('a_b_c_d_e')).toBe('aBCDE');
});

test('snakeToCamelCase - preserves already camelCase strings', () => {
  expect(snakeToCamelCase('alreadyCamelCase')).toBe('alreadyCamelCase');
  expect(snakeToCamelCase('simpleString')).toBe('simpleString');
});

test('snakeToCamelCase - handles empty string', () => {
  expect(snakeToCamelCase('')).toBe('');
});

test('snakeToCamelCase - preserves leading underscores', () => {
  expect(snakeToCamelCase('_private_field')).toBe('_privateField');
  expect(snakeToCamelCase('__double_underscore')).toBe('__doubleUnderscore');
  expect(snakeToCamelCase('___triple')).toBe('___triple');
});

test('snakeToCamelCase - handles trailing underscores', () => {
  expect(snakeToCamelCase('trailing_underscore_')).toBe('trailingUnderscore_');
  expect(snakeToCamelCase('field__')).toBe('field__');
});

test('snakeToCamelCase - handles numbers correctly', () => {
  expect(snakeToCamelCase('field_1')).toBe('field1');
  expect(snakeToCamelCase('user_id_123')).toBe('userId123');
  expect(snakeToCamelCase('test_2_value')).toBe('test2Value');
  expect(snakeToCamelCase('test_123_value')).toBe('test123Value');
  expect(snakeToCamelCase('value_4_test')).toBe('value4Test');
  expect(snakeToCamelCase('test_1_2_3')).toBe('test123');
});

test('snakeToCamelCase - handles uppercase in snake_case', () => {
  expect(snakeToCamelCase('API_KEY')).toBe('APIKEY');
  expect(snakeToCamelCase('http_URL')).toBe('httpURL');
});

test('snakeToCamelCase - handles strings with only underscores', () => {
  expect(snakeToCamelCase('___')).toBe('___');
  expect(snakeToCamelCase('_')).toBe('_');
});

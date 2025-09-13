import { test, expect } from 'vitest';
import { convertKeysToSnakeCase } from '../case-converter.js';

// ==============================
// convertKeysToSnakeCase のテスト
// ==============================

test('convertKeysToSnakeCase - converts camelCase keys to snake_case', () => {
  const input = {
    userName: 'John',
    firstName: 'John',
    lastName: 'Doe',
  };
  const expected = {
    user_name: 'John',
    first_name: 'John',
    last_name: 'Doe',
  };
  expect(convertKeysToSnakeCase(input)).toEqual(expected);
});

test('convertKeysToSnakeCase - converts nested object keys', () => {
  const input = {
    userProfile: {
      firstName: 'John',
      lastName: 'Doe',
      contactInfo: {
        emailAddress: 'john@example.com',
        phoneNumber: '123-456-7890',
      },
    },
  };
  const expected = {
    user_profile: {
      first_name: 'John',
      last_name: 'Doe',
      contact_info: {
        email_address: 'john@example.com',
        phone_number: '123-456-7890',
      },
    },
  };
  expect(convertKeysToSnakeCase(input)).toEqual(expected);
});

test('convertKeysToSnakeCase - converts array of objects', () => {
  const input = [
    { userId: 1, userName: 'Alice' },
    { userId: 2, userName: 'Bob' },
  ];
  const expected = [
    { user_id: 1, user_name: 'Alice' },
    { user_id: 2, user_name: 'Bob' },
  ];
  expect(convertKeysToSnakeCase(input)).toEqual(expected);
});

test('convertKeysToSnakeCase - handles mixed nested structures', () => {
  const input = {
    userList: [
      {
        userId: 1,
        userSettings: {
          themeColor: 'blue',
          notificationEnabled: true,
        },
      },
    ],
  };
  const expected = {
    user_list: [
      {
        user_id: 1,
        user_settings: {
          theme_color: 'blue',
          notification_enabled: true,
        },
      },
    ],
  };
  expect(convertKeysToSnakeCase(input)).toEqual(expected);
});

test('convertKeysToSnakeCase - preserves primitive values', () => {
  expect(convertKeysToSnakeCase('string')).toBe('string');
  expect(convertKeysToSnakeCase(123)).toBe(123);
  expect(convertKeysToSnakeCase(true)).toBe(true);
  expect(convertKeysToSnakeCase(null)).toBe(null);
  expect(convertKeysToSnakeCase(undefined)).toBe(undefined);
});

test('convertKeysToSnakeCase - handles empty objects and arrays', () => {
  expect(convertKeysToSnakeCase({})).toEqual({});
  expect(convertKeysToSnakeCase([])).toEqual([]);
});

test('convertKeysToSnakeCase - preserves already snake_case keys', () => {
  const input = {
    user_name: 'John',
    user_id: 123,
    is_active: true,
  };
  expect(convertKeysToSnakeCase(input)).toEqual(input);
});

test('convertKeysToSnakeCase - handles keys with numbers', () => {
  const input = {
    field1: 'value1',
    test2Value: 'test',
    value123Test: 'data',
  };
  const expected = {
    field1: 'value1',
    test2_value: 'test',
    value123_test: 'data',
  };
  expect(convertKeysToSnakeCase(input)).toEqual(expected);
});

test('convertKeysToSnakeCase - handles special property names', () => {
  const input = {
    _privateField: 'private',
    __doubleUnderscore: 'double',
    constructor: 'constructor',
  };
  // __proto__ is not included as it's a special property that causes issues
  const result = convertKeysToSnakeCase(input);
  // Keys with leading underscores are not converted
  expect(result).toHaveProperty('_privateField', 'private');
  expect(result).toHaveProperty('__doubleUnderscore', 'double');
  expect(result).toHaveProperty('constructor', 'constructor');
});

test('convertKeysToSnakeCase - handles Date and other objects', () => {
  const date = new Date('2024-01-01');
  const input = {
    createdAt: date,
    updatedAt: date,
  };
  const result = convertKeysToSnakeCase(input) as unknown as Record<string, Date>;
  expect(result.created_at).toBe(date);
  expect(result.updated_at).toBe(date);
});

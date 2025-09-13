import { test, expect } from 'vitest';
import { convertKeysToCamelCase } from '../case-converter.js';

// ==============================
// convertKeysToCamelCase のテスト
// ==============================

test('convertKeysToCamelCase - converts snake_case keys to camelCase', () => {
  const input = {
    user_name: 'John',
    first_name: 'John',
    last_name: 'Doe',
  };
  const expected = {
    userName: 'John',
    firstName: 'John',
    lastName: 'Doe',
  };
  expect(convertKeysToCamelCase(input)).toEqual(expected);
});

test('convertKeysToCamelCase - converts nested object keys', () => {
  const input = {
    user_profile: {
      first_name: 'John',
      last_name: 'Doe',
      contact_info: {
        email_address: 'john@example.com',
        phone_number: '123-456-7890',
      },
    },
  };
  const expected = {
    userProfile: {
      firstName: 'John',
      lastName: 'Doe',
      contactInfo: {
        emailAddress: 'john@example.com',
        phoneNumber: '123-456-7890',
      },
    },
  };
  expect(convertKeysToCamelCase(input)).toEqual(expected);
});

test('convertKeysToCamelCase - converts array of objects', () => {
  const input = [
    { user_id: 1, user_name: 'Alice' },
    { user_id: 2, user_name: 'Bob' },
  ];
  const expected = [
    { userId: 1, userName: 'Alice' },
    { userId: 2, userName: 'Bob' },
  ];
  expect(convertKeysToCamelCase(input)).toEqual(expected);
});

test('convertKeysToCamelCase - handles mixed nested structures', () => {
  const input = {
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
  const expected = {
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
  expect(convertKeysToCamelCase(input)).toEqual(expected);
});

test('convertKeysToCamelCase - preserves primitive values', () => {
  expect(convertKeysToCamelCase('string')).toBe('string');
  expect(convertKeysToCamelCase(123)).toBe(123);
  expect(convertKeysToCamelCase(true)).toBe(true);
  expect(convertKeysToCamelCase(null)).toBe(null);
  expect(convertKeysToCamelCase(undefined)).toBe(undefined);
});

test('convertKeysToCamelCase - handles empty objects and arrays', () => {
  expect(convertKeysToCamelCase({})).toEqual({});
  expect(convertKeysToCamelCase([])).toEqual([]);
});

test('convertKeysToCamelCase - preserves already camelCase keys', () => {
  const input = {
    userName: 'John',
    userId: 123,
    isActive: true,
  };
  expect(convertKeysToCamelCase(input)).toEqual(input);
});

test('convertKeysToCamelCase - handles keys with numbers', () => {
  const input = {
    field_1: 'value1',
    test_2_value: 'test',
    value_123_test: 'data',
  };
  const expected = {
    field1: 'value1',
    test2Value: 'test',
    value123Test: 'data',
  };
  expect(convertKeysToCamelCase(input)).toEqual(expected);
});

test('convertKeysToCamelCase - handles special property names', () => {
  const input = {
    _private_field: 'private',
    __double_underscore: 'double',
    constructor: 'constructor',
  };
  // __proto__ is not included as it's a special property that causes issues
  const result = convertKeysToCamelCase(input);
  // Keys with leading underscores are not converted
  expect(result).toHaveProperty('_private_field', 'private');
  expect(result).toHaveProperty('__double_underscore', 'double');
  expect(result).toHaveProperty('constructor', 'constructor');
});

test('convertKeysToCamelCase - handles Date and other objects', () => {
  const date = new Date('2024-01-01');
  const input = {
    created_at: date,
    updated_at: date,
  };
  const result = convertKeysToCamelCase(input) as unknown as Record<string, Date>;
  expect(result.createdAt).toBe(date);
  expect(result.updatedAt).toBe(date);
});

import { test, expect } from 'vitest';
import {
  convertKeysToCamelCase,
  convertKeysToSnakeCase,
  snakeToCamelCase,
  camelToSnakeCase,
} from '../case-converter.js';

// ==============================
// 双方向変換のテスト
// ==============================

test('roundtrip conversion - snake to camel and back preserves original', () => {
  const original = 'user_name';
  const camel = snakeToCamelCase(original);
  const backToSnake = camelToSnakeCase(camel);
  expect(backToSnake).toBe(original);
});

test('roundtrip conversion - camel to snake and back preserves original', () => {
  const original = 'userName';
  const snake = camelToSnakeCase(original);
  const backToCamel = snakeToCamelCase(snake);
  expect(backToCamel).toBe(original);
});

test('roundtrip conversion - object keys snake to camel and back', () => {
  const original = {
    user_id: 1,
    user_name: 'John',
    email_address: 'john@example.com',
  };
  const camel = convertKeysToCamelCase(original);
  const backToSnake = convertKeysToSnakeCase(camel);
  expect(backToSnake).toEqual(original);
});

test('roundtrip conversion - object keys camel to snake and back', () => {
  const original = {
    userId: 1,
    userName: 'John',
    emailAddress: 'john@example.com',
  };
  const snake = convertKeysToSnakeCase(original);
  const backToCamel = convertKeysToCamelCase(snake);
  expect(backToCamel).toEqual(original);
});

test('roundtrip conversion - deeply nested objects', () => {
  const original = {
    user_profile: {
      personal_info: {
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: '1990-01-01',
      },
      contact_details: {
        email_address: 'john@example.com',
        phone_numbers: ['123-456-7890', '098-765-4321'],
      },
    },
  };
  const camel = convertKeysToCamelCase(original);
  const backToSnake = convertKeysToSnakeCase(camel);
  expect(backToSnake).toEqual(original);
});

test('roundtrip conversion - arrays of objects', () => {
  const original = [
    { user_id: 1, user_name: 'Alice', is_active: true },
    { user_id: 2, user_name: 'Bob', is_active: false },
    { user_id: 3, user_name: 'Charlie', is_active: true },
  ];
  const camel = convertKeysToCamelCase(original);
  const backToSnake = convertKeysToSnakeCase(camel);
  expect(backToSnake).toEqual(original);
});

test('roundtrip conversion - mixed structure with arrays and nested objects', () => {
  const original = {
    company_info: {
      company_name: 'TechCorp',
      employee_list: [
        {
          employee_id: 'E001',
          full_name: 'John Doe',
          department_info: {
            department_name: 'Engineering',
            team_lead: 'Jane Smith',
          },
        },
        {
          employee_id: 'E002',
          full_name: 'Alice Johnson',
          department_info: {
            department_name: 'Marketing',
            team_lead: 'Bob Williams',
          },
        },
      ],
    },
  };
  const camel = convertKeysToCamelCase(original);
  const backToSnake = convertKeysToSnakeCase(camel);
  expect(backToSnake).toEqual(original);
});

test('roundtrip conversion - handles keys with numbers', () => {
  // Numbers in keys are handled differently - they join without underscore
  const originalSnake = {
    field1: 'value1', // Numbers directly after text don't get underscore
    test2_value: 'test', // But segments after numbers do
    api_v2_endpoint: 'https://api.example.com/v2',
  };
  const camel = convertKeysToCamelCase(originalSnake);
  expect(camel).toEqual({
    field1: 'value1',
    test2Value: 'test',
    apiV2Endpoint: 'https://api.example.com/v2',
  });
  const backToSnake = convertKeysToSnakeCase(camel);
  expect(backToSnake).toEqual(originalSnake);
});

test('roundtrip conversion - preserves special values', () => {
  const date = new Date('2024-01-01');
  const original = {
    created_at: date,
    updated_at: null,
    deleted_at: undefined,
    is_active: true,
    retry_count: 0,
  };
  const camel = convertKeysToCamelCase(original);
  const backToSnake = convertKeysToSnakeCase(camel);

  expect(backToSnake).toEqual(original);
  expect((backToSnake as Record<string, unknown>).created_at).toBe(date);
});

test('roundtrip conversion - handles empty and edge cases', () => {
  const testCases = [
    {},
    [],
    { '': 'empty key' },
    { _: 'underscore only' },
    { __: 'double underscore' },
  ];

  testCases.forEach((original) => {
    const camel = convertKeysToCamelCase(original);
    const backToSnake = convertKeysToSnakeCase(camel);
    expect(backToSnake).toEqual(original);
  });
});

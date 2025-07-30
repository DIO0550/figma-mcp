import { describe, test, expect } from 'vitest';
import {
  snakeToCamelCase,
  camelToSnakeCase,
  convertKeysToCamelCase,
  convertKeysToSnakeCase,
} from './case-converter.js';

describe('case-converter', () => {
  describe('snakeToCamelCase', () => {
    test('単純なスネークケースをキャメルケースに変換できる', () => {
      expect(snakeToCamelCase('snake_case')).toBe('snakeCase');
      expect(snakeToCamelCase('hello_world')).toBe('helloWorld');
      expect(snakeToCamelCase('user_id')).toBe('userId');
    });

    test('複数のアンダースコアを含む文字列を変換できる', () => {
      expect(snakeToCamelCase('very_long_snake_case_string')).toBe('veryLongSnakeCaseString');
      expect(snakeToCamelCase('a_b_c_d_e')).toBe('aBCDE');
    });

    test('既にキャメルケースの文字列はそのまま返す', () => {
      expect(snakeToCamelCase('alreadyCamelCase')).toBe('alreadyCamelCase');
      expect(snakeToCamelCase('simpleString')).toBe('simpleString');
    });

    test('空文字列を処理できる', () => {
      expect(snakeToCamelCase('')).toBe('');
    });

    test('アンダースコアで始まる・終わる文字列を処理できる', () => {
      expect(snakeToCamelCase('_private_field')).toBe('_privateField');
      expect(snakeToCamelCase('trailing_underscore_')).toBe('trailingUnderscore_');
      expect(snakeToCamelCase('__double__underscore__')).toBe('__double_Underscore__');
    });

    test('数字を含む文字列を処理できる', () => {
      expect(snakeToCamelCase('field_1')).toBe('field1');
      expect(snakeToCamelCase('user_id_123')).toBe('userId123');
      expect(snakeToCamelCase('test_2_value')).toBe('test2Value');
    });

    test('大文字を含むスネークケースを処理できる', () => {
      expect(snakeToCamelCase('API_KEY')).toBe('APIKEY');
      expect(snakeToCamelCase('http_URL')).toBe('httpURL');
    });
  });

  describe('camelToSnakeCase', () => {
    test('単純なキャメルケースをスネークケースに変換できる', () => {
      expect(camelToSnakeCase('camelCase')).toBe('camel_case');
      expect(camelToSnakeCase('helloWorld')).toBe('hello_world');
      expect(camelToSnakeCase('userId')).toBe('user_id');
    });

    test('複数の大文字を含む文字列を変換できる', () => {
      expect(camelToSnakeCase('veryLongCamelCaseString')).toBe('very_long_camel_case_string');
      expect(camelToSnakeCase('aBCDE')).toBe('a_b_c_d_e');
    });

    test('既にスネークケースの文字列はそのまま返す', () => {
      expect(camelToSnakeCase('already_snake_case')).toBe('already_snake_case');
      expect(camelToSnakeCase('simple_string')).toBe('simple_string');
    });

    test('空文字列を処理できる', () => {
      expect(camelToSnakeCase('')).toBe('');
    });

    test('先頭が大文字の文字列を処理できる', () => {
      expect(camelToSnakeCase('PascalCase')).toBe('pascal_case');
      expect(camelToSnakeCase('Component')).toBe('component');
    });

    test('連続する大文字を処理できる', () => {
      expect(camelToSnakeCase('APIKey')).toBe('api_key');
      expect(camelToSnakeCase('HTTPSConnection')).toBe('https_connection');
      expect(camelToSnakeCase('XMLParser')).toBe('xml_parser');
    });

    test('数字を含む文字列を処理できる', () => {
      expect(camelToSnakeCase('field1')).toBe('field1');
      expect(camelToSnakeCase('userId123')).toBe('user_id123');
      expect(camelToSnakeCase('test2Value')).toBe('test2_value');
    });
  });

  describe('convertKeysToCamelCase', () => {
    test('オブジェクトのキーをキャメルケースに変換できる', () => {
      const input = {
        user_id: 123,
        user_name: 'John',
        created_at: '2024-01-01',
      };
      const expected = {
        userId: 123,
        userName: 'John',
        createdAt: '2024-01-01',
      };
      expect(convertKeysToCamelCase(input)).toEqual(expected);
    });

    test('ネストしたオブジェクトを再帰的に変換できる', () => {
      const input = {
        user_info: {
          first_name: 'John',
          last_name: 'Doe',
          contact_info: {
            email_address: 'john@example.com',
            phone_number: '123-456-7890',
          },
        },
      };
      const expected = {
        userInfo: {
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

    test('配列を含むオブジェクトを処理できる', () => {
      const input = {
        user_list: [
          { user_id: 1, user_name: 'Alice' },
          { user_id: 2, user_name: 'Bob' },
        ],
        total_count: 2,
      };
      const expected = {
        userList: [
          { userId: 1, userName: 'Alice' },
          { userId: 2, userName: 'Bob' },
        ],
        totalCount: 2,
      };
      expect(convertKeysToCamelCase(input)).toEqual(expected);
    });

    test('null, undefined, プリミティブ値を処理できる', () => {
      expect(convertKeysToCamelCase(null)).toBe(null);
      expect(convertKeysToCamelCase(undefined)).toBe(undefined);
      expect(convertKeysToCamelCase('string')).toBe('string');
      expect(convertKeysToCamelCase(123)).toBe(123);
      expect(convertKeysToCamelCase(true)).toBe(true);
    });

    test('配列を直接渡しても処理できる', () => {
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

    test('空のオブジェクト・配列を処理できる', () => {
      expect(convertKeysToCamelCase({})).toEqual({});
      expect(convertKeysToCamelCase([])).toEqual([]);
    });

    test('特殊なオブジェクト（Date, RegExp等）は変換しない', () => {
      const date = new Date('2024-01-01');
      const regexp = /test/g;
      const input = {
        created_date: date,
        validation_pattern: regexp,
      };
      const result = convertKeysToCamelCase(input);
      expect((result as { createdDate: Date; validationPattern: RegExp }).createdDate).toBe(date);
      expect((result as { createdDate: Date; validationPattern: RegExp }).validationPattern).toBe(regexp);
    });
  });

  describe('convertKeysToSnakeCase', () => {
    test('オブジェクトのキーをスネークケースに変換できる', () => {
      const input = {
        userId: 123,
        userName: 'John',
        createdAt: '2024-01-01',
      };
      const expected = {
        user_id: 123,
        user_name: 'John',
        created_at: '2024-01-01',
      };
      expect(convertKeysToSnakeCase(input)).toEqual(expected);
    });

    test('ネストしたオブジェクトを再帰的に変換できる', () => {
      const input = {
        userInfo: {
          firstName: 'John',
          lastName: 'Doe',
          contactInfo: {
            emailAddress: 'john@example.com',
            phoneNumber: '123-456-7890',
          },
        },
      };
      const expected = {
        user_info: {
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

    test('配列を含むオブジェクトを処理できる', () => {
      const input = {
        userList: [
          { userId: 1, userName: 'Alice' },
          { userId: 2, userName: 'Bob' },
        ],
        totalCount: 2,
      };
      const expected = {
        user_list: [
          { user_id: 1, user_name: 'Alice' },
          { user_id: 2, user_name: 'Bob' },
        ],
        total_count: 2,
      };
      expect(convertKeysToSnakeCase(input)).toEqual(expected);
    });

    test('null, undefined, プリミティブ値を処理できる', () => {
      expect(convertKeysToSnakeCase(null)).toBe(null);
      expect(convertKeysToSnakeCase(undefined)).toBe(undefined);
      expect(convertKeysToSnakeCase('string')).toBe('string');
      expect(convertKeysToSnakeCase(123)).toBe(123);
      expect(convertKeysToSnakeCase(true)).toBe(true);
    });

    test('配列を直接渡しても処理できる', () => {
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

    test('空のオブジェクト・配列を処理できる', () => {
      expect(convertKeysToSnakeCase({})).toEqual({});
      expect(convertKeysToSnakeCase([])).toEqual([]);
    });

    test('特殊なオブジェクト（Date, RegExp等）は変換しない', () => {
      const date = new Date('2024-01-01');
      const regexp = /test/g;
      const input = {
        createdDate: date,
        validationPattern: regexp,
      };
      const result = convertKeysToSnakeCase(input);
      expect((result as unknown as { created_date: Date; validation_pattern: RegExp }).created_date).toBe(date);
      expect((result as unknown as { created_date: Date; validation_pattern: RegExp }).validation_pattern).toBe(regexp);
    });
  });

  describe('相互変換の整合性', () => {
    test('キャメルケース → スネークケース → キャメルケースで元に戻る', () => {
      const original = {
        userId: 123,
        userName: 'John',
        profileInfo: {
          firstName: 'John',
          lastName: 'Doe',
          contactList: [
            { emailAddress: 'john@example.com' },
            { phoneNumber: '123-456-7890' },
          ],
        },
      };
      const snake = convertKeysToSnakeCase(original);
      const camel = convertKeysToCamelCase(snake);
      expect(camel).toEqual(original);
    });

    test('スネークケース → キャメルケース → スネークケースで元に戻る', () => {
      const original = {
        user_id: 123,
        user_name: 'John',
        profile_info: {
          first_name: 'John',
          last_name: 'Doe',
          contact_list: [
            { email_address: 'john@example.com' },
            { phone_number: '123-456-7890' },
          ],
        },
      };
      const camel = convertKeysToCamelCase(original);
      const snake = convertKeysToSnakeCase(camel);
      expect(snake).toEqual(original);
    });
  });
});
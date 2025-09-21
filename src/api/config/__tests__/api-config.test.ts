import { test, expect } from 'vitest';
import { createApiConfig, createHeaders, DEFAULT_BASE_URL } from '../api-config';
import { Headers, ContentType } from '../../../constants';

// DEFAULT_BASE_URL のテスト
test('DEFAULT_BASE_URL - Figma APIのデフォルトベースURLがhttps://api.figma.comである', () => {
  expect(DEFAULT_BASE_URL).toBe('https://api.figma.com');
});

// createApiConfig の正常系テスト
test('createApiConfig - 有効なアクセストークンのみ指定すると、デフォルトベースURLでApiConfigが作成される', () => {
  // Arrange
  const accessToken = 'test-token';

  // Act
  const config = createApiConfig(accessToken);

  // Assert
  expect(config).toEqual({
    accessToken: 'test-token',
    baseUrl: DEFAULT_BASE_URL,
  });
});

test('createApiConfig - 有効なアクセストークンとカスタムベースURLを指定すると、指定したベースURLでApiConfigが作成される', () => {
  // Arrange
  const accessToken = 'test-token';
  const customUrl = 'https://custom.figma.com';

  // Act
  const config = createApiConfig(accessToken, customUrl);

  // Assert
  expect(config).toEqual({
    accessToken: 'test-token',
    baseUrl: customUrl,
  });
});

// createApiConfig の異常系テスト
test('createApiConfig - アクセストークンに空文字を指定すると、エラー「Figma access token is required」が発生する', () => {
  // Arrange & Act & Assert
  expect(() => createApiConfig('')).toThrow('Figma access token is required');
});

test('createApiConfig - アクセストークンにundefinedを指定すると、エラー「Figma access token is required」が発生する', () => {
  // Arrange & Act & Assert
  expect(() => createApiConfig(undefined as unknown as string)).toThrow(
    'Figma access token is required'
  );
});

test('createApiConfig - アクセストークンにnullを指定すると、エラー「Figma access token is required」が発生する', () => {
  // Arrange & Act & Assert
  expect(() => createApiConfig(null as unknown as string)).toThrow(
    'Figma access token is required'
  );
});

// 追加の境界値テスト
test('createApiConfig - アクセストークンに空白文字のみを指定すると、エラー「Figma access token is required」が発生する', () => {
  // Arrange
  const whitespaceToken = '   ';

  // Act & Assert
  expect(() => createApiConfig(whitespaceToken)).toThrow('Figma access token is required');
});

test('createApiConfig - ベースURLに空文字を指定すると、デフォルトベースURLが使用される', () => {
  // Arrange
  const accessToken = 'test-token';

  // Act
  const config = createApiConfig(accessToken, '');

  // Assert
  expect(config.baseUrl).toBe(DEFAULT_BASE_URL);
});

// Figma APIトークンは通常43文字程度
// 仕様上の最大長は明記されていないが、現実的な上限として256文字をテスト
const REALISTIC_MAX_TOKEN_LENGTH = 256;
const TOKEN_PREFIX = 'fig_';
const TOKEN_PREFIX_LENGTH = TOKEN_PREFIX.length;

test('createApiConfig - 現実的な最大長（256文字）のアクセストークンを指定しても、正常にApiConfigが作成される', () => {
  // Arrange
  const longToken = TOKEN_PREFIX + 'a'.repeat(REALISTIC_MAX_TOKEN_LENGTH - TOKEN_PREFIX_LENGTH);

  // Act
  const config = createApiConfig(longToken);

  // Assert
  expect(config.accessToken).toBe(longToken);
  expect(config.accessToken.length).toBe(REALISTIC_MAX_TOKEN_LENGTH);
});

// createHeaders のテスト
test('createHeaders - 有効なApiConfigを渡すと、Figma API用の認証ヘッダーとContent-Typeが設定される', () => {
  // Arrange
  const config = createApiConfig('test-token');

  // Act
  const headers = createHeaders(config);

  // Assert
  expect(headers).toEqual({
    [Headers.FIGMA_TOKEN]: 'test-token',
    [Headers.CONTENT_TYPE]: ContentType.JSON,
  });
});

test('createHeaders - カスタムベースURLを含むApiConfigでも、正しいヘッダーが生成される', () => {
  // Arrange
  const config = createApiConfig('test-token', 'https://custom.figma.com');

  // Act
  const headers = createHeaders(config);

  // Assert
  expect(headers[Headers.FIGMA_TOKEN]).toBe('test-token');
  expect(headers[Headers.CONTENT_TYPE]).toBe(ContentType.JSON);
});

test('createHeaders - 特殊文字を含むトークンでも、そのままヘッダーに設定される', () => {
  // Arrange
  const specialToken = 'test-token!@#$%^&*()_+{}[]|:;<>,.?/~`';
  const config = createApiConfig(specialToken);

  // Act
  const headers = createHeaders(config);

  // Assert
  expect(headers[Headers.FIGMA_TOKEN]).toBe(specialToken);
});

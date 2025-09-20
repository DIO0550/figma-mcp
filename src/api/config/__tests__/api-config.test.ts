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
test('createApiConfig - アクセストークンに空白文字のみを指定しても、空白文字がトークンとして扱われる（現在の実装）', () => {
  // Arrange
  const whitespaceToken = '   ';

  // Act
  const config = createApiConfig(whitespaceToken);

  // Assert
  // 注: 現在の実装では空白文字も有効なトークンとして扱われる
  expect(config.accessToken).toBe(whitespaceToken);
});

test('createApiConfig - ベースURLに空文字を指定すると、デフォルトベースURLが使用される', () => {
  // Arrange
  const accessToken = 'test-token';

  // Act
  const config = createApiConfig(accessToken, '');

  // Assert
  expect(config.baseUrl).toBe(DEFAULT_BASE_URL);
});

test('createApiConfig - 非常に長いアクセストークン（1000文字）を指定しても、正常にApiConfigが作成される', () => {
  // Arrange
  const longToken = 'a'.repeat(1000);

  // Act
  const config = createApiConfig(longToken);

  // Assert
  expect(config.accessToken).toBe(longToken);
  expect(config.accessToken.length).toBe(1000);
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

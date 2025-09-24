import { expect, test, beforeEach, afterEach } from 'vitest';
import { FigmaContext } from '../index.js';
import type { FigmaContext as FigmaContextType } from '../index.js';

// 環境変数を扱うテストのセットアップ
const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = originalEnv;
});

// ===== インターフェーステスト =====

test('FigmaContext インターフェース - 必要なプロパティ（accessToken, baseUrl, headers）を全て持つ', () => {
  // Arrange
  const context: FigmaContextType = {
    accessToken: 'test-token',
    baseUrl: 'https://api.figma.com',
    headers: {
      'X-Figma-Token': 'test-token',
    },
  };

  // Act & Assert
  expect(context.accessToken).toBe('test-token');
  expect(context.baseUrl).toBe('https://api.figma.com');
  expect(context.headers['X-Figma-Token']).toBe('test-token');
});

// ===== FigmaContext.from テスト =====

test('FigmaContext.from - アクセストークンのみ指定した場合、デフォルトのbaseUrlとヘッダーが設定される', () => {
  // Arrange
  const accessToken = 'test-token';

  // Act
  const context = FigmaContext.from(accessToken);

  // Assert
  expect(context).toEqual({
    accessToken: 'test-token',
    baseUrl: 'https://api.figma.com',
    headers: {
      'X-Figma-Token': 'test-token',
    },
  });
});

test('FigmaContext.from - カスタムbaseUrlを指定した場合、そのURLが設定される', () => {
  // Arrange
  const accessToken = 'test-token';
  const customBaseUrl = 'https://custom.figma.com';

  // Act
  const context = FigmaContext.from(accessToken, {
    baseUrl: customBaseUrl,
  });

  // Assert
  expect(context.baseUrl).toBe('https://custom.figma.com');
  expect(context.accessToken).toBe('test-token');
});

test('FigmaContext.from - 追加ヘッダーを指定した場合、デフォルトヘッダーとマージされる', () => {
  // Arrange
  const accessToken = 'test-token';
  const customHeaders = { 'Custom-Header': 'custom-value' };

  // Act
  const context = FigmaContext.from(accessToken, {
    headers: customHeaders,
  });

  // Assert
  expect(context.headers).toEqual({
    'X-Figma-Token': 'test-token',
    'Custom-Header': 'custom-value',
  });
});

test('FigmaContext.from - 空文字列のトークンを渡した場合でも、コンテキストは作成される（validateで検証）', () => {
  // Arrange
  const emptyToken = '';

  // Act
  const context = FigmaContext.from(emptyToken);

  // Assert
  expect(context.accessToken).toBe('');
  expect(context.headers['X-Figma-Token']).toBe('');
  expect(FigmaContext.validate(context)).toBe(false);
});

// ===== FigmaContext.fromEnv テスト =====

test('FigmaContext.fromEnv - 環境変数からコンテキストを作成できる', () => {
  // Arrange
  process.env.FIGMA_ACCESS_TOKEN = 'env-token';
  delete process.env.FIGMA_BASE_URL;

  // Act
  const context = FigmaContext.fromEnv();

  // Assert
  expect(context.accessToken).toBe('env-token');
  expect(context.baseUrl).toBe('https://api.figma.com');
});

test('FigmaContext.fromEnv - 環境変数からbaseUrlも読み込める', () => {
  // Arrange
  process.env.FIGMA_ACCESS_TOKEN = 'env-token';
  process.env.FIGMA_BASE_URL = 'https://custom.figma.com';

  // Act
  const context = FigmaContext.fromEnv();

  // Assert
  expect(context.baseUrl).toBe('https://custom.figma.com');
});

test('FigmaContext.fromEnv - 環境変数が設定されていない場合、エラーを投げる', () => {
  // Arrange
  delete process.env.FIGMA_ACCESS_TOKEN;

  // Act & Assert
  expect(() => FigmaContext.fromEnv()).toThrow(
    'FIGMA_ACCESS_TOKEN environment variable is required'
  );
});

test('FigmaContext.fromEnv - カスタムtokenKeyを指定した場合、その環境変数が使用される', () => {
  // Arrange
  process.env.CUSTOM_TOKEN = 'custom-env-token';
  delete process.env.FIGMA_ACCESS_TOKEN;

  // Act
  const context = FigmaContext.fromEnv({
    tokenKey: 'CUSTOM_TOKEN',
  });

  // Assert
  expect(context.accessToken).toBe('custom-env-token');
});

test('FigmaContext.fromEnv - カスタムbaseUrlKeyを指定した場合、その環境変数が使用される', () => {
  // Arrange
  process.env.FIGMA_ACCESS_TOKEN = 'test-token';
  process.env.CUSTOM_BASE_URL = 'https://custom-env.figma.com';
  delete process.env.FIGMA_BASE_URL;

  // Act
  const context = FigmaContext.fromEnv({
    baseUrlKey: 'CUSTOM_BASE_URL',
  });

  // Assert
  expect(context.baseUrl).toBe('https://custom-env.figma.com');
});

// ===== FigmaContext.withBaseUrl テスト =====

test('FigmaContext.withBaseUrl - 新しいbaseUrlで新しいコンテキストを作成し、元のコンテキストは変更されない', () => {
  // Arrange
  const original = FigmaContext.from('test-token');
  const newBaseUrl = 'https://new.figma.com';

  // Act
  const updated = FigmaContext.withBaseUrl(original, newBaseUrl);

  // Assert - 新しいコンテキスト
  expect(updated.baseUrl).toBe('https://new.figma.com');
  expect(updated.accessToken).toBe('test-token');

  // Assert - 元のコンテキストは変更されない（イミュータブル性）
  expect(original.baseUrl).toBe('https://api.figma.com');
});

test('FigmaContext.withBaseUrl - 末尾のスラッシュがある場合、削除される', () => {
  // Arrange
  const original = FigmaContext.from('test-token');
  const urlWithSlash = 'https://new.figma.com/';

  // Act
  const updated = FigmaContext.withBaseUrl(original, urlWithSlash);

  // Assert
  expect(updated.baseUrl).toBe('https://new.figma.com');
});

test('FigmaContext.withBaseUrl - 複数の末尾スラッシュがある場合、最後の1つだけ削除される', () => {
  // Arrange
  const original = FigmaContext.from('test-token');
  const urlWithMultipleSlashes = 'https://new.figma.com//';

  // Act
  const updated = FigmaContext.withBaseUrl(original, urlWithMultipleSlashes);

  // Assert
  expect(updated.baseUrl).toBe('https://new.figma.com/');
});

test('FigmaContext.withBaseUrl - 不正なURLを渡した場合でも新しいコンテキストが作成される（validateで検証）', () => {
  // Arrange
  const original = FigmaContext.from('test-token');
  const invalidUrl = 'not-a-valid-url';

  // Act
  const updated = FigmaContext.withBaseUrl(original, invalidUrl);

  // Assert
  expect(updated.baseUrl).toBe('not-a-valid-url');
  expect(FigmaContext.validate(updated)).toBe(false);
});

// ===== FigmaContext.withHeaders テスト =====

test('FigmaContext.withHeaders - 追加のヘッダーをマージした新しいコンテキストを作成する', () => {
  // Arrange
  const original = FigmaContext.from('test-token');
  const additionalHeaders = {
    'Custom-Header': 'custom-value',
    'Another-Header': 'another-value',
  };

  // Act
  const updated = FigmaContext.withHeaders(original, additionalHeaders);

  // Assert - 新しいコンテキスト
  expect(updated.headers).toEqual({
    'X-Figma-Token': 'test-token',
    'Custom-Header': 'custom-value',
    'Another-Header': 'another-value',
  });

  // Assert - 元のコンテキストは変更されない
  expect(original.headers).toEqual({
    'X-Figma-Token': 'test-token',
  });
});

test('FigmaContext.withHeaders - 既存のヘッダーを上書きできる', () => {
  // Arrange
  const original = FigmaContext.from('test-token', {
    headers: { 'Custom-Header': 'old-value' },
  });
  const newHeaders = { 'Custom-Header': 'new-value' };

  // Act
  const updated = FigmaContext.withHeaders(original, newHeaders);

  // Assert
  expect(updated.headers['Custom-Header']).toBe('new-value');
});

test('FigmaContext.withHeaders - 空のヘッダーオブジェクトを渡した場合、元のヘッダーが保持される', () => {
  // Arrange
  const original = FigmaContext.from('test-token');
  const emptyHeaders = {};

  // Act
  const updated = FigmaContext.withHeaders(original, emptyHeaders);

  // Assert
  expect(updated.headers).toEqual({
    'X-Figma-Token': 'test-token',
  });
});

// ===== FigmaContext.validate テスト =====

test('FigmaContext.validate - 有効なコンテキストの場合、trueを返す', () => {
  // Arrange
  const context = FigmaContext.from('test-token');

  // Act
  const isValid = FigmaContext.validate(context);

  // Assert
  expect(isValid).toBe(true);
});

test('FigmaContext.validate - 空文字列のアクセストークンの場合、falseを返す', () => {
  // Arrange
  const context: FigmaContextType = {
    accessToken: '',
    baseUrl: 'https://api.figma.com',
    headers: {
      'X-Figma-Token': '',
    },
  };

  // Act
  const isValid = FigmaContext.validate(context);

  // Assert
  expect(isValid).toBe(false);
});

test('FigmaContext.validate - 空白のみのアクセストークンの場合、falseを返す', () => {
  // Arrange
  const context: FigmaContextType = {
    accessToken: '   ',
    baseUrl: 'https://api.figma.com',
    headers: {
      'X-Figma-Token': '   ',
    },
  };

  // Act
  const isValid = FigmaContext.validate(context);

  // Assert
  expect(isValid).toBe(false);
});

test('FigmaContext.validate - 不正なbaseUrlの場合、falseを返す', () => {
  // Arrange
  const context: FigmaContextType = {
    accessToken: 'test-token',
    baseUrl: 'not-a-url',
    headers: {
      'X-Figma-Token': 'test-token',
    },
  };

  // Act
  const isValid = FigmaContext.validate(context);

  // Assert
  expect(isValid).toBe(false);
});

test('FigmaContext.validate - 必須ヘッダー（X-Figma-Token）がない場合、falseを返す', () => {
  // Arrange
  const context: FigmaContextType = {
    accessToken: 'test-token',
    baseUrl: 'https://api.figma.com',
    headers: {},
  };

  // Act
  const isValid = FigmaContext.validate(context);

  // Assert
  expect(isValid).toBe(false);
});

test('FigmaContext.validate - プロトコルのないURLの場合、falseを返す', () => {
  // Arrange
  const context: FigmaContextType = {
    accessToken: 'test-token',
    baseUrl: 'api.figma.com',
    headers: {
      'X-Figma-Token': 'test-token',
    },
  };

  // Act
  const isValid = FigmaContext.validate(context);

  // Assert
  expect(isValid).toBe(false);
});

test('FigmaContext.validate - アクセストークンがnullの場合、falseを返す', () => {
  // Arrange
  const context = {
    accessToken: null as unknown as string,
    baseUrl: 'https://api.figma.com',
    headers: {
      'X-Figma-Token': 'test-token',
    },
  };

  // Act
  const isValid = FigmaContext.validate(context as FigmaContextType);

  // Assert
  expect(isValid).toBe(false);
});

test('FigmaContext.validate - アクセストークンがundefinedの場合、falseを返す', () => {
  // Arrange
  const context = {
    accessToken: undefined as unknown as string,
    baseUrl: 'https://api.figma.com',
    headers: {
      'X-Figma-Token': 'test-token',
    },
  };

  // Act
  const isValid = FigmaContext.validate(context as FigmaContextType);

  // Assert
  expect(isValid).toBe(false);
});

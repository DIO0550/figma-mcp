import { expect, test, beforeEach, afterEach } from 'vitest';
import { FigmaContext } from '../index.js';

// 環境変数を扱うテストのセットアップ
const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = originalEnv;
});

test('FigmaContext インターフェース - 必要なプロパティ（accessToken, baseUrl, headers）を全て持つ', () => {
  const context: FigmaContext = {
    accessToken: 'test-token',
    baseUrl: 'https://api.figma.com',
    headers: {
      'X-Figma-Token': 'test-token',
    },
  };

  expect(context.accessToken).toBe('test-token');
  expect(context.baseUrl).toBe('https://api.figma.com');
  expect(context.headers['X-Figma-Token']).toBe('test-token');
});

test('FigmaContext.from - アクセストークンのみ指定した場合、デフォルトのbaseUrlとヘッダーが設定される', () => {
  const accessToken = 'test-token';

  const context = FigmaContext.from(accessToken);
  expect(context).toEqual({
    accessToken: 'test-token',
    baseUrl: 'https://api.figma.com',
    headers: {
      'X-Figma-Token': 'test-token',
    },
  });
});

test('FigmaContext.from - カスタムbaseUrlを指定した場合、そのURLが設定される', () => {
  const accessToken = 'test-token';
  const customBaseUrl = 'https://custom.figma.com';

  const context = FigmaContext.from(accessToken, {
    baseUrl: customBaseUrl,
  });
  expect(context.baseUrl).toBe('https://custom.figma.com');
  expect(context.accessToken).toBe('test-token');
});

test('FigmaContext.from - 追加ヘッダーを指定した場合、デフォルトヘッダーとマージされる', () => {
  const accessToken = 'test-token';
  const customHeaders = { 'Custom-Header': 'custom-value' };

  const context = FigmaContext.from(accessToken, {
    headers: customHeaders,
  });
  expect(context.headers).toEqual({
    'X-Figma-Token': 'test-token',
    'Custom-Header': 'custom-value',
  });
});

test('FigmaContext.from - 空文字列のトークンを渡した場合でも、コンテキストは作成される（validateで検証）', () => {
  const emptyToken = '';

  const context = FigmaContext.from(emptyToken);
  expect(context.accessToken).toBe('');
  expect(context.headers['X-Figma-Token']).toBe('');
  expect(FigmaContext.validate(context)).toBe(false);
});

test('FigmaContext.fromEnv - 環境変数からコンテキストを作成できる', () => {
  process.env.FIGMA_ACCESS_TOKEN = 'env-token';
  delete process.env.FIGMA_BASE_URL;

  const context = FigmaContext.fromEnv();
  expect(context.accessToken).toBe('env-token');
  expect(context.baseUrl).toBe('https://api.figma.com');
});

test('FigmaContext.fromEnv - 環境変数からbaseUrlも読み込める', () => {
  process.env.FIGMA_ACCESS_TOKEN = 'env-token';
  process.env.FIGMA_BASE_URL = 'https://custom.figma.com';

  const context = FigmaContext.fromEnv();
  expect(context.baseUrl).toBe('https://custom.figma.com');
});

test('FigmaContext.fromEnv - 環境変数が設定されていない場合、エラーを投げる', () => {
  delete process.env.FIGMA_ACCESS_TOKEN;
  expect(() => FigmaContext.fromEnv()).toThrow(
    'FIGMA_ACCESS_TOKEN environment variable is required'
  );
});

test('FigmaContext.fromEnv - カスタムtokenKeyを指定した場合、その環境変数が使用される', () => {
  process.env.CUSTOM_TOKEN = 'custom-env-token';
  delete process.env.FIGMA_ACCESS_TOKEN;

  const context = FigmaContext.fromEnv({
    tokenKey: 'CUSTOM_TOKEN',
  });
  expect(context.accessToken).toBe('custom-env-token');
});

test('FigmaContext.fromEnv - カスタムbaseUrlKeyを指定した場合、その環境変数が使用される', () => {
  process.env.FIGMA_ACCESS_TOKEN = 'test-token';
  process.env.CUSTOM_BASE_URL = 'https://custom-env.figma.com';
  delete process.env.FIGMA_BASE_URL;

  const context = FigmaContext.fromEnv({
    baseUrlKey: 'CUSTOM_BASE_URL',
  });
  expect(context.baseUrl).toBe('https://custom-env.figma.com');
});

test('FigmaContext.withBaseUrl - 新しいbaseUrlで新しいコンテキストを作成し、元のコンテキストは変更されない', () => {
  const original = FigmaContext.from('test-token');
  const newBaseUrl = 'https://new.figma.com';

  const updated = FigmaContext.withBaseUrl(original, newBaseUrl);

  expect(updated.baseUrl).toBe('https://new.figma.com');
  expect(updated.accessToken).toBe('test-token');
  expect(original.baseUrl).toBe('https://api.figma.com');
});

test('FigmaContext.withBaseUrl - 末尾のスラッシュがある場合、削除される', () => {
  const original = FigmaContext.from('test-token');
  const urlWithSlash = 'https://new.figma.com/';

  const updated = FigmaContext.withBaseUrl(original, urlWithSlash);
  expect(updated.baseUrl).toBe('https://new.figma.com');
});

test('FigmaContext.withBaseUrl - 複数の末尾スラッシュがある場合、最後の1つだけ削除される', () => {
  const original = FigmaContext.from('test-token');
  const urlWithMultipleSlashes = 'https://new.figma.com//';

  const updated = FigmaContext.withBaseUrl(original, urlWithMultipleSlashes);
  expect(updated.baseUrl).toBe('https://new.figma.com/');
});

test('FigmaContext.withBaseUrl - 不正なURLを渡した場合でも新しいコンテキストが作成される（validateで検証）', () => {
  const original = FigmaContext.from('test-token');
  const invalidUrl = 'not-a-valid-url';

  const updated = FigmaContext.withBaseUrl(original, invalidUrl);
  expect(updated.baseUrl).toBe('not-a-valid-url');
  expect(FigmaContext.validate(updated)).toBe(false);
});

test('FigmaContext.withHeaders - 追加のヘッダーをマージした新しいコンテキストを作成する', () => {
  const original = FigmaContext.from('test-token');
  const additionalHeaders = {
    'Custom-Header': 'custom-value',
    'Another-Header': 'another-value',
  };

  const updated = FigmaContext.withHeaders(original, additionalHeaders);

  expect(updated.headers).toEqual({
    'X-Figma-Token': 'test-token',
    'Custom-Header': 'custom-value',
    'Another-Header': 'another-value',
  });
  expect(original.headers).toEqual({
    'X-Figma-Token': 'test-token',
  });
});

test('FigmaContext.withHeaders - 既存のヘッダーを上書きできる', () => {
  const original = FigmaContext.from('test-token', {
    headers: { 'Custom-Header': 'old-value' },
  });
  const newHeaders = { 'Custom-Header': 'new-value' };

  const updated = FigmaContext.withHeaders(original, newHeaders);
  expect(updated.headers['Custom-Header']).toBe('new-value');
});

test('FigmaContext.withHeaders - 空のヘッダーオブジェクトを渡した場合、元のヘッダーが保持される', () => {
  const original = FigmaContext.from('test-token');
  const emptyHeaders = {};

  const updated = FigmaContext.withHeaders(original, emptyHeaders);
  expect(updated.headers).toEqual({
    'X-Figma-Token': 'test-token',
  });
});

test('FigmaContext.validate - 有効なコンテキストの場合、trueを返す', () => {
  const context = FigmaContext.from('test-token');

  const isValid = FigmaContext.validate(context);
  expect(isValid).toBe(true);
});

test('FigmaContext.validate - 空文字列のアクセストークンの場合、falseを返す', () => {
  const context: FigmaContext = {
    accessToken: '',
    baseUrl: 'https://api.figma.com',
    headers: {
      'X-Figma-Token': '',
    },
  };

  const isValid = FigmaContext.validate(context);
  expect(isValid).toBe(false);
});

test('FigmaContext.validate - 空白のみのアクセストークンの場合、falseを返す', () => {
  const context: FigmaContext = {
    accessToken: '   ',
    baseUrl: 'https://api.figma.com',
    headers: {
      'X-Figma-Token': '   ',
    },
  };

  const isValid = FigmaContext.validate(context);
  expect(isValid).toBe(false);
});

test('FigmaContext.validate - 不正なbaseUrlの場合、falseを返す', () => {
  const context: FigmaContext = {
    accessToken: 'test-token',
    baseUrl: 'not-a-url',
    headers: {
      'X-Figma-Token': 'test-token',
    },
  };

  const isValid = FigmaContext.validate(context);
  expect(isValid).toBe(false);
});

test('FigmaContext.validate - 必須ヘッダー（X-Figma-Token）がない場合、falseを返す', () => {
  const context: FigmaContext = {
    accessToken: 'test-token',
    baseUrl: 'https://api.figma.com',
    headers: {},
  };

  const isValid = FigmaContext.validate(context);
  expect(isValid).toBe(false);
});

test('FigmaContext.validate - プロトコルのないURLの場合、falseを返す', () => {
  const context: FigmaContext = {
    accessToken: 'test-token',
    baseUrl: 'api.figma.com',
    headers: {
      'X-Figma-Token': 'test-token',
    },
  };

  const isValid = FigmaContext.validate(context);
  expect(isValid).toBe(false);
});

test('FigmaContext.validate - アクセストークンがnullの場合、falseを返す', () => {
  const context = {
    accessToken: null as unknown as string,
    baseUrl: 'https://api.figma.com',
    headers: {
      'X-Figma-Token': 'test-token',
    },
  };

  const isValid = FigmaContext.validate(context as FigmaContext);
  expect(isValid).toBe(false);
});

test('FigmaContext.validate - アクセストークンがundefinedの場合、falseを返す', () => {
  const context = {
    accessToken: undefined as unknown as string,
    baseUrl: 'https://api.figma.com',
    headers: {
      'X-Figma-Token': 'test-token',
    },
  };

  const isValid = FigmaContext.validate(context as FigmaContext);
  expect(isValid).toBe(false);
});

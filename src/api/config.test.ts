import { describe, test, expect } from 'vitest';
import { createApiConfig, createHeaders, DEFAULT_BASE_URL } from './config';
import { Headers, ContentType } from '../constants';

describe('DEFAULT_BASE_URL', () => {
  test('デフォルトのベースURLが定義されている', () => {
    expect(DEFAULT_BASE_URL).toBe('https://api.figma.com');
  });
});

describe('createApiConfig', () => {
  test('アクセストークンとデフォルトのベースURLでconfigを作成できる', () => {
    const config = createApiConfig('test-token');

    expect(config).toEqual({
      accessToken: 'test-token',
      baseUrl: DEFAULT_BASE_URL,
    });
  });

  test('カスタムベースURLを指定してconfigを作成できる', () => {
    const customUrl = 'https://custom.figma.com';
    const config = createApiConfig('test-token', customUrl);

    expect(config).toEqual({
      accessToken: 'test-token',
      baseUrl: customUrl,
    });
  });

  test('アクセストークンが空文字の場合はエラーを投げる', () => {
    expect(() => createApiConfig('')).toThrow('Figma access token is required');
  });

  test('アクセストークンがundefinedの場合はエラーを投げる', () => {
    expect(() => createApiConfig(undefined as unknown as string)).toThrow(
      'Figma access token is required'
    );
  });

  test('アクセストークンがnullの場合はエラーを投げる', () => {
    expect(() => createApiConfig(null as unknown as string)).toThrow(
      'Figma access token is required'
    );
  });
});

describe('createHeaders', () => {
  test('Figma APIの認証ヘッダーを作成できる', () => {
    const config = createApiConfig('test-token');
    const headers = createHeaders(config);

    expect(headers).toEqual({
      [Headers.FIGMA_TOKEN]: 'test-token',
      [Headers.CONTENT_TYPE]: ContentType.JSON,
    });
  });

  test('異なるトークンで異なるヘッダーを作成できる', () => {
    const config = createApiConfig('another-token');
    const headers = createHeaders(config);

    expect(headers[Headers.FIGMA_TOKEN]).toBe('another-token');
  });
});

import { describe, expect, it, beforeEach } from 'vitest';
import { FigmaContext } from './context.js';

describe('FigmaContext', () => {
  describe('インターフェース', () => {
    it('必要なプロパティを持つ', () => {
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
  });

  describe('FigmaContext.from', () => {
    it('アクセストークンからコンテキストを作成できる', () => {
      const context = FigmaContext.from('test-token');

      expect(context).toEqual({
        accessToken: 'test-token',
        baseUrl: 'https://api.figma.com',
        headers: {
          'X-Figma-Token': 'test-token',
        },
      });
    });

    it('オプションのbaseUrlを指定できる', () => {
      const context = FigmaContext.from('test-token', {
        baseUrl: 'https://custom.figma.com',
      });

      expect(context.baseUrl).toBe('https://custom.figma.com');
    });

    it('追加のヘッダーを指定できる', () => {
      const context = FigmaContext.from('test-token', {
        headers: {
          'Custom-Header': 'custom-value',
        },
      });

      expect(context.headers).toEqual({
        'X-Figma-Token': 'test-token',
        'Custom-Header': 'custom-value',
      });
    });
  });

  describe('FigmaContext.fromEnv', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    it('環境変数からコンテキストを作成できる', () => {
      process.env.FIGMA_ACCESS_TOKEN = 'env-token';
      
      const context = FigmaContext.fromEnv();

      expect(context.accessToken).toBe('env-token');
      expect(context.baseUrl).toBe('https://api.figma.com');
    });

    it('環境変数からbaseUrlも読み込める', () => {
      process.env.FIGMA_ACCESS_TOKEN = 'env-token';
      process.env.FIGMA_BASE_URL = 'https://custom.figma.com';
      
      const context = FigmaContext.fromEnv();

      expect(context.baseUrl).toBe('https://custom.figma.com');
    });

    it('環境変数が設定されていない場合はエラーを投げる', () => {
      delete process.env.FIGMA_ACCESS_TOKEN;

      expect(() => FigmaContext.fromEnv()).toThrow(
        'FIGMA_ACCESS_TOKEN environment variable is required'
      );
    });

    it('オプションで環境変数名をカスタマイズできる', () => {
      process.env.CUSTOM_TOKEN = 'custom-env-token';
      
      const context = FigmaContext.fromEnv({
        tokenKey: 'CUSTOM_TOKEN',
      });

      expect(context.accessToken).toBe('custom-env-token');
    });
  });

  describe('FigmaContext.withBaseUrl', () => {
    it('baseUrlを変更した新しいコンテキストを返す', () => {
      const original = FigmaContext.from('test-token');
      const updated = FigmaContext.withBaseUrl(original, 'https://new.figma.com');

      expect(updated.baseUrl).toBe('https://new.figma.com');
      expect(updated.accessToken).toBe('test-token');
      expect(original.baseUrl).toBe('https://api.figma.com'); // 元のオブジェクトは変更されない
    });

    it('URLの末尾のスラッシュを削除する', () => {
      const original = FigmaContext.from('test-token');
      const updated = FigmaContext.withBaseUrl(original, 'https://new.figma.com/');

      expect(updated.baseUrl).toBe('https://new.figma.com');
    });
  });

  describe('FigmaContext.validate', () => {
    it('有効なコンテキストの場合はtrueを返す', () => {
      const context = FigmaContext.from('test-token');
      
      expect(FigmaContext.validate(context)).toBe(true);
    });

    it('アクセストークンが空の場合はfalseを返す', () => {
      const context: FigmaContext = {
        accessToken: '',
        baseUrl: 'https://api.figma.com',
        headers: {},
      };
      
      expect(FigmaContext.validate(context)).toBe(false);
    });

    it('baseUrlが不正な場合はfalseを返す', () => {
      const context: FigmaContext = {
        accessToken: 'test-token',
        baseUrl: 'not-a-url',
        headers: {
          'X-Figma-Token': 'test-token',
        },
      };
      
      expect(FigmaContext.validate(context)).toBe(false);
    });

    it('必須ヘッダーがない場合はfalseを返す', () => {
      const context: FigmaContext = {
        accessToken: 'test-token',
        baseUrl: 'https://api.figma.com',
        headers: {},
      };
      
      expect(FigmaContext.validate(context)).toBe(false);
    });
  });

  describe('FigmaContext.withHeaders', () => {
    it('追加のヘッダーをマージした新しいコンテキストを返す', () => {
      const original = FigmaContext.from('test-token');
      const updated = FigmaContext.withHeaders(original, {
        'Custom-Header': 'custom-value',
        'Another-Header': 'another-value',
      });

      expect(updated.headers).toEqual({
        'X-Figma-Token': 'test-token',
        'Custom-Header': 'custom-value',
        'Another-Header': 'another-value',
      });
      expect(original.headers).toEqual({
        'X-Figma-Token': 'test-token',
      }); // 元のオブジェクトは変更されない
    });

    it('既存のヘッダーを上書きできる', () => {
      const original = FigmaContext.from('test-token', {
        headers: {
          'Custom-Header': 'old-value',
        },
      });
      const updated = FigmaContext.withHeaders(original, {
        'Custom-Header': 'new-value',
      });

      expect(updated.headers['Custom-Header']).toBe('new-value');
    });
  });
});
import { describe, test, expect } from 'vitest';
import { parseFigmaUrl } from './figma-url-parser.js';
import { ErrorMessages } from '../constants/index.js';

describe('parseFigmaUrl', () => {
  describe('ファイルURLのパース', () => {
    test('標準的なファイルURLから情報を抽出できる', () => {
      const url = 'https://www.figma.com/file/ABC123xyz/My-Design-File';
      const result = parseFigmaUrl(url);
      
      expect(result).toEqual({
        fileId: 'ABC123xyz',
        fileName: 'My-Design-File',
        nodeId: undefined,
      });
    });

    test('ファイル名なしのURLから情報を抽出できる', () => {
      const url = 'https://www.figma.com/file/ABC123xyz';
      const result = parseFigmaUrl(url);
      
      expect(result).toEqual({
        fileId: 'ABC123xyz',
        fileName: undefined,
        nodeId: undefined,
      });
    });

    test('ノードID付きのファイルURLから情報を抽出できる', () => {
      const url = 'https://www.figma.com/file/ABC123xyz/My-Design-File?node-id=1234-5678';
      const result = parseFigmaUrl(url);
      
      expect(result).toEqual({
        fileId: 'ABC123xyz',
        fileName: 'My-Design-File',
        nodeId: '1234-5678',
      });
    });
  });

  describe('デザインURLのパース', () => {
    test('標準的なデザインURLから情報を抽出できる', () => {
      const url = 'https://www.figma.com/design/XYZ789abc/My-Design-File';
      const result = parseFigmaUrl(url);
      
      expect(result).toEqual({
        fileId: 'XYZ789abc',
        fileName: 'My-Design-File',
        nodeId: undefined,
      });
    });

    test('ノードID付きのデザインURLから情報を抽出できる', () => {
      const url = 'https://www.figma.com/design/XYZ789abc/My-Design-File?node-id=9876-5432';
      const result = parseFigmaUrl(url);
      
      expect(result).toEqual({
        fileId: 'XYZ789abc',
        fileName: 'My-Design-File',
        nodeId: '9876-5432',
      });
    });
  });

  describe('エラーケース', () => {
    test('無効なURLの場合はエラーをスローする', () => {
      const url = 'not-a-url';
      
      expect(() => parseFigmaUrl(url)).toThrow(ErrorMessages.INVALID_URL);
    });

    test('Figma以外のURLの場合はエラーをスローする', () => {
      const url = 'https://example.com/file/ABC123xyz';
      
      expect(() => parseFigmaUrl(url)).toThrow('Not a Figma URL');
    });

    test('サポートされていないFigmaのURLパターンの場合はエラーをスローする', () => {
      const url = 'https://www.figma.com/proto/ABC123xyz/Prototype';
      
      expect(() => parseFigmaUrl(url)).toThrow('Unsupported Figma URL pattern');
    });
  });

  describe('URLバリエーション', () => {
    test('wwwなしのURLも処理できる', () => {
      const url = 'https://figma.com/file/ABC123xyz/My-Design-File';
      const result = parseFigmaUrl(url);
      
      expect(result).toEqual({
        fileId: 'ABC123xyz',
        fileName: 'My-Design-File',
        nodeId: undefined,
      });
    });

    test('複数のクエリパラメータがある場合もnode-idを抽出できる', () => {
      const url = 'https://www.figma.com/file/ABC123xyz/My-Design-File?node-id=1234-5678&t=abcdef&scaling=min-zoom';
      const result = parseFigmaUrl(url);
      
      expect(result).toEqual({
        fileId: 'ABC123xyz',
        fileName: 'My-Design-File',
        nodeId: '1234-5678',
      });
    });

    test('URLエンコードされたファイル名も処理できる', () => {
      const url = 'https://www.figma.com/file/ABC123xyz/My%20Design%20File';
      const result = parseFigmaUrl(url);
      
      expect(result).toEqual({
        fileId: 'ABC123xyz',
        fileName: 'My Design File',
        nodeId: undefined,
      });
    });
  });
});
import { describe, it, expect } from 'vitest';
import { FigmaInfo } from './figma-info.js';

describe('FigmaInfo', () => {
  describe('fromUrl', () => {
    it('有効なFigma URLからFigmaInfoを生成できる', () => {
      const url = 'https://www.figma.com/file/ABC123xyz/My-Design-File?node-id=1234-5678';
      const figmaInfo = FigmaInfo.fromUrl(url);
      
      expect(figmaInfo).toEqual({
        fileId: 'ABC123xyz',
        fileName: 'My-Design-File',
        nodeId: '1234-5678',
      });
    });

    it('design URLからもFigmaInfoを生成できる', () => {
      const url = 'https://www.figma.com/design/XYZ789abc/Another-File';
      const figmaInfo = FigmaInfo.fromUrl(url);
      
      expect(figmaInfo).toEqual({
        fileId: 'XYZ789abc',
        fileName: 'Another-File',
        nodeId: undefined,
      });
    });

    it('node-idがない場合はundefinedになる', () => {
      const url = 'https://www.figma.com/file/ABC123xyz/My-Design-File';
      const figmaInfo = FigmaInfo.fromUrl(url);
      
      expect(figmaInfo.nodeId).toBeUndefined();
    });

    it('無効なURLの場合はエラーをスローする', () => {
      expect(() => {
        FigmaInfo.fromUrl('not-a-url');
      }).toThrow('Invalid URL');
    });

    it('Figma以外のURLの場合はエラーをスローする', () => {
      expect(() => {
        FigmaInfo.fromUrl('https://example.com/file/123');
      }).toThrow('Not a Figma URL');
    });

    it('サポートされていないURLパターンの場合はエラーをスローする', () => {
      expect(() => {
        FigmaInfo.fromUrl('https://www.figma.com/proto/ABC123');
      }).toThrow('Unsupported Figma URL pattern');
    });

    it('ファイル名に複数のスラッシュが含まれる場合も正しく処理される', () => {
      const url = 'https://www.figma.com/file/ABC123xyz/My/Design/File/With/Slashes';
      const figmaInfo = FigmaInfo.fromUrl(url);
      
      expect(figmaInfo).toEqual({
        fileId: 'ABC123xyz',
        fileName: 'My/Design/File/With/Slashes',
        nodeId: undefined,
      });
    });

    it('URLエンコードされたファイル名をデコードする', () => {
      const url = 'https://www.figma.com/file/ABC123xyz/My%20Design%20File%20%E2%9C%A8';
      const figmaInfo = FigmaInfo.fromUrl(url);
      
      expect(figmaInfo).toEqual({
        fileId: 'ABC123xyz',
        fileName: 'My Design File ✨',
        nodeId: undefined,
      });
    });
  });

  describe('fromObject', () => {
    it('オブジェクトからFigmaInfoを生成できる', () => {
      const obj = {
        fileId: 'ABC123xyz',
        fileName: 'My-Design-File',
        nodeId: '1234-5678',
      };
      const figmaInfo = FigmaInfo.fromObject(obj);
      
      expect(figmaInfo).toEqual(obj);
    });

    it('fileIdがない場合はundefinedを返す', () => {
      const obj = {
        fileName: 'My-Design-File',
        nodeId: '1234-5678',
      };
      const figmaInfo = FigmaInfo.fromObject(obj);
      
      expect(figmaInfo).toBeUndefined();
    });

    it('fileIdのみでもFigmaInfoを生成できる', () => {
      const obj = {
        fileId: 'ABC123xyz',
      };
      const figmaInfo = FigmaInfo.fromObject(obj);
      
      expect(figmaInfo).toEqual({
        fileId: 'ABC123xyz',
        fileName: undefined,
        nodeId: undefined,
      });
    });
  });

  describe('create', () => {
    it('引数からFigmaInfoを生成できる', () => {
      const figmaInfo = FigmaInfo.create('ABC123xyz', 'My-Design-File', '1234-5678');
      
      expect(figmaInfo).toEqual({
        fileId: 'ABC123xyz',
        fileName: 'My-Design-File',
        nodeId: '1234-5678',
      });
    });

    it('fileIdのみでもFigmaInfoを生成できる', () => {
      const figmaInfo = FigmaInfo.create('ABC123xyz');
      
      expect(figmaInfo).toEqual({
        fileId: 'ABC123xyz',
        fileName: undefined,
        nodeId: undefined,
      });
    });

    it('fileIdとfileNameでFigmaInfoを生成できる', () => {
      const figmaInfo = FigmaInfo.create('ABC123xyz', 'My-Design-File');
      
      expect(figmaInfo).toEqual({
        fileId: 'ABC123xyz',
        fileName: 'My-Design-File',
        nodeId: undefined,
      });
    });
  });
});
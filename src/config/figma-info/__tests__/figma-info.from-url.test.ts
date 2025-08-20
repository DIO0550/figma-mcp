import { test, expect } from 'vitest';
import { FigmaInfo } from '../figma-info.js';

test('FigmaInfo.fromUrl - 有効なFigma URLからFigmaInfoを生成できる', () => {
  const url = 'https://www.figma.com/file/ABC123xyz/My-Design-File?node-id=1234-5678';
  const figmaInfo = FigmaInfo.fromUrl(url);
  
  expect(figmaInfo).toEqual({
    fileId: 'ABC123xyz',
    fileName: 'My-Design-File',
    nodeId: '1234-5678',
  });
});

test('FigmaInfo.fromUrl - design URLからもFigmaInfoを生成できる', () => {
  const url = 'https://www.figma.com/design/XYZ789abc/Another-File';
  const figmaInfo = FigmaInfo.fromUrl(url);
  
  expect(figmaInfo).toEqual({
    fileId: 'XYZ789abc',
    fileName: 'Another-File',
    nodeId: undefined,
  });
});

test('FigmaInfo.fromUrl - node-idがない場合はundefinedになる', () => {
  const url = 'https://www.figma.com/file/ABC123xyz/My-Design-File';
  const figmaInfo = FigmaInfo.fromUrl(url);
  
  expect(figmaInfo.nodeId).toBeUndefined();
});

test('FigmaInfo.fromUrl - 無効なURLの場合はエラーをスローする', () => {
  expect(() => {
    FigmaInfo.fromUrl('not-a-url');
  }).toThrow('Invalid URL');
});

test('FigmaInfo.fromUrl - Figma以外のURLの場合はエラーをスローする', () => {
  expect(() => {
    FigmaInfo.fromUrl('https://example.com/file/123');
  }).toThrow('Not a Figma URL');
});

test('FigmaInfo.fromUrl - サポートされていないURLパターンの場合はエラーをスローする', () => {
  expect(() => {
    FigmaInfo.fromUrl('https://www.figma.com/proto/ABC123');
  }).toThrow('Unsupported Figma URL pattern');
});

test('FigmaInfo.fromUrl - ファイル名に複数のスラッシュが含まれる場合も正しく処理される', () => {
  const url = 'https://www.figma.com/file/ABC123xyz/My/Design/File/With/Slashes';
  const figmaInfo = FigmaInfo.fromUrl(url);
  
  expect(figmaInfo).toEqual({
    fileId: 'ABC123xyz',
    fileName: 'My/Design/File/With/Slashes',
    nodeId: undefined,
  });
});

test('FigmaInfo.fromUrl - URLエンコードされたファイル名をデコードする', () => {
  const url = 'https://www.figma.com/file/ABC123xyz/My%20Design%20File%20%E2%9C%A8';
  const figmaInfo = FigmaInfo.fromUrl(url);
  
  expect(figmaInfo).toEqual({
    fileId: 'ABC123xyz',
    fileName: 'My Design File ✨',
    nodeId: undefined,
  });
});
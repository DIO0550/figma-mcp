import { describe, test, expect, beforeEach, vi } from 'vitest';
import { parseFigmaUrl } from './parse-figma-url.js';
import * as runtimeConfig from '../../config/runtime-config.js';

// runtime-configをモック化
vi.mock('../../config/runtime-config.js');

describe('parseFigmaUrl tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(runtimeConfig.setRuntimeConfig).mockImplementation(() => {});
  });

  test('有効なファイルURLをパースして保存できる', () => {
    const url = 'https://www.figma.com/file/ABC123xyz/My-Design-File?node-id=1234-5678';
    
    const result = parseFigmaUrl({ url });

    // 正しい結果を返すことを確認
    expect(result).toEqual({
      figmaInfo: {
        fileId: 'ABC123xyz',
        fileName: 'My-Design-File',
        nodeId: '1234-5678',
      },
      message: 'Figma URL parsed and saved successfully',
    });

    // runtime-configに保存されることを確認
    expect(runtimeConfig.setRuntimeConfig).toHaveBeenCalledWith({
      figmaInfo: {
        fileId: 'ABC123xyz',
        fileName: 'My-Design-File',
        nodeId: '1234-5678',
      },
    });
  });

  test('有効なデザインURLをパースして保存できる', () => {
    const url = 'https://www.figma.com/design/XYZ789abc/Another-Design';
    
    const result = parseFigmaUrl({ url });

    expect(result).toEqual({
      figmaInfo: {
        fileId: 'XYZ789abc',
        fileName: 'Another-Design',
        nodeId: undefined,
      },
      message: 'Figma URL parsed and saved successfully',
    });
  });

  test('ファイル名なしのURLも処理できる', () => {
    const url = 'https://www.figma.com/file/ABC123xyz';
    
    const result = parseFigmaUrl({ url });

    expect(result).toEqual({
      figmaInfo: {
        fileId: 'ABC123xyz',
        fileName: undefined,
        nodeId: undefined,
      },
      message: 'Figma URL parsed and saved successfully',
    });
  });

  test('無効なURLの場合はエラーを返す', () => {
    const url = 'not-a-url';
    
    expect(() => parseFigmaUrl({ url })).toThrow('Invalid URL');
  });

  test('Figma以外のURLの場合はエラーを返す', () => {
    const url = 'https://example.com/file/ABC123xyz';
    
    expect(() => parseFigmaUrl({ url })).toThrow('Not a Figma URL');
  });

  test('サポートされていないFigmaのURLパターンの場合はエラーを返す', () => {
    const url = 'https://www.figma.com/proto/ABC123xyz/Prototype';
    
    expect(() => parseFigmaUrl({ url })).toThrow('Unsupported Figma URL pattern');
  });
});
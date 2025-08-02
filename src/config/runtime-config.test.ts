import { describe, it, expect, beforeEach } from 'vitest';
import { setRuntimeConfig, getRuntimeConfig, resetRuntimeConfig } from './runtime-config.js';

describe('Runtime Config', () => {
  beforeEach(() => {
    resetRuntimeConfig();
  });

  it('初期状態は空のオブジェクト', () => {
    const config = getRuntimeConfig();
    expect(config).toEqual({});
  });

  it('設定を追加できる', () => {
    setRuntimeConfig({ baseUrl: 'https://api.figma.com' });
    const config = getRuntimeConfig();
    expect(config.baseUrl).toBe('https://api.figma.com');
  });

  it('設定を部分的に更新できる', () => {
    setRuntimeConfig({ baseUrl: 'https://api.figma.com' });
    setRuntimeConfig({ baseUrl: 'https://custom.figma.com' });

    const config = getRuntimeConfig();
    expect(config.baseUrl).toBe('https://custom.figma.com');
  });

  it('リセットできる', () => {
    setRuntimeConfig({ baseUrl: 'https://api.figma.com' });
    resetRuntimeConfig();

    const config = getRuntimeConfig();
    expect(config).toEqual({});
  });

  it('設定のコピーを返す（immutability）', () => {
    setRuntimeConfig({ baseUrl: 'https://api.figma.com' });

    const config1 = getRuntimeConfig();
    const config2 = getRuntimeConfig();

    expect(config1).not.toBe(config2);
    expect(config1).toEqual(config2);
  });

  describe('Figma情報の管理', () => {
    it('Figma情報を保存できる', () => {
      setRuntimeConfig({
        figmaInfo: {
          fileId: 'ABC123xyz',
          fileName: 'My-Design-File',
          nodeId: '1234-5678',
        }
      });

      const config = getRuntimeConfig();
      expect(config.figmaInfo).toEqual({
        fileId: 'ABC123xyz',
        fileName: 'My-Design-File',
        nodeId: '1234-5678',
      });
    });

    it('Figma情報を部分的に更新できる', () => {
      setRuntimeConfig({
        figmaInfo: {
          fileId: 'ABC123xyz',
          fileName: 'My-Design-File',
        }
      });

      setRuntimeConfig({
        figmaInfo: {
          ...getRuntimeConfig().figmaInfo,
          nodeId: '1234-5678',
        }
      });

      const config = getRuntimeConfig();
      expect(config.figmaInfo).toEqual({
        fileId: 'ABC123xyz',
        fileName: 'My-Design-File',
        nodeId: '1234-5678',
      });
    });

    it('他の設定と共存できる', () => {
      setRuntimeConfig({
        baseUrl: 'https://api.figma.com',
        figmaInfo: {
          fileId: 'ABC123xyz',
        }
      });

      const config = getRuntimeConfig();
      expect(config.baseUrl).toBe('https://api.figma.com');
      expect(config.figmaInfo?.fileId).toBe('ABC123xyz');
    });
  });
});

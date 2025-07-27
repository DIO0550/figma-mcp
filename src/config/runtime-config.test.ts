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
});

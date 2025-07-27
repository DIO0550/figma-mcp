import { describe, it, expect, beforeEach } from 'vitest';
import { setConfig } from './set.js';
import { resetRuntimeConfig, getRuntimeConfig } from '../../config/runtime-config.js';

describe('setConfig', () => {
  beforeEach(() => {
    resetRuntimeConfig();
  });

  it('ベースURLを設定できる', async () => {
    const result = await setConfig({
      baseUrl: 'https://custom.figma.com',
    });

    expect(result.success).toBe(true);
    expect(result.config.baseUrl).toBe('https://custom.figma.com');
    expect(result.message).toContain('Configuration updated successfully');
  });

  it('空のパラメータでも成功する', async () => {
    const result = await setConfig({});

    expect(result.success).toBe(true);
    expect(result.config).toEqual({});
  });

  it('設定が永続化される', async () => {
    await setConfig({
      baseUrl: 'https://test.figma.com',
    });

    const config = getRuntimeConfig();
    expect(config.baseUrl).toBe('https://test.figma.com');
  });

  it('複数回の設定が正しくマージされる', async () => {
    await setConfig({
      baseUrl: 'https://first.figma.com',
    });

    const result = await setConfig({
      baseUrl: 'https://second.figma.com',
    });

    expect(result.config.baseUrl).toBe('https://second.figma.com');
  });
});

import { it, expect, beforeEach } from 'vitest';
import { 
  setRuntimeConfig, 
  getRuntimeConfig, 
  resetRuntimeConfig 
} from '../runtime-config.js';

beforeEach(() => {
  resetRuntimeConfig();
});

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
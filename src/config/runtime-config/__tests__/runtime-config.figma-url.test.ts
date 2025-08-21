import { it, expect, beforeEach } from 'vitest';
import { 
  getRuntimeConfig, 
  resetRuntimeConfig,
  setFigmaInfoFromUrl
} from '../runtime-config.js';

beforeEach(() => {
  resetRuntimeConfig();
});

it('URLからFigmaInfoを設定できる', () => {
  const url = 'https://www.figma.com/file/ABC123xyz/My-Design-File?node-id=1234-5678';
  setFigmaInfoFromUrl(url);
  
  const config = getRuntimeConfig();
  expect(config.figmaInfo).toEqual({
    fileId: 'ABC123xyz',
    fileName: 'My-Design-File',
    nodeId: '1234-5678',
  });
});

it('無効なURLの場合はエラーをスローする', () => {
  expect(() => {
    setFigmaInfoFromUrl('not-a-url');
  }).toThrow();
});
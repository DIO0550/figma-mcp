import { test, expect } from 'vitest';
import { FigmaInfo } from '../figma-info.js';

test('FigmaInfo.fromObject - オブジェクトからFigmaInfoを生成できる', () => {
  const obj = {
    fileId: 'ABC123xyz',
    fileName: 'My-Design-File',
    nodeId: '1234-5678',
  };
  const figmaInfo = FigmaInfo.fromObject(obj);
  
  expect(figmaInfo).toEqual(obj);
});

test('FigmaInfo.fromObject - fileIdがない場合はundefinedを返す', () => {
  const obj = {
    fileName: 'My-Design-File',
    nodeId: '1234-5678',
  };
  const figmaInfo = FigmaInfo.fromObject(obj);
  
  expect(figmaInfo).toBeUndefined();
});

test('FigmaInfo.fromObject - fileIdのみでもFigmaInfoを生成できる', () => {
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
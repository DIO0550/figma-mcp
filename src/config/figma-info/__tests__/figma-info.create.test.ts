import { test, expect } from 'vitest';
import { FigmaInfo } from '../figma-info.js';

test('FigmaInfo.create - 引数からFigmaInfoを生成できる', () => {
  const figmaInfo = FigmaInfo.create('ABC123xyz', 'My-Design-File', '1234-5678');
  
  expect(figmaInfo).toEqual({
    fileId: 'ABC123xyz',
    fileName: 'My-Design-File',
    nodeId: '1234-5678',
  });
});

test('FigmaInfo.create - fileIdのみでもFigmaInfoを生成できる', () => {
  const figmaInfo = FigmaInfo.create('ABC123xyz');
  
  expect(figmaInfo).toEqual({
    fileId: 'ABC123xyz',
    fileName: undefined,
    nodeId: undefined,
  });
});

test('FigmaInfo.create - fileIdとfileNameでFigmaInfoを生成できる', () => {
  const figmaInfo = FigmaInfo.create('ABC123xyz', 'My-Design-File');
  
  expect(figmaInfo).toEqual({
    fileId: 'ABC123xyz',
    fileName: 'My-Design-File',
    nodeId: undefined,
  });
});
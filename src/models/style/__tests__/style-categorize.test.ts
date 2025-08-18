import { test, expect } from 'vitest';
import { Style } from '../style.js';
import { createMockStyle } from './style-test-helpers.js';

test('Style.categorize: 空のスタイル配列で空の結果を返す', () => {
  const result = Style.categorize([]);
  
  expect(result.categorized).toEqual({});
  expect(result.statistics).toEqual({
    total: 0,
    byType: {},
    namingConsistency: 0,
  });
});

test('Style.categorize: 単一のフラットなスタイルを正しく分類する', () => {
  const styles = [createMockStyle('style-1', 'Primary Color')];
  const result = Style.categorize(styles);
  
  expect(result.categorized).toEqual({
    FILL: {
      Other: ['style-1'],
    },
  });
  expect(result.statistics).toEqual({
    total: 1,
    byType: { FILL: 1 },
    namingConsistency: 0,
  });
});

test('Style.categorize: 階層的な名前を持つスタイルを正しく分類する', () => {
  const styles = [
    createMockStyle('style-1', 'Colors/Primary/Blue'),
    createMockStyle('style-2', 'Colors/Primary/Red'),
    createMockStyle('style-3', 'Colors/Secondary/Green'),
  ];
  const result = Style.categorize(styles);
  
  expect(result.categorized).toEqual({
    FILL: {
      'Colors/Primary': ['style-1', 'style-2'],
      'Colors/Secondary': ['style-3'],
    },
  });
  expect(result.statistics).toEqual({
    total: 3,
    byType: { FILL: 3 },
    namingConsistency: 1,
  });
});

test('Style.categorize: 複数のスタイルタイプを正しく分類する', () => {
  const styles = [
    createMockStyle('style-1', 'Colors/Primary', 'FILL'),
    createMockStyle('style-2', 'Typography/Heading', 'TEXT'),
    createMockStyle('style-3', 'Effects/Shadow', 'EFFECT'),
    createMockStyle('style-4', 'Layout/Grid', 'GRID'),
  ];
  const result = Style.categorize(styles);
  
  expect(result.categorized).toEqual({
    FILL: {
      Colors: ['style-1'],
    },
    TEXT: {
      Typography: ['style-2'],
    },
    EFFECT: {
      Effects: ['style-3'],
    },
    GRID: {
      Layout: ['style-4'],
    },
  });
  expect(result.statistics.byType).toEqual({
    FILL: 1,
    TEXT: 1,
    EFFECT: 1,
    GRID: 1,
  });
});

test('Style.categorize: 階層的とフラットなスタイルの混在を処理する', () => {
  const styles = [
    createMockStyle('style-1', 'Colors/Primary/Blue'),
    createMockStyle('style-2', 'SimpleStyle'),
    createMockStyle('style-3', 'Typography/Body/Regular'),
  ];
  const result = Style.categorize(styles);
  
  expect(result.categorized.FILL).toHaveProperty('Colors/Primary');
  expect(result.categorized.FILL).toHaveProperty('Other');
  expect(result.categorized.FILL.Other).toContain('style-2');
  expect(result.statistics.namingConsistency).toBeCloseTo(0.67, 1);
});
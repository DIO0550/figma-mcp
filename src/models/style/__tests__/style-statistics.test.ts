import { test, expect } from 'vitest';
import { Style } from '../style.js';
import { createMockStyle } from './style-test-helpers.js';

test('Style.calculateStatistics: 統計情報を正しく計算する', () => {
  const styles = [
    createMockStyle('style-1', 'Colors/Primary', 'FILL'),
    createMockStyle('style-2', 'Text', 'TEXT'),
    createMockStyle('style-3', 'Colors/Secondary', 'FILL'),
    createMockStyle('style-4', 'Shadow', 'EFFECT'),
  ];
  
  const stats = Style.calculateStatistics(styles);
  expect(stats).toEqual({
    total: 4,
    byType: {
      FILL: 2,
      TEXT: 1,
      EFFECT: 1,
    },
    namingConsistency: 0.5,
  });
});

test('Style.calculateStatistics: 空の配列で適切なデフォルト値を返す', () => {
  const stats = Style.calculateStatistics([]);
  expect(stats).toEqual({
    total: 0,
    byType: {},
    namingConsistency: 0,
  });
});

test('Style.calculateStatistics: すべて階層的な名前の場合、整合性100%', () => {
  const styles = [
    createMockStyle('style-1', 'Colors/Primary/Blue', 'FILL'),
    createMockStyle('style-2', 'Typography/Heading/H1', 'TEXT'),
    createMockStyle('style-3', 'Effects/Shadow/Soft', 'EFFECT'),
  ];
  
  const stats = Style.calculateStatistics(styles);
  expect(stats.namingConsistency).toBe(1);
  expect(stats.total).toBe(3);
});

test('Style.calculateStatistics: すべてフラットな名前の場合、整合性0%', () => {
  const styles = [
    createMockStyle('style-1', 'Blue', 'FILL'),
    createMockStyle('style-2', 'Heading', 'TEXT'),
    createMockStyle('style-3', 'Shadow', 'EFFECT'),
  ];
  
  const stats = Style.calculateStatistics(styles);
  expect(stats.namingConsistency).toBe(0);
  expect(stats.total).toBe(3);
});

test('Style.calculateStatistics: 単一のスタイルタイプのみの場合', () => {
  const styles = [
    createMockStyle('style-1', 'Color1', 'FILL'),
    createMockStyle('style-2', 'Color2', 'FILL'),
    createMockStyle('style-3', 'Color3', 'FILL'),
  ];
  
  const stats = Style.calculateStatistics(styles);
  expect(stats.byType).toEqual({ FILL: 3 });
  expect(stats.total).toBe(3);
});
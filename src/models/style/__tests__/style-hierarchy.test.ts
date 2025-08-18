import { test, expect } from 'vitest';
import { Style } from '../style.js';
import { createMockStyle } from './style-test-helpers.js';

test('Style.getHierarchical: 階層的な名前を持つスタイルのみを取得する', () => {
  const styles = [
    createMockStyle('style-1', 'Colors/Primary'),
    createMockStyle('style-2', 'SimpleStyle'),
    createMockStyle('style-3', 'Typography/Body/Regular'),
  ];
  
  const hierarchical = Style.getHierarchical(styles);
  expect(hierarchical).toHaveLength(2);
  expect(hierarchical.map(s => s.key)).toEqual(['style-1', 'style-3']);
});

test('Style.getHierarchical: すべてフラットな場合は空の配列を返す', () => {
  const styles = [
    createMockStyle('style-1', 'Color1'),
    createMockStyle('style-2', 'Color2'),
  ];
  
  const result = Style.getHierarchical(styles);
  expect(result).toEqual([]);
});

test('Style.getHierarchical: 空の配列に対して空の配列を返す', () => {
  const result = Style.getHierarchical([]);
  expect(result).toEqual([]);
});

test('Style.getFlat: フラットな名前を持つスタイルのみを取得する', () => {
  const styles = [
    createMockStyle('style-1', 'Colors/Primary'),
    createMockStyle('style-2', 'SimpleStyle'),
    createMockStyle('style-3', 'AnotherSimple'),
  ];
  
  const flat = Style.getFlat(styles);
  expect(flat).toHaveLength(2);
  expect(flat.map(s => s.key)).toEqual(['style-2', 'style-3']);
});

test('Style.getFlat: すべて階層的な場合は空の配列を返す', () => {
  const styles = [
    createMockStyle('style-1', 'Colors/Primary'),
    createMockStyle('style-2', 'Typography/Body'),
  ];
  
  const result = Style.getFlat(styles);
  expect(result).toEqual([]);
});

test('Style.getFlat: 空の配列に対して空の配列を返す', () => {
  const result = Style.getFlat([]);
  expect(result).toEqual([]);
});
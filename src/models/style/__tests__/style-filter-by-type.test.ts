import { test, expect } from 'vitest';
import { Style } from '../style.js';
import { createMockStyle } from './style-test-helpers.js';

test('Style.filterByType: 指定したタイプのスタイルのみをフィルタリングする', () => {
  const styles = [
    createMockStyle('style-1', 'Color1', 'FILL'),
    createMockStyle('style-2', 'Text1', 'TEXT'),
    createMockStyle('style-3', 'Color2', 'FILL'),
    createMockStyle('style-4', 'Effect1', 'EFFECT'),
  ];
  
  const fillStyles = Style.filterByType(styles, 'FILL');
  expect(fillStyles).toHaveLength(2);
  expect(fillStyles.map(s => s.key)).toEqual(['style-1', 'style-3']);
  
  const textStyles = Style.filterByType(styles, 'TEXT');
  expect(textStyles).toHaveLength(1);
  expect(textStyles[0].key).toBe('style-2');
});

test('Style.filterByType: 存在しないタイプで空の配列を返す', () => {
  const styles = [createMockStyle('style-1', 'Color1', 'FILL')];
  const result = Style.filterByType(styles, 'TEXT');
  expect(result).toEqual([]);
});

test('Style.filterByType: 空の配列に対して空の配列を返す', () => {
  const result = Style.filterByType([], 'FILL');
  expect(result).toEqual([]);
});
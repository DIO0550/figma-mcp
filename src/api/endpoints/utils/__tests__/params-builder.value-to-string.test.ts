import { test, expect } from 'vitest';
import { valueToString } from '../params-builder.js';

test('valueToString: 配列を渡すとカンマ区切り文字列として返される', () => {
  expect(valueToString(['a', 'b', 'c'])).toBe('a,b,c');
  expect(valueToString([1, 2, 3])).toBe('1,2,3');
  expect(valueToString([])).toBe('');
});

test('valueToString: 真偽値を渡すと"true"/"false"文字列として返される', () => {
  expect(valueToString(true)).toBe('true');
  expect(valueToString(false)).toBe('false');
});

test('valueToString: 数値を渡すと文字列として返される', () => {
  expect(valueToString(42)).toBe('42');
  expect(valueToString(0)).toBe('0');
  expect(valueToString(-1)).toBe('-1');
  expect(valueToString(3.14)).toBe('3.14');
});

test('valueToString: 文字列を渡すとそのまま返される', () => {
  expect(valueToString('hello')).toBe('hello');
  expect(valueToString('')).toBe('');
  expect(valueToString('with spaces')).toBe('with spaces');
});

test('valueToString: 特殊な数値を渡すと文字列に変換される', () => {
  expect(valueToString(Infinity)).toBe('Infinity');
  expect(valueToString(-Infinity)).toBe('-Infinity');
  expect(valueToString(NaN)).toBe('NaN');
});

test('valueToString: 混合型の配列を渡すと全て文字列として結合される', () => {
  const mixedArray = ['text', 123, true, false];
  expect(valueToString(mixedArray)).toBe('text,123,true,false');
});

test('valueToString: 単一要素の配列を渡すと要素のみが文字列として返される', () => {
  expect(valueToString(['single'])).toBe('single');
  expect(valueToString([42])).toBe('42');
  expect(valueToString([true])).toBe('true');
});

test('valueToString: 長い配列を渡しても正しく処理される', () => {
  const longArray = Array.from({ length: 1000 }, (_, i) => i.toString());
  const result = valueToString(longArray);

  expect(result.split(',').length).toBe(1000);
  expect(result.startsWith('0,1,2')).toBe(true);
  expect(result.endsWith('997,998,999')).toBe(true);
});

test('valueToString: null値を含む配列を渡すと空文字列として扱われる', () => {
  const arrayWithNull = ['a', null, 'b'];
  expect(valueToString(arrayWithNull)).toBe('a,,b');
});

test('valueToString: undefined値を含む配列を渡すと空文字列として扱われる', () => {
  const arrayWithUndefined = ['a', undefined, 'b'];
  expect(valueToString(arrayWithUndefined)).toBe('a,,b');
});

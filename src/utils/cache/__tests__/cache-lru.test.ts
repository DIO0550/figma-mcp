import { test, expect, beforeEach, afterEach, vi } from 'vitest';
import { createCache } from '../cache.js';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

test('キャッシュの最大容量を超えると、最も古いデータが自動削除される', () => {
  const cache = createCache({ maxSize: 3 });

  cache.set('key1', 'value1');
  vi.advanceTimersByTime(1);
  cache.set('key2', 'value2');
  vi.advanceTimersByTime(1);
  cache.set('key3', 'value3');
  vi.advanceTimersByTime(1);
  cache.set('key4', 'value4'); // key1が削除される

  expect(cache.get('key1')).toBeUndefined();
  expect(cache.get('key2')).toBe('value2');
  expect(cache.get('key3')).toBe('value3');
  expect(cache.get('key4')).toBe('value4');
});

test('データを取得すると、そのデータが最新として扱われる', () => {
  const cache = createCache({ maxSize: 3 });

  cache.set('key1', 'value1');
  vi.advanceTimersByTime(1);
  cache.set('key2', 'value2');
  vi.advanceTimersByTime(1);
  cache.set('key3', 'value3');
  vi.advanceTimersByTime(1);

  cache.get('key1'); // key1を最近使用に
  vi.advanceTimersByTime(1);
  cache.set('key4', 'value4'); // key2が削除される

  expect(cache.get('key1')).toBe('value1');
  expect(cache.get('key2')).toBeUndefined();
  expect(cache.get('key3')).toBe('value3');
  expect(cache.get('key4')).toBe('value4');
});

test('既存データを更新すると、そのデータが最新として扱われる', () => {
  const cache = createCache({ maxSize: 3 });

  cache.set('key1', 'value1');
  cache.set('key2', 'value2');
  cache.set('key3', 'value3');

  // key1を更新（最近使用に）
  cache.set('key1', 'updated');

  // key4を追加（key2が削除される）
  cache.set('key4', 'value4');

  expect(cache.get('key1')).toBe('updated');
  expect(cache.get('key2')).toBeUndefined();
  expect(cache.get('key3')).toBe('value3');
  expect(cache.get('key4')).toBe('value4');
});

test('キャッシュに1つしかデータを保存できない設定でも正しく動作する', () => {
  const cache = createCache({ maxSize: 1 });

  cache.set('key1', 'value1');
  expect(cache.get('key1')).toBe('value1');

  cache.set('key2', 'value2');
  expect(cache.get('key1')).toBeUndefined();
  expect(cache.get('key2')).toBe('value2');
});

test('最大容量を設定しない場合、無制限にデータを保存できる', () => {
  const LARGE_ITEM_COUNT = 1000;
  const cache = createCache(); // maxSizeを指定しない

  // 大量のアイテムを追加
  for (let i = 0; i < LARGE_ITEM_COUNT; i++) {
    cache.set(`key${i}`, `value${i}`);
  }

  // 全てのアイテムが保持される
  expect(cache.get('key0')).toBe('value0');
  expect(cache.get('key999')).toBe('value999');
  expect(cache.size()).toBe(LARGE_ITEM_COUNT);
});

import { test, expect, beforeEach, afterEach, vi } from 'vitest';
import { createCache } from '../cache.js';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

test('容量を超えると最も使われていないアイテムが削除される', () => {
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

test('getアクセスでLRU順序が更新される', () => {
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

test('setでアクセスした既存アイテムもLRU順序が更新される', () => {
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

test('maxSizeが1の場合でも正しく動作する', () => {
  const cache = createCache({ maxSize: 1 });

  cache.set('key1', 'value1');
  expect(cache.get('key1')).toBe('value1');

  cache.set('key2', 'value2');
  expect(cache.get('key1')).toBeUndefined();
  expect(cache.get('key2')).toBe('value2');
});

test('maxSizeを指定しない場合は容量制限なしで動作する', () => {
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

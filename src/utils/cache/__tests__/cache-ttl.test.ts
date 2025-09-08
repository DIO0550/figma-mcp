import { test, expect, beforeEach, afterEach, vi } from 'vitest';
import { createCache } from '../cache.js';
import { Limits } from '../../../constants/index.js';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

test('TTL経過後に値が削除される', () => {
  const cache = createCache({ defaultTtl: Limits.DEFAULT_CACHE_TTL });

  cache.set('key1', 'value1');
  expect(cache.get('key1')).toBe('value1');

  vi.advanceTimersByTime(Limits.DEFAULT_CACHE_TTL + 1);
  expect(cache.get('key1')).toBeUndefined();
});

test('個別のTTLを設定できる', () => {
  const cache = createCache({ defaultTtl: Limits.DEFAULT_CACHE_TTL });

  cache.set('key1', 'value1', 500);
  cache.set('key2', 'value2'); // デフォルトTTL使用

  vi.advanceTimersByTime(600);
  expect(cache.get('key1')).toBeUndefined();
  expect(cache.get('key2')).toBe('value2');
});

test('TTLが設定されていない場合は期限切れにならない', () => {
  const cache = createCache(); // defaultTtlなし

  cache.set('key1', 'value1');

  vi.advanceTimersByTime(1000 * 60 * 60 * 24); // 1日経過
  expect(cache.get('key1')).toBe('value1');
});

test('期限切れアイテムはhasでfalseを返す', () => {
  const cache = createCache({ defaultTtl: 1000 });

  cache.set('key1', 'value1');
  expect(cache.has('key1')).toBe(true);

  vi.advanceTimersByTime(1001);
  expect(cache.has('key1')).toBe(false);
});

test('期限切れアイテムはsizeメソッドでカウントされない', () => {
  const cache = createCache({ defaultTtl: 1000 });

  cache.set('key1', 'value1');
  cache.set('key2', 'value2', 500); // 500ms TTL
  cache.set('key3', 'value3'); // デフォルトTTL

  expect(cache.size()).toBe(3);

  vi.advanceTimersByTime(600); // key2が期限切れ
  expect(cache.size()).toBe(2);

  vi.advanceTimersByTime(500); // key1とkey3も期限切れ
  expect(cache.size()).toBe(0);
});

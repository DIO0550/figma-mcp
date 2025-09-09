import { test, expect, beforeEach, afterEach, vi } from 'vitest';
import { createCache } from '../cache.js';
import { Limits } from '../../../constants/index.js';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

test('保存期限を過ぎるとデータが自動的に削除される', () => {
  const cache = createCache({ defaultTtl: Limits.DEFAULT_CACHE_TTL });

  cache.set('key1', 'value1');
  expect(cache.get('key1')).toBe('value1');

  vi.advanceTimersByTime(Limits.DEFAULT_CACHE_TTL + 1);
  expect(cache.get('key1')).toBeUndefined();
});

test('データごとに異なる保存期限を設定できる', () => {
  const cache = createCache({ defaultTtl: Limits.DEFAULT_CACHE_TTL });

  cache.set('key1', 'value1', 500);
  cache.set('key2', 'value2'); // デフォルトTTL使用

  vi.advanceTimersByTime(600);
  expect(cache.get('key1')).toBeUndefined();
  expect(cache.get('key2')).toBe('value2');
});

test('保存期限を設定しない場合、データは永続的に保存される', () => {
  const cache = createCache(); // defaultTtlなし

  cache.set('key1', 'value1');

  vi.advanceTimersByTime(1000 * 60 * 60 * 24); // 1日経過
  expect(cache.get('key1')).toBe('value1');
});

test('期限切れデータは存在しないものとして扱われる', () => {
  const TTL = 1000;
  const AFTER_EXPIRY = TTL + 1;
  const cache = createCache({ defaultTtl: TTL });

  cache.set('key1', 'value1');
  expect(cache.has('key1')).toBe(true);

  vi.advanceTimersByTime(AFTER_EXPIRY);
  expect(cache.has('key1')).toBe(false);
});

test('期限切れデータは保存数に含まれない', () => {
  const DEFAULT_TTL = 1000;
  const SHORT_TTL = 500;
  const AFTER_SHORT_TTL = 600;
  const ADDITIONAL_WAIT_TIME = 500; // 追加で500ms（合計1100ms）

  const cache = createCache({ defaultTtl: DEFAULT_TTL });

  cache.set('key1', 'value1');
  cache.set('key2', 'value2', SHORT_TTL);
  cache.set('key3', 'value3'); // デフォルトTTL使用

  expect(cache.size()).toBe(3);

  vi.advanceTimersByTime(AFTER_SHORT_TTL); // key2が期限切れ
  expect(cache.size()).toBe(2);

  vi.advanceTimersByTime(ADDITIONAL_WAIT_TIME); // key1とkey3も期限切れ
  expect(cache.size()).toBe(0);
});

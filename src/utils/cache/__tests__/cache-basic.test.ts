import { test, expect } from 'vitest';
import { createCache } from '../cache.js';

test('キャッシュに値を保存すると、その値が取得できる', () => {
  const cache = createCache();

  cache.set('key1', 'value1');

  expect(cache.get('key1')).toBe('value1');
});

test('存在しないキーを取得しようとすると、何も返されない', () => {
  const cache = createCache();

  expect(cache.get('nonexistent')).toBeUndefined();
});

test('同じキーで新しい値を保存すると、古い値が上書きされる', () => {
  const cache = createCache();

  cache.set('key1', 'value1');
  cache.set('key1', 'value2');

  expect(cache.get('key1')).toBe('value2');
});

test('キャッシュをクリアすると、全ての保存された値が削除される', () => {
  const cache = createCache();

  cache.set('key1', 'value1');
  cache.set('key2', 'value2');
  cache.clear();

  expect(cache.get('key1')).toBeUndefined();
  expect(cache.get('key2')).toBeUndefined();
});

test('キーが存在するかどうかを確認できる', () => {
  const cache = createCache();

  cache.set('key1', 'value1');

  expect(cache.has('key1')).toBe(true);
  expect(cache.has('key2')).toBe(false);
});

test('特定のキーの値だけを削除できる', () => {
  const cache = createCache();

  cache.set('key1', 'value1');
  cache.set('key2', 'value2');
  cache.delete('key1');

  expect(cache.get('key1')).toBeUndefined();
  expect(cache.get('key2')).toBe('value2');
});

test('キャッシュに保存されている値の数を確認できる', () => {
  const cache = createCache();

  expect(cache.size()).toBe(0);

  cache.set('key1', 'value1');
  cache.set('key2', 'value2');
  expect(cache.size()).toBe(2);

  cache.delete('key1');
  expect(cache.size()).toBe(1);
});

test('ユーザー情報のような複雑なデータも保存して取得できる', () => {
  interface User {
    id: number;
    name: string;
  }

  const userCache = createCache<User>();
  const user: User = { id: 1, name: 'Alice' };

  userCache.set('user1', user);
  const retrieved = userCache.get('user1');

  expect(retrieved?.name).toBe('Alice');
});

import { test, expect } from 'vitest';
import { createCache } from '../cache.js';

test('値を保存して取得できる', () => {
  const cache = createCache();

  cache.set('key1', 'value1');

  expect(cache.get('key1')).toBe('value1');
});

test('存在しないキーはundefinedを返す', () => {
  const cache = createCache();

  expect(cache.get('nonexistent')).toBeUndefined();
});

test('値を上書きできる', () => {
  const cache = createCache();

  cache.set('key1', 'value1');
  cache.set('key1', 'value2');

  expect(cache.get('key1')).toBe('value2');
});

test('clearで全てのアイテムを削除できる', () => {
  const cache = createCache();

  cache.set('key1', 'value1');
  cache.set('key2', 'value2');
  cache.clear();

  expect(cache.get('key1')).toBeUndefined();
  expect(cache.get('key2')).toBeUndefined();
});

test('hasでキーの存在を確認できる', () => {
  const cache = createCache();

  cache.set('key1', 'value1');

  expect(cache.has('key1')).toBe(true);
  expect(cache.has('key2')).toBe(false);
});

test('deleteで特定のキーを削除できる', () => {
  const cache = createCache();

  cache.set('key1', 'value1');
  cache.set('key2', 'value2');
  cache.delete('key1');

  expect(cache.get('key1')).toBeUndefined();
  expect(cache.get('key2')).toBe('value2');
});

test('sizeで現在のアイテム数を取得できる', () => {
  const cache = createCache();

  expect(cache.size()).toBe(0);

  cache.set('key1', 'value1');
  cache.set('key2', 'value2');
  expect(cache.size()).toBe(2);

  cache.delete('key1');
  expect(cache.size()).toBe(1);
});

test('異なる型のオブジェクトを正しく保存・取得できる', () => {
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

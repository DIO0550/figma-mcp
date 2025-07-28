import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createCache } from './cache.js';

describe('Cache', () => {
  describe('基本機能', () => {
    it('値を保存して取得できる', () => {
      const cache = createCache();

      cache.set('key1', 'value1');

      expect(cache.get('key1')).toBe('value1');
    });

    it('存在しないキーはundefinedを返す', () => {
      const cache = createCache();

      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('値を上書きできる', () => {
      const cache = createCache();

      cache.set('key1', 'value1');
      cache.set('key1', 'value2');

      expect(cache.get('key1')).toBe('value2');
    });
  });

  describe('TTL機能', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('TTL経過後に値が削除される', () => {
      const cache = createCache({ defaultTtl: 1000 });

      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');

      vi.advanceTimersByTime(1001);
      expect(cache.get('key1')).toBeUndefined();
    });

    it('個別のTTLを設定できる', () => {
      const cache = createCache({ defaultTtl: 1000 });

      cache.set('key1', 'value1', 500);
      cache.set('key2', 'value2'); // デフォルトTTL使用

      vi.advanceTimersByTime(600);
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBe('value2');
    });
  });

  describe('LRU機能', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('容量を超えると最も使われていないアイテムが削除される', () => {
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

    it('getアクセスでLRU順序が更新される', () => {
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
  });

  describe('その他の機能', () => {
    it('clearで全てのアイテムを削除できる', () => {
      const cache = createCache();

      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();

      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
    });

    it('hasでキーの存在を確認できる', () => {
      const cache = createCache();

      cache.set('key1', 'value1');

      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(false);
    });

    it('deleteで特定のキーを削除できる', () => {
      const cache = createCache();

      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.delete('key1');

      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBe('value2');
    });

    it('sizeで現在のアイテム数を取得できる', () => {
      const cache = createCache();

      expect(cache.size()).toBe(0);

      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      expect(cache.size()).toBe(2);

      cache.delete('key1');
      expect(cache.size()).toBe(1);
    });
  });

  describe('型安全性', () => {
    it('ジェネリクスで型を指定できる', () => {
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
  });
});

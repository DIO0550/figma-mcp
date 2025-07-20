interface CacheOptions {
  defaultTtl?: number;
  maxSize?: number;
}

interface CacheItem<T> {
  value: T;
  expiresAt?: number;
  lastAccessed: number;
}

interface Cache<T = unknown> {
  get(key: string): T | undefined;
  set(key: string, value: T, ttl?: number): void;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
  size(): number;
}

export function createCache<T = unknown>(options: CacheOptions = {}): Cache<T> {
  const { defaultTtl, maxSize = Infinity } = options;
  const cache = new Map<string, CacheItem<T>>();

  const isExpired = (item: CacheItem<T>): boolean => {
    if (!item.expiresAt) return false;
    return Date.now() > item.expiresAt;
  };

  const evictLRU = (): void => {
    if (cache.size >= maxSize) {
      let oldestKey: string | null = null;
      let oldestTime = Infinity;

      for (const [key, item] of cache.entries()) {
        if (item.lastAccessed < oldestTime) {
          oldestTime = item.lastAccessed;
          oldestKey = key;
        }
      }

      if (oldestKey) {
        cache.delete(oldestKey);
      }
    }
  };

  return {
    get(key: string): T | undefined {
      const item = cache.get(key);
      if (!item) return undefined;

      if (isExpired(item)) {
        cache.delete(key);
        return undefined;
      }

      item.lastAccessed = Date.now();
      return item.value;
    },

    set(key: string, value: T, ttl?: number): void {
      const effectiveTtl = ttl ?? defaultTtl;
      const expiresAt = effectiveTtl ? Date.now() + effectiveTtl : undefined;

      // 既存のキーの場合はLRU削除をスキップ
      if (!cache.has(key)) {
        evictLRU();
      }

      cache.set(key, {
        value,
        expiresAt,
        lastAccessed: Date.now(),
      });
    },

    has(key: string): boolean {
      const item = cache.get(key);
      if (!item) return false;

      if (isExpired(item)) {
        cache.delete(key);
        return false;
      }

      return true;
    },

    delete(key: string): boolean {
      return cache.delete(key);
    },

    clear(): void {
      cache.clear();
    },

    size(): number {
      // 期限切れアイテムを除外してカウント
      let count = 0;
      for (const [key, item] of cache.entries()) {
        if (!isExpired(item)) {
          count++;
        } else {
          cache.delete(key);
        }
      }
      return count;
    },
  };
}
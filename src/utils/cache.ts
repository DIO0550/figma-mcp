/**
 * LRUキャッシュの実装
 *
 * このモジュールは、最近最も使用されていない（Least Recently Used）アイテムを
 * 自動的に削除する効率的なキャッシュを提供します。
 *
 * 主な機能:
 * - O(1)時間での get/set/delete 操作
 * - TTL（Time To Live）サポート
 * - 最大サイズ制限
 * - コンパニオンオブジェクトパターンによる関数型アプローチ
 *
 * 設計上の決定:
 * - 双方向連結リストとハッシュマップの組み合わせでO(1)操作を実現
 * - センチネルノードによる境界条件の簡略化
 * - イミュータブルなキャッシュ構造とピュアな操作関数の分離
 */

/**
 * キャッシュオプション
 */
interface CacheOptions {
  /** デフォルトのTTL（ミリ秒） */
  defaultTtl?: number;
  /** キャッシュの最大サイズ（デフォルト: Infinity） */
  maxSize?: number;
}

/**
 * キャッシュアイテム
 */
interface CacheItem<T> {
  /** 保存された値 */
  value: T;
  /** 有効期限のタイムスタンプ（ミリ秒） */
  expiresAt?: number;
}

/**
 * LRU用の双方向連結リストノード
 */
interface LRUNode<T> {
  /** キャッシュのキー */
  key: string;
  /** キャッシュアイテム（センチネルノードの場合はundefined） */
  item?: CacheItem<T>;
  /** 前のノードへの参照 */
  prev: LRUNode<T> | null;
  /** 次のノードへの参照 */
  next: LRUNode<T> | null;
}

/**
 * キャッシュデータ構造（データのみを保持、メソッドは含まない）
 */
export interface Cache<T = unknown> {
  /** キーとノードのマッピングを保持するストア */
  readonly store: Map<string, LRUNode<T>>;
  /** 双方向連結リストのヘッド（センチネルノード） */
  readonly head: LRUNode<T>;
  /** 双方向連結リストのテール（センチネルノード） */
  readonly tail: LRUNode<T>;
  /** デフォルトのTTL（ミリ秒） */
  readonly defaultTtl?: number;
  /** キャッシュの最大サイズ */
  readonly maxSize: number;
}

/**
 * すべての操作を含むキャッシュコンパニオンオブジェクト
 */
export const Cache = {
  /**
   * 新しいキャッシュインスタンスを作成
   * @param options キャッシュオプション
   * @returns 新しいキャッシュインスタンス
   */
  create<T = unknown>(options: CacheOptions = {}): Cache<T> {
    const { defaultTtl, maxSize = Infinity } = options;

    // センチネルノード（ダミーのヘッドとテール）
    // これにより境界条件の処理が簡略化される
    const head: LRUNode<T> = {
      key: '',
      item: undefined,
      prev: null,
      next: null,
    };
    const tail: LRUNode<T> = {
      key: '',
      item: undefined,
      prev: null,
      next: null,
    };

    // 初期化時にheadとtailを接続
    head.next = tail;
    tail.prev = head;

    return {
      store: new Map<string, LRUNode<T>>(),
      head,
      tail,
      defaultTtl,
      maxSize,
    };
  },

  /**
   * キャッシュから値を取得
   * @param cache キャッシュインスタンス
   * @param key 取得するキー
   * @returns キャッシュされた値、存在しないか期限切れの場合はundefined
   */
  get<T>(cache: Cache<T>, key: string): T | undefined {
    const node = cache.store.get(key);
    if (!node || !node.item) return undefined;

    if (isExpired(node.item)) {
      removeNode(node);
      cache.store.delete(key);
      return undefined;
    }

    // アクセスされたノードを先頭に移動（最近使用をマーク）
    moveToFront(cache, node);
    return node.item.value;
  },

  /**
   * キャッシュに値を設定
   * @param cache キャッシュインスタンス
   * @param key 設定するキー
   * @param value 設定する値
   * @param ttl TTL（ミリ秒）、指定しない場合はデフォルトTTLを使用
   */
  set<T>(cache: Cache<T>, key: string, value: T, ttl?: number): void {
    const effectiveTtl = ttl ?? cache.defaultTtl;
    const expiresAt = effectiveTtl ? Date.now() + effectiveTtl : undefined;

    const existingNode = cache.store.get(key);

    if (existingNode) {
      // 既存のキーの場合は値を更新して先頭に移動
      existingNode.item = { value, expiresAt };
      moveToFront(cache, existingNode);
    } else {
      // 新規キーの場合
      // 容量チェックして必要なら最も使用されていないアイテムを削除
      if (cache.store.size >= cache.maxSize) {
        const lruKey = removeLRU(cache);
        if (lruKey) {
          cache.store.delete(lruKey);
        }
      }

      // 新しいノードを作成して先頭に追加
      const newNode: LRUNode<T> = {
        key,
        item: { value, expiresAt },
        prev: null,
        next: null,
      };
      cache.store.set(key, newNode);
      addToFront(cache, newNode);
    }
  },

  /**
   * キーが存在するか確認
   * @param cache キャッシュインスタンス
   * @param key 確認するキー
   * @returns キーが存在し、期限切れでない場合はtrue
   */
  has<T>(cache: Cache<T>, key: string): boolean {
    const node = cache.store.get(key);
    if (!node || !node.item) return false;

    if (isExpired(node.item)) {
      removeNode(node);
      cache.store.delete(key);
      return false;
    }

    return true;
  },

  /**
   * キャッシュからキーを削除
   * @param cache キャッシュインスタンス
   * @param key 削除するキー
   * @returns 削除に成功した場合はtrue
   */
  delete<T>(cache: Cache<T>, key: string): boolean {
    const node = cache.store.get(key);
    if (!node) return false;

    removeNode(node);
    return cache.store.delete(key);
  },

  /**
   * キャッシュをクリア
   * @param cache キャッシュインスタンス
   */
  clear<T>(cache: Cache<T>): void {
    cache.store.clear();
    cache.head.next = cache.tail;
    cache.tail.prev = cache.head;
  },

  /**
   * キャッシュの現在のサイズを取得
   * 注意: この操作は期限切れアイテムのクリーンアップを伴うため、
   * 副作用があり、O(n)時間がかかる可能性がある
   * @param cache キャッシュインスタンス
   * @returns 有効なアイテムの数
   */
  size<T>(cache: Cache<T>): number {
    // 期限切れアイテムの遅延削除を実行
    // これにより正確なサイズを保証する
    const keysToDelete: string[] = [];

    for (const [key, node] of cache.store.entries()) {
      if (node.item && isExpired(node.item)) {
        keysToDelete.push(key);
      }
    }

    // 期限切れアイテムを削除
    for (const key of keysToDelete) {
      const node = cache.store.get(key);
      if (node) {
        removeNode(node);
        cache.store.delete(key);
      }
    }

    return cache.store.size;
  },
};

/**
 * ノードを双方向リストの先頭に追加
 * LRUキャッシュでは最近使用したアイテムを先頭に配置することで、
 * O(1)時間でのアクセス順序管理を実現する
 * @param cache キャッシュインスタンス
 * @param node 追加するノード
 */
function addToFront<T>(cache: Cache<T>, node: LRUNode<T>): void {
  node.prev = cache.head;
  node.next = cache.head.next;
  if (cache.head.next) {
    cache.head.next.prev = node;
  }
  cache.head.next = node;
}

/**
 * ノードを双方向リストから削除
 * ポインタの付け替えのみで実現するため、O(1)時間で完了
 * @param node 削除するノード
 */
function removeNode<T>(node: LRUNode<T>): void {
  const prevNode = node.prev;
  const nextNode = node.next;
  if (prevNode) {
    prevNode.next = nextNode;
  }
  if (nextNode) {
    nextNode.prev = prevNode;
  }
}

/**
 * ノードを先頭に移動（最近使用したことをマーク）
 * 削除と追加の組み合わせで実現、両操作がO(1)のため全体もO(1)
 * @param cache キャッシュインスタンス
 * @param node 移動するノード
 */
function moveToFront<T>(cache: Cache<T>, node: LRUNode<T>): void {
  removeNode(node);
  addToFront(cache, node);
}

/**
 * 最も使用されていないノードを削除
 * 双方向リストのテール直前のノードが最古のアイテム
 * @param cache キャッシュインスタンス
 * @returns 削除されたノードのキー、リストが空の場合はnull
 */
function removeLRU<T>(cache: Cache<T>): string | null {
  if (cache.tail.prev === cache.head) {
    return null;
  }
  const lruNode = cache.tail.prev;
  if (!lruNode) {
    return null;
  }
  removeNode(lruNode);
  return lruNode.key;
}

/**
 * アイテムが期限切れかどうか確認
 * @param item キャッシュアイテム
 * @returns 期限切れの場合はtrue
 */
function isExpired<T>(item: CacheItem<T>): boolean {
  if (!item.expiresAt) return false;
  return Date.now() > item.expiresAt;
}

/**
 * レガシーインターフェース（後方互換性のため）
 * 将来的にはCache.create()とCacheコンパニオンオブジェクトの使用を推奨
 *
 * @deprecated v2.0.0で廃止予定（2025年6月）
 * 代わりにCache.create()とCacheコンパニオンオブジェクトを使用してください
 *
 * 移行ガイド:
 * ```typescript
 * // 旧: レガシーインターフェース
 * const cache = createCache<string>();
 * cache.set('key', 'value');
 * const value = cache.get('key');
 *
 * // 新: コンパニオンオブジェクトパターン
 * const cache = Cache.create<string>();
 * Cache.set(cache, 'key', 'value');
 * const value = Cache.get(cache, 'key');
 * ```
 */
interface LegacyCache<T = unknown> {
  get(key: string): T | undefined;
  set(key: string, value: T, ttl?: number): void;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
  size(): number;
}

/**
 * レガシーファクトリ関数（後方互換性のため）
 * 既存のコードとの互換性を保つためのラッパー
 * 新規コードではCache.create()の使用を推奨
 *
 * @deprecated v2.0.0で廃止予定（2025年6月）
 * 代わりにCache.create()とCacheコンパニオンオブジェクトを使用してください
 * @param options キャッシュオプション
 * @returns レガシーキャッシュインターフェース
 */
export function createCache<T = unknown>(options: CacheOptions = {}): LegacyCache<T> {
  const cache = Cache.create<T>(options);

  return {
    get(key: string): T | undefined {
      return Cache.get(cache, key);
    },
    set(key: string, value: T, ttl?: number): void {
      Cache.set(cache, key, value, ttl);
    },
    has(key: string): boolean {
      return Cache.has(cache, key);
    },
    delete(key: string): boolean {
      return Cache.delete(cache, key);
    },
    clear(): void {
      Cache.clear(cache);
    },
    size(): number {
      return Cache.size(cache);
    },
  };
}

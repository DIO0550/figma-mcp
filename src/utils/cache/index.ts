/**
 * キャッシュモジュールのエントリポイント
 *
 * このモジュールはLRU（Least Recently Used）キャッシュの実装を提供します。
 * すべてのキャッシュ関連の機能はこのエントリポイントからエクスポートされます。
 */

// メインのエクスポート
export { Cache, createCache } from './cache.js';

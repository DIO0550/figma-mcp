/**
 * ケース変換ユーティリティ
 *
 * スネークケースとキャメルケース間の実行時変換を提供します。
 * APIとのやり取りで使用されます。
 */

import type { DeepSnakeCase, DeepCamelCase } from './type-transformers.js';

/**
 * スネークケースをキャメルケースに変換
 */
export function snakeToCamelCase(str: string): string {
  // 先頭のアンダースコアを保持
  const leadingUnderscores = str.match(/^_+/)?.[0] || '';
  const withoutLeading = str.slice(leadingUnderscores.length);

  // アンダースコアの後の文字を大文字に変換（数字の後のアンダースコアは削除のみ）
  const converted = withoutLeading
    .replace(/_([a-zA-Z])/g, (_, letter: string) => letter.toUpperCase())
    .replace(/_(\d)/g, '$1'); // 数字の前のアンダースコアは削除

  return leadingUnderscores + converted;
}

/**
 * キャメルケースをスネークケースに変換
 */
export function camelToSnakeCase(str: string): string {
  // アクロニムを正規化
  const normalized = str
    .replace(/HTTPS/g, 'Https')
    .replace(/HTTP/g, 'Http')
    .replace(/XML/g, 'Xml')
    .replace(/URL/g, 'Url')
    .replace(/API/g, 'Api')
    .replace(/JSON/g, 'Json')
    .replace(/SVG/g, 'Svg')
    .replace(/PDF/g, 'Pdf')
    .replace(/IO/g, 'Io')
    .replace(/ID/g, 'Id');

  return normalized.replace(/[A-Z]/g, (letter, index) => {
    return index > 0 ? `_${letter.toLowerCase()}` : letter.toLowerCase();
  });
}

/**
 * オブジェクトのキーをスネークケースからキャメルケースに変換
 */
export function convertKeysToCamelCase<T>(obj: T): DeepCamelCase<T> {
  if (obj === null || obj === undefined) {
    return obj as DeepCamelCase<T>;
  }

  if (Array.isArray(obj)) {
    return obj.map((item): unknown => convertKeysToCamelCase(item)) as DeepCamelCase<T>;
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const converted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = snakeToCamelCase(key);
      converted[camelKey] = convertKeysToCamelCase(value);
    }
    return converted as DeepCamelCase<T>;
  }

  return obj as DeepCamelCase<T>;
}

/**
 * オブジェクトのキーをキャメルケースからスネークケースに変換
 */
export function convertKeysToSnakeCase<T>(obj: T): DeepSnakeCase<T> {
  if (obj === null || obj === undefined) {
    return obj as DeepSnakeCase<T>;
  }

  if (Array.isArray(obj)) {
    return obj.map((item): unknown => convertKeysToSnakeCase(item)) as DeepSnakeCase<T>;
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const converted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = camelToSnakeCase(key);
      converted[snakeKey] = convertKeysToSnakeCase(value);
    }
    return converted as DeepSnakeCase<T>;
  }

  return obj as DeepSnakeCase<T>;
}

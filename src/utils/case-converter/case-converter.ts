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
 * オブジェクトのキーを再帰的に変換する汎用関数
 */
function convertKeysRecursively<T, R>(
  obj: T,
  keyConverter: (key: string) => string,
  recursiveFn: (value: unknown) => unknown
): R {
  if (obj === null || obj === undefined) {
    return obj as unknown as R;
  }

  if (Array.isArray(obj)) {
    return obj.map((item): unknown => recursiveFn(item)) as R;
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const converted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const newKey = keyConverter(key);
      converted[newKey] = recursiveFn(value);
    }
    return converted as R;
  }

  return obj as unknown as R;
}

/**
 * オブジェクトのキーをスネークケースからキャメルケースに変換
 */
export function convertKeysToCamelCase<T>(obj: T): DeepCamelCase<T> {
  return convertKeysRecursively<T, DeepCamelCase<T>>(obj, snakeToCamelCase, (value) =>
    convertKeysToCamelCase(value)
  );
}

/**
 * オブジェクトのキーをキャメルケースからスネークケースに変換
 */
export function convertKeysToSnakeCase<T>(obj: T): DeepSnakeCase<T> {
  return convertKeysRecursively<T, DeepSnakeCase<T>>(obj, camelToSnakeCase, (value) =>
    convertKeysToSnakeCase(value)
  );
}

/**
 * ケース変換ユーティリティ
 *
 * スネークケースとキャメルケース間の実行時変換を提供します。
 * APIとのやり取りで使用されます。
 */

/**
 * スネークケースをキャメルケースに変換
 */
export function snakeToCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
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
export function convertKeysToCamelCase<T>(obj: unknown): T {
  if (obj === null || obj === undefined) {
    return obj as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => convertKeysToCamelCase(item)) as T;
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const converted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = snakeToCamelCase(key);
      converted[camelKey] = convertKeysToCamelCase(value);
    }
    return converted as T;
  }

  return obj as T;
}

/**
 * オブジェクトのキーをキャメルケースからスネークケースに変換
 */
export function convertKeysToSnakeCase<T>(obj: unknown): T {
  if (obj === null || obj === undefined) {
    return obj as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => convertKeysToSnakeCase(item)) as T;
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const converted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = camelToSnakeCase(key);
      converted[snakeKey] = convertKeysToSnakeCase(value);
    }
    return converted as T;
  }

  return obj as T;
}

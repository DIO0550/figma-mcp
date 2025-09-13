import { camelToSnakeCase } from '../../../utils/case-converter/index.js';
import type { DeepSnakeCase } from '../../../utils/case-converter/index.js';

/**
 * 任意の値をFigma APIのクエリパラメータ値として使用可能な文字列に変換する
 *
 * @param value - 変換対象の値
 * @returns URLパラメータとして使用可能な文字列
 *
 * @example
 * valueToString(['a', 'b', 'c']) // 'a,b,c'
 * valueToString(true)            // 'true'
 * valueToString(42)              // '42'
 */
export function valueToString(value: unknown): string {
  if (Array.isArray(value)) {
    return value.join(',');
  }

  if (typeof value === 'boolean' || typeof value === 'number') {
    return String(value);
  }

  // 型安全性を確保: 明示的にString()を使用
  return String(value);
}

/**
 * オブジェクトからFigma API用のURLSearchParamsを構築する
 *
 * camelCaseのプロパティ名は自動的にsnake_caseに変換される（Figma APIの仕様に準拠）
 * undefined値は自動的にスキップされる
 *
 * @param options - URLパラメータとなるオプションオブジェクト（camelCase可）
 * @param requiredParams - 必須パラメータ（キー変換なし、主にIDsなど）
 * @returns URLSearchParamsインスタンス、両引数が未指定の場合はundefined
 *
 * @example
 * buildUrlParams({ nodeId: '1:2', depth: 2 })
 * // URLSearchParams { 'node_id' => '1:2', 'depth' => '2' }
 *
 * buildUrlParams(
 *   { depth: 2 },
 *   { ids: ['1:1', '2:2'] }
 * )
 * // URLSearchParams { 'ids' => '1:1,2:2', 'depth' => '2' }
 */
export function buildUrlParams<T = Record<string, unknown>>(
  options: T | undefined,
  requiredParams?: Record<string, string | string[]>
): URLSearchParams | undefined {
  if (!options && !requiredParams) {
    return undefined;
  }

  const params = new URLSearchParams();

  if (requiredParams) {
    for (const [key, value] of Object.entries(requiredParams)) {
      // valueToString関数を再利用して一貫性を保つ
      params.append(key, valueToString(value));
    }
  }

  if (!options) {
    return params;
  }

  for (const [key, value] of Object.entries(options)) {
    if (value === undefined) continue;

    const paramName = camelToSnakeCase(key);
    params.append(paramName, valueToString(value));
  }

  return params;
}

/**
 * オプショナルなフィールドを含むリクエストボディを構築する
 *
 * undefined値のフィールドは自動的に除外される
 * camelCaseのプロパティ名は自動的にsnake_caseに変換される（Figma APIの仕様に準拠）
 *
 * @param data - リクエストボディのデータ（camelCase可）
 * @returns snake_caseに変換され、undefinedフィールドが除外されたリクエストボディ
 *
 * @example
 * buildRequestBody({
 *   message: 'Hello',
 *   clientMeta: { x: 10, y: 20 },
 *   commentId: undefined
 * })
 * // { message: 'Hello', client_meta: { x: 10, y: 20 } }
 *
 * @example
 * buildRequestBody({
 *   nodeId: '1:2',
 *   formatOptions: { scale: 2 },
 *   optional: undefined
 * })
 * // { node_id: '1:2', format_options: { scale: 2 } }
 */
export function buildRequestBody<T>(data: T): DeepSnakeCase<T> {
  // 型ガードを使用して安全性を確保
  if (data == null || typeof data !== 'object') {
    return data as DeepSnakeCase<T>;
  }

  const result: Record<string, unknown> = {};

  // 型ガードによりdataがオブジェクトであることが保証される
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) {
      continue;
    }

    const snakeKey = camelToSnakeCase(key);

    // 型ガードを使用してオブジェクトかどうかを判定
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // 再帰的にオブジェクトを処理
      result[snakeKey] = buildRequestBody(value);
    } else {
      result[snakeKey] = value;
    }
  }

  return result as DeepSnakeCase<T>;
}

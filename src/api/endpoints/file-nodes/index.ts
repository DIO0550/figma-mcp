// ファイルノード関連のAPI呼び出し関数

import type { HttpClient } from '../../client.js';
import type { GetFileOptions } from '../../../types/index.js';
import type { GetFileNodesApiResponse } from '../../../types/api/responses/node-responses.js';
import { camelToSnakeCase } from '../../../utils/case-converter.js';

/**
 * 値を適切な文字列に変換
 */
function valueToString(value: unknown): string {
  if (Array.isArray(value)) {
    return value.join(',');
  }
  if (typeof value === 'boolean' || typeof value === 'number') {
    return String(value);
  }
  return value as string;
}

/**
 * GetFileNodesAPIのパラメータを構築
 */
function buildFileNodesParams(ids: string[], options?: GetFileOptions): URLSearchParams {
  const params = new URLSearchParams();

  // 必須パラメータ
  params.append('ids', ids.join(','));

  // ガード節: オプションがない場合は早期リターン
  if (!options) return params;

  // Object.entriesでオプションを処理
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined) {
      const paramName = camelToSnakeCase(key);
      params.append(paramName, valueToString(value));
    }
  });

  return params;
}

/**
 * ファイルノード情報を取得
 */
export async function getFileNodesApi(
  client: HttpClient,
  fileKey: string,
  ids: string[],
  options?: GetFileOptions
): Promise<GetFileNodesApiResponse> {
  const params = buildFileNodesParams(ids, options);
  return client.get<GetFileNodesApiResponse>(`/v1/files/${fileKey}/nodes`, params);
}

// ファイル関連のAPI呼び出し関数

import type { HttpClient } from '../../client.js';
import type { GetFileOptions } from '../../../types/index.js';
import type { GetFileApiResponse } from '../../../types/api/responses/file-responses.js';
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
 * GetFileAPIのパラメータを構築
 */
function buildFileParams(options?: GetFileOptions): URLSearchParams | undefined {
  if (!options) return undefined;

  const params = new URLSearchParams();

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
 * ファイル情報を取得
 */
export async function getFileApi(
  client: HttpClient,
  fileKey: string,
  options?: GetFileOptions
): Promise<GetFileApiResponse> {
  const params = buildFileParams(options);
  return client.get<GetFileApiResponse>(`/v1/files/${fileKey}`, params);
}

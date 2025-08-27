// ファイル関連のAPI呼び出し関数

import type { HttpClient } from '../../client.js';
import type { GetFileOptions } from '../../../types/index.js';
import type { GetFileApiResponse } from '../../../types/api/responses/file-responses.js';
import { buildUrlParams } from '../utils/params-builder.js';

/**
 * ファイル情報を取得
 */
export async function getFileApi(
  client: HttpClient,
  fileKey: string,
  options?: GetFileOptions
): Promise<GetFileApiResponse> {
  const params = buildUrlParams(options);
  return client.get<GetFileApiResponse>(`/v1/files/${fileKey}`, params);
}

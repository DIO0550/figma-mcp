// ファイルノード関連のAPI呼び出し関数

import type { HttpClient } from '../../client.js';
import type { GetFileOptions } from '../../../types/index.js';
import type { GetFileNodesApiResponse } from '../../../types/api/responses/node-responses.js';
import { buildUrlParams } from '../utils/params-builder.js';

/**
 * ファイルノード情報を取得
 */
export async function getFileNodesApi(
  client: HttpClient,
  fileKey: string,
  ids: string[],
  options?: GetFileOptions
): Promise<GetFileNodesApiResponse> {
  const params = buildUrlParams(options, { ids });
  return client.get<GetFileNodesApiResponse>(`/v1/files/${fileKey}/nodes`, params);
}

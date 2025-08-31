// バージョン関連のAPI呼び出し関数

import type { HttpClient } from '../../client.js';
import type { GetVersionsResponse } from '../../../types/index.js';

export async function getFileVersionsApi(
  client: HttpClient,
  fileKey: string
): Promise<GetVersionsResponse> {
  return client.get<GetVersionsResponse>(`/v1/files/${fileKey}/versions`);
}

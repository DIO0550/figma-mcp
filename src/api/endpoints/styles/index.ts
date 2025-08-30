// スタイル関連のAPI呼び出し関数

import type { HttpClient } from '../../client.js';
import type { GetStylesApiResponse } from '../../../types/index.js';

export async function getStylesApi(
  client: HttpClient,
  fileKey: string
): Promise<GetStylesApiResponse> {
  return client.get<GetStylesApiResponse>(`/v1/files/${fileKey}/styles`);
}

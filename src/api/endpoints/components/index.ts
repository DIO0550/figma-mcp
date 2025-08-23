// コンポーネント関連のAPI呼び出し関数

import type { HttpClient } from '../../client.js';
import type { GetComponentsResponse, GetComponentSetsResponse } from '../../../types/index.js';

export async function fileComponentsApi(
  client: HttpClient,
  fileKey: string
): Promise<GetComponentsResponse> {
  return client.get<GetComponentsResponse>(`/v1/files/${fileKey}/components`);
}

export async function fileComponentSetsApi(
  client: HttpClient,
  fileKey: string
): Promise<GetComponentSetsResponse> {
  return client.get<GetComponentSetsResponse>(`/v1/files/${fileKey}/component_sets`);
}

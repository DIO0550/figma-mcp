// コンポーネント関連のAPI呼び出し関数

import type { HttpClient } from '../../client.js';
import type { FileComponentsApiResponse, FileComponentSetsApiResponse } from '../../../types/index.js';

export async function fileComponentsApi(
  client: HttpClient,
  fileKey: string
): Promise<FileComponentsApiResponse> {
  return client.get<FileComponentsApiResponse>(`/v1/files/${fileKey}/components`);
}

export async function fileComponentSetsApi(
  client: HttpClient,
  fileKey: string
): Promise<FileComponentSetsApiResponse> {
  return client.get<FileComponentSetsApiResponse>(`/v1/files/${fileKey}/component_sets`);
}

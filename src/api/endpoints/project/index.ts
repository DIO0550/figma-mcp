// プロジェクト関連のAPI呼び出し関数

import type { HttpClient } from '../../client.js';
import type {
  GetProjectFilesApiResponse,
  GetProjectFilesApiOptions,
} from '../../../types/index.js';
import { buildUrlParams } from '../utils/params-builder.js';

export async function getProjectFilesApi(
  client: HttpClient,
  projectId: string,
  options?: GetProjectFilesApiOptions
): Promise<GetProjectFilesApiResponse> {
  const params = buildUrlParams(options);
  return client.get<GetProjectFilesApiResponse>(`/v1/projects/${projectId}/files`, params);
}

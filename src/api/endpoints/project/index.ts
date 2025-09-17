// プロジェクト関連のAPI呼び出し関数

import type { HttpClient } from '../../client/client.js';
import { buildUrlParams } from '../utils/params-builder.js';

// API Options
export interface GetProjectFilesApiOptions {
  branchData?: boolean;
}

// API Response
export interface ProjectApiFile {
  key: string;
  name: string;
  thumbnailUrl: string;
  lastModified: string;
  branches?: Array<{
    key: string;
    name: string;
    thumbnailUrl: string;
    lastModified: string;
  }>;
}

export interface GetProjectFilesApiResponse {
  files: ProjectApiFile[];
}

export async function getProjectFilesApi(
  client: HttpClient,
  projectId: string,
  options?: GetProjectFilesApiOptions
): Promise<GetProjectFilesApiResponse> {
  const params = buildUrlParams(options);
  return await client.get<GetProjectFilesApiResponse>(`/v1/projects/${projectId}/files`, params);
}

// バージョン関連のAPI関数

import type { HttpClient } from '../client.js';
import type { GetVersionsResponse } from '../../types/index.js';

export interface VersionsApi {
  getVersions: (fileKey: string) => Promise<GetVersionsResponse>;
}

export function createVersionsApi(client: HttpClient): VersionsApi {
  return {
    getVersions: async (fileKey: string): Promise<GetVersionsResponse> => {
      return client.get<GetVersionsResponse>(`/v1/files/${fileKey}/versions`);
    },
  };
}

// バージョン関連のAPI呼び出し関数

import type { HttpClient } from '../../client/client.js';
import { ApiPath } from '../../paths.js';
import type { Version, VersionComparison } from '../../../models/version/index.js';

// API Response
export interface GetVersionsApiResponse {
  versions: Version[];
  comparison?: VersionComparison;
}

export async function getFileVersionsApi(
  client: HttpClient,
  fileKey: string
): Promise<GetVersionsApiResponse> {
  return await client.get<GetVersionsApiResponse>(ApiPath.fileVersions(fileKey));
}

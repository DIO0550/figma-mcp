// バージョン関連のAPI呼び出し関数

import type { HttpClient } from '../../client/client.js';
import { ApiPath } from '../../paths.js';
import type { Version, VersionComparison } from '../../../models/version/index.js';
import { convertKeysToCamelCase } from '../../../utils/case-converter/index.js';

// API Response
export interface GetVersionsApiResponse {
  versions: Version[];
  comparison?: VersionComparison;
}

export async function getFileVersionsApi(
  client: HttpClient,
  fileKey: string
): Promise<GetVersionsApiResponse> {
  const raw = await client.get<unknown>(ApiPath.fileVersions(fileKey));
  // APIのsnake_caseをcamelCaseへ正規化
  return convertKeysToCamelCase(raw) as GetVersionsApiResponse;
}

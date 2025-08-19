// バージョン関連のAPIレスポンス型定義

import type { Version, VersionComparison } from '../../../models/version/index.js';

export interface GetVersionsResponse {
  versions: Version[];
  comparison?: VersionComparison;
}

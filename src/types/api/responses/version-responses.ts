// バージョン関連のAPIレスポンス型定義

import type { Version } from '../../figma-types.js';

export interface GetVersionsResponse {
  versions: Version[];
}
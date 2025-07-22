// バージョン関連のAPIレスポンス型定義

import type { Version } from '../../figma-types.js';

export interface VersionComparison {
  from: string;
  to: string;
  changes: {
    pages_added: string[];
    pages_removed: string[];
    pages_modified: string[];
    components_added: number;
    components_removed: number;
    components_modified: number;
    styles_added: number;
    styles_removed: number;
    styles_modified: number;
  };
}

export interface GetVersionsResponse {
  versions: Version[];
  comparison?: VersionComparison;
}
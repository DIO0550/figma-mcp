// バージョン関連のAPIレスポンス型定義

import type { Version } from '../../figma-types.js';

export interface VersionComparison {
  from: string;
  to: string;
  changes: {
    pagesAdded: string[];
    pagesRemoved: string[];
    pagesModified: string[];
    componentsAdded: number;
    componentsRemoved: number;
    componentsModified: number;
    stylesAdded: number;
    stylesRemoved: number;
    stylesModified: number;
  };
}

export interface GetVersionsResponse {
  versions: Version[];
  comparison?: VersionComparison;
}

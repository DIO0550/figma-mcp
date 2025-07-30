// スタイル関連のAPIレスポンス型定義

import type { Style } from '../../figma-types.js';

export interface StyleStatistics {
  total: number;
  byType: Record<string, number>;
  namingConsistency: number;
}

export interface GetStylesResponse {
  error?: boolean;
  status?: number;
  meta: {
    styles: Style[];
  };
  categorized?: Record<string, Record<string, string[]>>;
  statistics?: StyleStatistics;
}

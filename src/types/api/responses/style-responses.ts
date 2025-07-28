// スタイル関連のAPIレスポンス型定義

import type { Style } from '../../figma-types.js';

export interface StyleStatistics {
  total: number;
  by_type: Record<string, number>;
  naming_consistency: number;
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

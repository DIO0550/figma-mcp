// スタイル関連のAPIレスポンス型定義

import type { Style } from '../../figma-types.js';
import type { DeepCamelCase } from '../../../utils/type-transformers.js';

// APIレスポンス用のスネークケース型（内部使用）
export interface StyleStatisticsSnake {
  total: number;
  by_type: Record<string, number>;
  naming_consistency: number;
}

// アプリケーション用のキャメルケース型
export type StyleStatistics = DeepCamelCase<StyleStatisticsSnake>;

export interface GetStylesResponse {
  error?: boolean;
  status?: number;
  meta: {
    styles: Style[];
  };
  categorized?: Record<string, Record<string, string[]>>;
  statistics?: StyleStatistics;
}

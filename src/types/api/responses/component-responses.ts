// コンポーネント関連のAPIレスポンス型定義

import type { Component } from '../../figma-types.js';
import type { DeepCamelCase } from '../../../utils/type-transformers.js';

// APIレスポンス用のスネークケース型（内部使用）
export interface ComponentAnalysisSnake {
  total_components: number;
  categories: Record<string, number>;
  naming_patterns: Record<string, number>;
  pages_distribution: Record<string, number>;
  description_coverage: number;
}

// アプリケーション用のキャメルケース型
export type ComponentAnalysis = DeepCamelCase<ComponentAnalysisSnake>;

export interface VariantSet {
  name: string;
  variants: string[];
  properties: Record<string, string[]>;
}

export interface GetComponentsResponse {
  error?: boolean;
  status?: number;
  meta: {
    components: Component[];
  };
  analysis?: ComponentAnalysis;
  variantSets?: Record<string, VariantSet>;
}

// APIレスポンス用のスネークケース型（内部使用）
export interface GetComponentSetsResponseSnake {
  meta: {
    component_sets: Array<{
      key: string;
      name: string;
      description: string;
    }>;
  };
}

// アプリケーション用のキャメルケース型
export type GetComponentSetsResponse = DeepCamelCase<GetComponentSetsResponseSnake>;

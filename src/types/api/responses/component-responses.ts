// コンポーネント関連のAPIレスポンス型定義

import type { Component } from '../../figma-types.js';

export interface ComponentAnalysis {
  total_components: number;
  categories: Record<string, number>;
  naming_patterns: Record<string, number>;
  pages_distribution: Record<string, number>;
  description_coverage: number;
}

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

export interface GetComponentSetsResponse {
  meta: {
    component_sets: Array<{
      key: string;
      name: string;
      description: string;
    }>;
  };
}
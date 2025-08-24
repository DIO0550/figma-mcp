// コンポーネント関連のAPIレスポンス型定義

import type { Component } from '../../figma-types.js';

export interface ComponentAnalysis {
  totalComponents: number;
  categories: Record<string, number>;
  namingPatterns: Record<string, number>;
  pagesDistribution: Record<string, number>;
  descriptionCoverage: number;
}

export interface VariantSet {
  name: string;
  variants: string[];
  properties: Record<string, string[]>;
}

export interface FileComponentsApiResponse {
  error?: boolean;
  status?: number;
  meta: {
    components: Component[];
  };
  analysis?: ComponentAnalysis;
  variantSets?: Record<string, VariantSet>;
}

export interface FileComponentSetsApiResponse {
  meta: {
    componentSets: Array<{
      key: string;
      name: string;
      description: string;
    }>;
  };
}

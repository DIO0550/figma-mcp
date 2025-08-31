// コンポーネント関連のAPI呼び出し関数

import type { HttpClient } from '../../client.js';
import type { Component } from '../../../types/figma-types.js';

// API Response Types
export interface ComponentApiAnalysis {
  totalComponents: number;
  categories: Record<string, number>;
  namingPatterns: Record<string, number>;
  pagesDistribution: Record<string, number>;
  descriptionCoverage: number;
}

export interface VariantApiSet {
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
  analysis?: ComponentApiAnalysis;
  variantSets?: Record<string, VariantApiSet>;
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

export async function fileComponentsApi(
  client: HttpClient,
  fileKey: string
): Promise<FileComponentsApiResponse> {
  return client.get<FileComponentsApiResponse>(`/v1/files/${fileKey}/components`);
}

export async function fileComponentSetsApi(
  client: HttpClient,
  fileKey: string
): Promise<FileComponentSetsApiResponse> {
  return client.get<FileComponentSetsApiResponse>(`/v1/files/${fileKey}/component_sets`);
}

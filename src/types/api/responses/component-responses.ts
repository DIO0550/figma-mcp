// コンポーネント関連のAPIレスポンス型定義

import type { Component } from '../../figma-types.js';

export interface GetComponentsResponse {
  meta: {
    components: Component[];
  };
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
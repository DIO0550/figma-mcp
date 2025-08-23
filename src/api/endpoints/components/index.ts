// コンポーネント関連のAPI関数

import type { HttpClient } from '../../client.js';
import type { GetComponentsResponse, GetComponentSetsResponse } from '../../../types/index.js';

export interface ComponentsApi {
  getComponents: (fileKey: string) => Promise<GetComponentsResponse>;
  getComponentSets: (fileKey: string) => Promise<GetComponentSetsResponse>;
}

export function createComponentsApi(client: HttpClient): ComponentsApi {
  return {
    getComponents: async (fileKey: string): Promise<GetComponentsResponse> => {
      return client.get<GetComponentsResponse>(`/v1/files/${fileKey}/components`);
    },

    getComponentSets: async (fileKey: string): Promise<GetComponentSetsResponse> => {
      return client.get<GetComponentSetsResponse>(`/v1/files/${fileKey}/component_sets`);
    },
  };
}

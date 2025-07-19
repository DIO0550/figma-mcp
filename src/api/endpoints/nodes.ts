// ノード関連のAPI関数

import type { HttpClient } from '../client.js';
import type { GetNodesOptions, GetNodesResponse } from '../../types/index.js';

export interface NodesApi {
  getNodes: (fileKey: string, options: GetNodesOptions) => Promise<GetNodesResponse>;
}

export function createNodesApi(client: HttpClient): NodesApi {
  return {
    getNodes: async (fileKey: string, options: GetNodesOptions): Promise<GetNodesResponse> => {
      const params = new URLSearchParams();
      
      params.append('ids', options.ids.join(','));
      if (options.version) params.append('version', options.version);
      if (options.depth !== undefined) params.append('depth', options.depth.toString());
      if (options.geometry) params.append('geometry', options.geometry);
      if (options.plugin_data) params.append('plugin_data', options.plugin_data);

      return client.get<GetNodesResponse>(`/v1/files/${fileKey}/nodes`, params);
    },
  };
}
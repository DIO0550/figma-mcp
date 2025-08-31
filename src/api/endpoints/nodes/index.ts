// ノード関連のAPI呼び出し関数

import type { HttpClient } from '../../client.js';
import type { DeepSnakeCase } from '../../../utils/type-transformers.js';
import type { Node, Component } from '../../../types/figma-types.js';
import { buildUrlParams } from '../utils/params-builder.js';

// API Options
export interface GetNodesApiOptions {
  ids: string[];
  version?: string;
  depth?: number;
  geometry?: 'paths' | 'points';
  pluginData?: string;
}

// API Response
export interface GetNodesApiResponse {
  nodes: Record<
    string,
    {
      document: Node;
      components: Record<string, Component>;
      schemaVersion: number;
    }
  >;
}

export async function getNodesApi(
  client: HttpClient,
  fileKey: string,
  options: DeepSnakeCase<GetNodesApiOptions>
): Promise<GetNodesApiResponse> {
  const { ids, ...restOptions } = options;
  const params = buildUrlParams(restOptions, { ids });

  return client.get<GetNodesApiResponse>(`/v1/files/${fileKey}/nodes`, params);
}

// ファイルノード関連のAPI呼び出し関数

import type { HttpClient } from '../../client.js';
import type { GetFileApiOptions } from '../file/index.js';
import type { Node, Component } from '../../../types/figma-types.js';
import type { Style } from '../../../models/style/style.js';
import { buildUrlParams } from '../utils/params-builder.js';

// API Response
export interface GetFileNodesApiResponse {
  name: string;
  lastModified: string;
  thumbnailUrl?: string;
  version: string;
  nodes: Record<
    string,
    {
      document: Node;
      components: Record<string, Component>;
      styles: Record<string, Style>;
    }
  >;
}

/**
 * ファイルノード情報を取得
 */
export async function getFileNodesApi(
  client: HttpClient,
  fileKey: string,
  ids: string[],
  options?: GetFileApiOptions
): Promise<GetFileNodesApiResponse> {
  const params = buildUrlParams(options, { ids });
  return client.get<GetFileNodesApiResponse>(`/v1/files/${fileKey}/nodes`, params);
}

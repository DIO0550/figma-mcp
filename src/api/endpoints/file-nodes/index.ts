// ファイルノード関連のAPI呼び出し関数

import type { HttpClient } from '../../client.js';
import type { GetFileNodesResponse, GetFileOptions } from '../../../types/index.js';

/**
 * ファイルノード情報を取得
 */
export async function getFileNodesApi(
  client: HttpClient,
  fileKey: string,
  ids: string[],
  options?: GetFileOptions
): Promise<GetFileNodesResponse> {
  const params = new URLSearchParams();
  params.append('ids', ids.join(','));

  if (options) {
    if (options.version) params.append('version', options.version);
    if (options.depth !== undefined) params.append('depth', options.depth.toString());
    if (options.geometry) params.append('geometry', options.geometry);
    if (options.pluginData) params.append('plugin_data', options.pluginData);
    if (options.branchData !== undefined)
      params.append('branch_data', options.branchData.toString());
  }

  return client.get<GetFileNodesResponse>(`/v1/files/${fileKey}/nodes`, params);
}

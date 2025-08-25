// ファイル関連のAPI呼び出し関数

import type { HttpClient } from '../../client.js';
import type { FigmaFile, GetFileOptions } from '../../../types/index.js';

/**
 * ファイル情報を取得
 */
export async function getFileApi(
  client: HttpClient,
  fileKey: string,
  options?: GetFileOptions
): Promise<FigmaFile> {
  const params = new URLSearchParams();

  if (options) {
    if (options.version) params.append('version', options.version);
    if (options.ids) params.append('ids', options.ids.join(','));
    if (options.depth !== undefined) params.append('depth', options.depth.toString());
    if (options.geometry) params.append('geometry', options.geometry);
    if (options.pluginData) params.append('plugin_data', options.pluginData);
    if (options.branchData !== undefined)
      params.append('branch_data', options.branchData.toString());
  }

  return client.get<FigmaFile>(`/v1/files/${fileKey}`, params);
}

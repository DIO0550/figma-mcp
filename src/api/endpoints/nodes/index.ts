// ノード関連のAPI呼び出し関数

import type { HttpClient } from '../../client.js';
import type { GetNodesResponse } from '../../../types/index.js';
import type { GetNodesOptions } from '../../../types/api/options/node-options.js';
import type { DeepSnakeCase } from '../../../utils/type-transformers.js';
import { buildUrlParams } from '../utils/params-builder.js';

export async function getNodesApi(
  client: HttpClient,
  fileKey: string,
  options: DeepSnakeCase<GetNodesOptions>
): Promise<GetNodesResponse> {
  const { ids, ...restOptions } = options;
  const params = buildUrlParams(restOptions, { ids });

  return client.get<GetNodesResponse>(`/v1/files/${fileKey}/nodes`, params);
}

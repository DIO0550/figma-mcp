// 画像エクスポート関連のAPI呼び出し関数

import type { HttpClient } from '../../client.js';
import type { ImageApiResponse } from '../../../types/index.js';
import type { ImageApiOptions } from '../../../types/api/options/image-options.js';
import type { DeepSnakeCase } from '../../../utils/type-transformers.js';
import { buildUrlParams } from '../utils/params-builder.js';

export async function imagesApi(
  client: HttpClient,
  fileKey: string,
  options: DeepSnakeCase<ImageApiOptions>
): Promise<ImageApiResponse> {
  const { ids, ...restOptions } = options;
  const params = buildUrlParams(restOptions, { ids });

  return client.get<ImageApiResponse>(`/v1/images/${fileKey}`, params);
}

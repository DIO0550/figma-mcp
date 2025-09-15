// 画像エクスポート関連のAPI呼び出し関数

import type { HttpClient } from '../../client.js';
import type { DeepSnakeCase } from '../../../utils/case-converter/index.js';
import { buildUrlParams } from '../utils/params-builder.js';
import { ApiPath } from '../../paths.js';

// API Options
export interface ImageApiOptions {
  ids: string[];
  scale?: number;
  format?: 'jpg' | 'png' | 'svg' | 'pdf';
  svgIncludeId?: boolean;
  svgSimplifyStroke?: boolean;
  useAbsoluteBounds?: boolean;
  version?: string;
}

// API Response
export interface ImageApiResponse {
  err?: string;
  images: Record<string, string>;
  status?: number;
}

export async function imagesApi(
  client: HttpClient,
  fileKey: string,
  options: DeepSnakeCase<ImageApiOptions>
): Promise<ImageApiResponse> {
  const { ids, ...restOptions } = options;
  const params = buildUrlParams(restOptions, { ids });

  return client.get<ImageApiResponse>(ApiPath.images(fileKey), params);
}

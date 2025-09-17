// スタイル関連のAPI呼び出し関数

import type { HttpClient } from '../../client/client.js';
import { ApiPath } from '../../paths.js';
import type { Style } from '../../../models/style/style.js';

// API Response
export interface StyleApiStatistics {
  total: number;
  byType: Record<string, number>;
  namingConsistency: number;
}

export interface GetStylesApiResponse {
  error?: boolean;
  status?: number;
  meta: {
    styles: Style[];
  };
  categorized?: Record<string, Record<string, string[]>>;
  statistics?: StyleApiStatistics;
}

export async function getStylesApi(
  client: HttpClient,
  fileKey: string
): Promise<GetStylesApiResponse> {
  return client.get<GetStylesApiResponse>(ApiPath.fileStyles(fileKey));
}

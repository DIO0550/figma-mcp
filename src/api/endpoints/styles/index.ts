// スタイル関連のAPI呼び出し関数

import type { HttpClient } from '../../client/client.js';
import { ApiPath } from '../../paths.js';
import type { Style } from '../../../models/style/style.js';
import { convertKeysToCamelCase } from '../../../utils/case-converter/index.js';

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
  const raw = await client.get<unknown>(ApiPath.fileStyles(fileKey));
  // Figma APIはsnake_caseで返すため、実行時にcamelCaseへ変換
  return convertKeysToCamelCase(raw) as GetStylesApiResponse;
}

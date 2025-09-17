// ファイル関連のAPI呼び出し関数

import type { HttpClient } from '../../client/client.js';
import { buildUrlParams } from '../utils/params-builder.js';
import { ApiPath } from '../../paths.js';
import type { Document, Component, ComponentSet } from '../../../types/figma-types.js';
import type { Style } from '../../../models/style/style.js';

// API Options
export interface GetFileApiOptions {
  version?: string;
  ids?: string[];
  depth?: number;
  geometry?: 'paths' | 'points';
  pluginData?: string;
  branchData?: boolean;
}

// API Response
export interface GetFileApiResponse {
  document: Document;
  components: Record<string, Component>;
  componentSets: Record<string, ComponentSet>;
  schemaVersion: number;
  styles: Record<string, Style>;
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
  role: string;
  editorType: string;
  linkAccess: string;
}

/**
 * ファイル情報を取得
 */
export async function getFileApi(
  client: HttpClient,
  fileKey: string,
  options?: GetFileApiOptions
): Promise<GetFileApiResponse> {
  const params = buildUrlParams(options);
  return client.get<GetFileApiResponse>(ApiPath.file(fileKey), params);
}

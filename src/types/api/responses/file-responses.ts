// ファイル関連のAPIレスポンス型定義

import type { Document, Component, ComponentSet } from '../../figma-types.js';
import type { Style } from '../../../models/style/style.js';

// Figma API /v1/files/:key のレスポンス型
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

// 後方互換性のためのエイリアス（廃止予定）
export interface FigmaFile extends GetFileApiResponse {}
export interface GetFileResponse extends GetFileApiResponse {}

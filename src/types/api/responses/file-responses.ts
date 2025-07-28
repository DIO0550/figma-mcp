// ファイル関連のAPIレスポンス型定義

import type { Document, Component, ComponentSet, Style } from '../../figma-types.js';

export interface FigmaFile {
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

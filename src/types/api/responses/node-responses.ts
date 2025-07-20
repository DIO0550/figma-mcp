// ノード関連のAPIレスポンス型定義

import type { Node, Component, Style } from '../../figma-types.js';

export interface GetNodesResponse {
  nodes: Record<string, {
    document: Node;
    components: Record<string, Component>;
    schemaVersion: number;
  }>;
}

export interface GetFileNodesResponse {
  name: string;
  lastModified: string;
  thumbnailUrl?: string;
  version: string;
  nodes: Record<string, {
    document: Node;
    components: Record<string, Component>;
    styles: Record<string, Style>;
  }>;
}
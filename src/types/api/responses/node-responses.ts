// ノード関連のAPIレスポンス型定義

import type { Node, Component } from '../../figma-types.js';
import type { Style } from '../../../models/style/style.js';

export interface GetNodesResponse {
  nodes: Record<
    string,
    {
      document: Node;
      components: Record<string, Component>;
      schemaVersion: number;
    }
  >;
}

export interface GetFileNodesApiResponse {
  name: string;
  lastModified: string;
  thumbnailUrl?: string;
  version: string;
  nodes: Record<
    string,
    {
      document: Node;
      components: Record<string, Component>;
      styles: Record<string, Style>;
    }
  >;
}

// 後方互換性のためのエイリアス（廃止予定）
export interface GetFileNodesResponse extends GetFileNodesApiResponse {}

import type { Node, Component, Style } from '../../types/index.js';

// 内部実装用の型定義（MCPから独立）
export interface FigmaTool<TArgs = unknown, TResult = unknown> {
  name: string;
  description: string;
  execute: (args: TArgs) => Promise<TResult>;
}

// ファイル関連ツールの引数型
export interface GetFileArgs {
  file_key: string;
  branch_data?: boolean;
  version?: string;
  plugin_data?: string;
}

export interface GetFileNodesArgs {
  file_key: string;
  ids: string[];
  depth?: number;
  geometry?: 'paths' | 'points';
  branch_data?: boolean;
  version?: string;
  plugin_data?: string;
}

// 具体的なツール型
export type GetFileTool = FigmaTool<GetFileArgs, FileResponse>;
export type GetFileNodesTool = FigmaTool<GetFileNodesArgs, FileNodesResponse>;

export interface FileTools {
  getFile: GetFileTool;
  getFileNodes: GetFileNodesTool;
}

export type NodeData = {
  document: Node;
  components: Record<string, Component>;
  styles: Record<string, Style>;
};

export type NodeEntry = [string, NodeData];

export interface FileResponse {
  name: string;
  lastModified: string;
  editorType: string;
  thumbnailUrl: string;
  version: string;
  documentName: string;
  pagesCount: number;
  componentsCount: number;
  stylesCount: number;
}

export interface FileNodesResponse {
  name: string;
  lastModified: string;
  version: string;
  nodes: Record<string, unknown>[];
}
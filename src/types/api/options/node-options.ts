// ノード関連のAPIオプション型定義

export interface GetNodesOptions {
  ids: string[];
  version?: string;
  depth?: number;
  geometry?: 'paths' | 'points';
  plugin_data?: string;
}
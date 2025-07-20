// ファイル関連のAPIオプション型定義

export interface GetFileOptions {
  version?: string;
  ids?: string[];
  depth?: number;
  geometry?: 'paths' | 'points';
  plugin_data?: string;
  branch_data?: boolean;
}
// ファイル関連のAPIオプション型定義

export interface GetFileOptions {
  version?: string;
  ids?: string[];
  depth?: number;
  geometry?: 'paths' | 'points';
  pluginData?: string;
  branchData?: boolean;
}

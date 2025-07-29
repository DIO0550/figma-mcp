// ノード関連のAPIオプション型定義

import type { DeepCamelCase } from '../../../utils/type-transformers.js';

// APIリクエスト用のスネークケース型（内部使用）
export interface GetNodesOptionsSnake {
  ids: string[];
  version?: string;
  depth?: number;
  geometry?: 'paths' | 'points';
  plugin_data?: string;
}

// アプリケーション用のキャメルケース型
export type GetNodesOptions = DeepCamelCase<GetNodesOptionsSnake>;

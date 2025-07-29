// 画像エクスポート関連のAPIオプション型定義

import type { DeepCamelCase } from '../../../utils/type-transformers.js';

// APIリクエスト用のスネークケース型（内部使用）
export interface ExportImageOptionsSnake {
  ids: string[];
  scale?: number;
  format?: 'jpg' | 'png' | 'svg' | 'pdf';
  svg_include_id?: boolean;
  svg_simplify_stroke?: boolean;
  use_absolute_bounds?: boolean;
  version?: string;
}

// アプリケーション用のキャメルケース型
export type ExportImageOptions = DeepCamelCase<ExportImageOptionsSnake>;

// 画像エクスポート関連のAPIオプション型定義

export interface ExportImageOptions {
  ids: string[];
  scale?: number;
  format?: 'jpg' | 'png' | 'svg' | 'pdf';
  svg_include_id?: boolean;
  svg_simplify_stroke?: boolean;
  use_absolute_bounds?: boolean;
  version?: string;
}
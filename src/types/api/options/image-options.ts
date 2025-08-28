// 画像エクスポート関連のAPIオプション型定義

export interface ImageApiOptions {
  ids: string[];
  scale?: number;
  format?: 'jpg' | 'png' | 'svg' | 'pdf';
  svgIncludeId?: boolean;
  svgSimplifyStroke?: boolean;
  useAbsoluteBounds?: boolean;
  version?: string;
}

// 画像エクスポート関連のAPIレスポンス型定義

export interface ExportImageResponse {
  err?: string;
  images: Record<string, string>;
  status?: number;
}

// エイリアス（互換性のため）
export type ExportImagesResponse = ExportImageResponse;
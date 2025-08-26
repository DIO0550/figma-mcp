// 画像エクスポート関連のAPIレスポンス型定義

export interface ImageApiResponse {
  err?: string;
  images: Record<string, string>;
  status?: number;
}

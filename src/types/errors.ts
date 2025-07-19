// エラー関連の型定義

export interface FigmaApiError {
  status: number;
  err: string;
}

export interface RateLimitInfo {
  remaining: number;
  reset: Date;
}

export interface FigmaError extends Error {
  status: number;
  rateLimitInfo?: RateLimitInfo;
}
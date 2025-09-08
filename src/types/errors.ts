// エラー関連の型定義

import type { RateLimitInfo } from '../utils/rate-limit/index.js';

export interface FigmaApiError {
  status: number;
  err: string;
}

export interface FigmaError extends Error {
  status: number;
  rateLimitInfo?: RateLimitInfo;
}

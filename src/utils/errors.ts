// エラーハンドリングユーティリティ

import type { FigmaApiError, FigmaError, RateLimitInfo } from '../types/index.js';
import { HttpStatus, ErrorMessages } from '../constants/index.js';

export function createFigmaError(
  message: string,
  status: number,
  rateLimitInfo?: RateLimitInfo
): FigmaError {
  const error = new Error(message) as FigmaError;
  error.name = ErrorMessages.FIGMA_ERROR;
  error.status = status;
  error.rateLimitInfo = rateLimitInfo;
  return error;
}

export async function parseFigmaErrorResponse(response: Response): Promise<string> {
  try {
    const errorData = (await response.json()) as FigmaApiError;
    return errorData.err || `HTTP ${response.status}: ${response.statusText}`;
  } catch {
    return `HTTP ${response.status}: ${response.statusText}`;
  }
}

export function isRateLimitError(error: unknown): boolean {
  return error instanceof Error && 'status' in error && (error as FigmaError).status === HttpStatus.TOO_MANY_REQUESTS;
}

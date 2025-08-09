// レート制限処理ユーティリティ

import type { RateLimitInfo } from '../types/index.js';
import { HttpStatus, Limits, Headers } from '../constants/index.js';

export function parseRateLimitHeaders(headers: Headers): RateLimitInfo | undefined {
  const remaining = headers.get(Headers.RATE_LIMIT_REMAINING);
  const reset = headers.get(Headers.RATE_LIMIT_RESET);

  if (remaining && reset) {
    return {
      remaining: parseInt(remaining, 10),
      reset: new Date(parseInt(reset, 10) * Limits.MS_TO_SECONDS),
    };
  }

  return undefined;
}

export function getRetryAfter(headers: Headers): number | undefined {
  const retryAfter = headers.get(Headers.RETRY_AFTER);
  return retryAfter ? parseInt(retryAfter, 10) : undefined;
}

export function shouldRetry(error: unknown): boolean {
  if (error instanceof Error && 'status' in error) {
    const status = (error as { status: number }).status;
    return status === HttpStatus.TOO_MANY_REQUESTS || 
           (status >= HttpStatus.INTERNAL_SERVER_ERROR && status < 600);
  }
  return false;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = Limits.RATE_LIMIT_RETRY_DELAY
): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (!shouldRetry(error) || i === maxRetries - 1) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }

  throw lastError;
}

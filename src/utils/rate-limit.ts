// レート制限処理ユーティリティ

import type { RateLimitInfo } from '../types/index.js';

export function parseRateLimitHeaders(headers: Headers): RateLimitInfo | undefined {
  const remaining = headers.get('X-RateLimit-Remaining');
  const reset = headers.get('X-RateLimit-Reset');

  if (remaining && reset) {
    return {
      remaining: parseInt(remaining, 10),
      reset: new Date(parseInt(reset, 10) * 1000),
    };
  }

  return undefined;
}

export function getRetryAfter(headers: Headers): number | undefined {
  const retryAfter = headers.get('Retry-After');
  return retryAfter ? parseInt(retryAfter, 10) : undefined;
}

export function shouldRetry(error: unknown): boolean {
  if (error instanceof Error && 'status' in error) {
    const status = (error as { status: number }).status;
    return status === 429 || (status >= 500 && status < 600);
  }
  return false;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
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

      // エクスポネンシャルバックオフ
      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }

  throw lastError;
}

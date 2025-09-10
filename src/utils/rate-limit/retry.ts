// リトライ処理ユーティリティ

import { HttpStatus, Limits, Headers as HeaderConstants } from '../../constants/index.js';

const DECIMAL_RADIX = 10;

export function shouldRetry(error: unknown): boolean {
  if (error instanceof Error && 'status' in error) {
    const status = (error as { status: number }).status;
    return (
      status === HttpStatus.TOO_MANY_REQUESTS ||
      (status >= HttpStatus.INTERNAL_SERVER_ERROR && status < 600)
    );
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

export function getRetryAfter(headers: Headers): number | undefined {
  const retryAfter = headers.get(HeaderConstants.RETRY_AFTER);
  return retryAfter ? parseInt(retryAfter, DECIMAL_RADIX) : undefined;
}

// レート制限情報処理ユーティリティ

import { Limits, Headers as HeaderConstants } from '../../constants/index.js';

const DECIMAL_RADIX = 10;

export interface RateLimitInfo {
  remaining: number;
  reset: Date;
}

function parseHeaders(headers: Headers): RateLimitInfo | undefined {
  const remaining = headers.get(HeaderConstants.RATE_LIMIT_REMAINING);
  const reset = headers.get(HeaderConstants.RATE_LIMIT_RESET);

  if (remaining && reset) {
    return {
      remaining: parseInt(remaining, DECIMAL_RADIX),
      reset: new Date(parseInt(reset, DECIMAL_RADIX) * Limits.MS_TO_SECONDS),
    };
  }

  return undefined;
}

export const RateLimitInfo = {
  parseHeaders,
} as const;

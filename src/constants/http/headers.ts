/**
 * HTTP header names
 */
export const Headers = {
  /** Figma API authentication token header */
  FIGMA_TOKEN: 'X-Figma-Token',

  /** Specifies the media type of the resource */
  CONTENT_TYPE: 'Content-Type',

  /** Indicates how long the client should wait before making a follow-up request (seconds) */
  RETRY_AFTER: 'Retry-After',

  /** Number of requests remaining in the current rate limit window */
  RATE_LIMIT_REMAINING: 'X-RateLimit-Remaining',

  /** Unix timestamp when the rate limit window resets */
  RATE_LIMIT_RESET: 'X-RateLimit-Reset',
} as const;

export type HeaderKey = keyof typeof Headers;
export type Header = (typeof Headers)[HeaderKey];

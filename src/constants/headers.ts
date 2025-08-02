/**
 * HTTP header names used in the application
 */
export const Headers = {
  /** Figma API authentication token header */
  FIGMA_TOKEN: 'X-Figma-Token',
  
  /** Content type header */
  CONTENT_TYPE: 'Content-Type',
  
  /** Retry after header for rate limiting */
  RETRY_AFTER: 'Retry-After',
  
  /** Rate limit remaining header */
  RATE_LIMIT_REMAINING: 'X-RateLimit-Remaining',
  
  /** Rate limit reset timestamp header */
  RATE_LIMIT_RESET: 'X-RateLimit-Reset',
} as const;

/**
 * Content type values
 */
export const ContentType = {
  /** JSON content type */
  JSON: 'application/json',
} as const;
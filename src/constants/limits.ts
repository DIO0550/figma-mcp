/**
 * Various limits and timeouts used in the application
 */
export const Limits = {
  /** Default cache TTL in milliseconds */
  DEFAULT_CACHE_TTL: 1000,
  
  /** Default timeout for commands in milliseconds (2 minutes) */
  DEFAULT_COMMAND_TIMEOUT: 120000,
  
  /** Maximum timeout for commands in milliseconds (10 minutes) */
  MAX_COMMAND_TIMEOUT: 600000,
  
  /** Maximum output characters before truncation */
  MAX_OUTPUT_CHARS: 30000,
  
  /** Maximum lines to read from a file by default */
  DEFAULT_FILE_READ_LINES: 2000,
  
  /** Rate limit retry delay in milliseconds */
  RATE_LIMIT_RETRY_DELAY: 1000,
  
  /** Default retry after seconds for rate limit */
  DEFAULT_RETRY_AFTER_SECONDS: 60,
  
  /** Milliseconds to seconds conversion factor */
  MS_TO_SECONDS: 1000,
  
  /** Default request timeout in milliseconds (5 seconds) */
  DEFAULT_REQUEST_TIMEOUT: 5000,
} as const;
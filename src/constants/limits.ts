/**
 * Various limits and timeouts used in the application
 */
export const Limits = {
  /** Default cache TTL: 1 second */
  DEFAULT_CACHE_TTL_MS: 1_000,

  /** Default timeout for commands: 2 minutes */
  DEFAULT_COMMAND_TIMEOUT_MS: 120_000,

  /** Maximum timeout for commands: 10 minutes */
  MAX_COMMAND_TIMEOUT_MS: 600_000,

  /** Maximum output characters before truncation */
  MAX_OUTPUT_CHARS: 30_000,

  /** Maximum lines to read from a file by default */
  DEFAULT_FILE_READ_LINES: 2_000,

  /** Rate limit retry delay: 1 second */
  RATE_LIMIT_RETRY_DELAY_MS: 1_000,

  /** Default retry after seconds for rate limit */
  DEFAULT_RETRY_AFTER_SECONDS: 60,

  /** Milliseconds to seconds conversion factor */
  MS_TO_SECONDS: 1_000,

  /** Default request timeout: 5 seconds (can be overridden by REQUEST_TIMEOUT_MS env) */
  DEFAULT_REQUEST_TIMEOUT_MS: parseInt(process.env.REQUEST_TIMEOUT_MS || '5000', 10),

  /** @deprecated Use DEFAULT_CACHE_TTL_MS */
  DEFAULT_CACHE_TTL: 1_000,
  /** @deprecated Use DEFAULT_COMMAND_TIMEOUT_MS */
  DEFAULT_COMMAND_TIMEOUT: 120_000,
  /** @deprecated Use MAX_COMMAND_TIMEOUT_MS */
  MAX_COMMAND_TIMEOUT: 600_000,
  /** @deprecated Use RATE_LIMIT_RETRY_DELAY_MS */
  RATE_LIMIT_RETRY_DELAY: 1_000,
  /** @deprecated Use DEFAULT_REQUEST_TIMEOUT_MS */
  DEFAULT_REQUEST_TIMEOUT: 5_000,
} as const;

export type LimitKey = keyof typeof Limits;
export type Limit = (typeof Limits)[LimitKey];

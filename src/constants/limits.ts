/**
 * Various limits and timeouts used in the application
 */

/** Default cache TTL: 1 second */
export const DEFAULT_CACHE_TTL_MS = 1_000;

/** Default timeout for commands: 2 minutes */
export const DEFAULT_COMMAND_TIMEOUT_MS = 120_000;

/** Maximum timeout for commands: 10 minutes */
export const MAX_COMMAND_TIMEOUT_MS = 600_000;

/** Maximum output characters before truncation */
export const MAX_OUTPUT_CHARS = 30_000;

/** Maximum lines to read from a file by default */
export const DEFAULT_FILE_READ_LINES = 2_000;

/** Rate limit retry delay: 1 second */
export const RATE_LIMIT_RETRY_DELAY_MS = 1_000;

/** Default retry after seconds for rate limit */
export const DEFAULT_RETRY_AFTER_SECONDS = 60;

/** Milliseconds to seconds conversion factor */
export const MS_TO_SECONDS = 1_000;

// Define the base limits first
const BASE_LIMITS = {
  DEFAULT_CACHE_TTL_MS,
  DEFAULT_COMMAND_TIMEOUT_MS,
  MAX_COMMAND_TIMEOUT_MS,
  MAX_OUTPUT_CHARS,
  DEFAULT_FILE_READ_LINES,
  RATE_LIMIT_RETRY_DELAY_MS,
  DEFAULT_RETRY_AFTER_SECONDS,
  MS_TO_SECONDS,
} as const;

export const Limits = {
  ...BASE_LIMITS,

  /**
   * Default request timeout: 5 seconds
   * Can be overridden by REQUEST_TIMEOUT_MS environment variable
   * Evaluated dynamically at runtime
   */
  get DEFAULT_REQUEST_TIMEOUT_MS(): number {
    return parseInt(process.env.REQUEST_TIMEOUT_MS || '5000', 10);
  },

  /** @deprecated Use DEFAULT_CACHE_TTL_MS */
  get DEFAULT_CACHE_TTL(): number {
    return BASE_LIMITS.DEFAULT_CACHE_TTL_MS;
  },
  /** @deprecated Use DEFAULT_COMMAND_TIMEOUT_MS */
  get DEFAULT_COMMAND_TIMEOUT(): number {
    return BASE_LIMITS.DEFAULT_COMMAND_TIMEOUT_MS;
  },
  /** @deprecated Use MAX_COMMAND_TIMEOUT_MS */
  get MAX_COMMAND_TIMEOUT(): number {
    return BASE_LIMITS.MAX_COMMAND_TIMEOUT_MS;
  },
  /** @deprecated Use RATE_LIMIT_RETRY_DELAY_MS */
  get RATE_LIMIT_RETRY_DELAY(): number {
    return BASE_LIMITS.RATE_LIMIT_RETRY_DELAY_MS;
  },
  /** @deprecated Use DEFAULT_REQUEST_TIMEOUT_MS */
  get DEFAULT_REQUEST_TIMEOUT(): number {
    return this.DEFAULT_REQUEST_TIMEOUT_MS;
  },
} as const;

export type LimitKey = keyof typeof Limits;
export type Limit = (typeof Limits)[LimitKey];

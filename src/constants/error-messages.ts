/**
 * Common error messages and names
 */
export const ErrorMessages = {
  /** Error messages */
  NOT_FOUND: 'Not Found',
  UNAUTHORIZED: 'Unauthorized',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
  INVALID_TOKEN: 'Invalid authentication token',
  MISSING_TOKEN: 'Missing authentication token',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  BAD_GATEWAY: 'Bad Gateway',
  SERVICE_UNAVAILABLE: 'Service Unavailable',
  INVALID_URL: 'Invalid URL',
  REQUEST_TIMEOUT: 'Request timeout',
  INVALID_JSON: 'Invalid JSON',

  /** Figma URL parser errors */
  NOT_FIGMA_URL: 'Not a Figma URL',
  UNSUPPORTED_FIGMA_URL_PATTERN: 'Unsupported Figma URL pattern',
  INVALID_FIGMA_FILE_ID: 'Invalid file ID',

  /** Error names */
  FIGMA_ERROR: 'FigmaError',
} as const;

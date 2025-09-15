/**
 * Common error messages
 */
export const ErrorMessages = {
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
} as const;

export type ErrorMessageKey = keyof typeof ErrorMessages;
export type ErrorMessage = (typeof ErrorMessages)[ErrorMessageKey];

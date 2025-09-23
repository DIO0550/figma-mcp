import type { ApiConfig } from '../config/index.js';
import { RateLimitInfo, getRetryAfter } from '../../utils/rate-limit/index.js';
import { createHeaders } from '../config/index.js';
import { createFigmaError, parseFigmaErrorResponse } from '../../utils/errors.js';
import { Logger } from '../../utils/logger/index.js';
import { HttpStatus, Limits } from '../../constants/index.js';

export interface HttpClient {
  get: <T>(endpoint: string, params?: URLSearchParams) => Promise<T>;
  post: <T>(endpoint: string, body?: unknown) => Promise<T>;
}

export interface RequestContext {
  rateLimitInfo?: RateLimitInfo;
}

export interface HttpClientOptions {
  cache?: {
    get: (key: string) => unknown;
    set: (key: string, value: unknown, ttl?: number) => void;
    has: (key: string) => boolean;
  };
  cacheKeyPrefix?: string;
  cacheTtl?: number;
}

async function handleResponse<T>(response: Response, context: RequestContext): Promise<T> {
  context.rateLimitInfo = RateLimitInfo.parseHeaders(response.headers);

  if (response.ok) {
    return response.json() as Promise<T>;
  }

  const errorMessage = await parseFigmaErrorResponse(response);

  if (response.status === HttpStatus.TOO_MANY_REQUESTS) {
    const retryAfter = getRetryAfter(response.headers);
    const message = retryAfter
      ? `${errorMessage} (Retry after ${retryAfter} seconds)`
      : errorMessage;

    Logger.warn('Rate limit exceeded', {
      status: response.status,
      retryAfter,
      rateLimitInfo: context.rateLimitInfo,
    });

    throw createFigmaError(message, response.status, context.rateLimitInfo);
  }

  Logger.error('HTTP Error', {
    status: response.status,
    message: errorMessage,
  });

  throw createFigmaError(errorMessage, response.status, context.rateLimitInfo);
}

export function createHttpClient(
  config: ApiConfig,
  options: HttpClientOptions = {}
): HttpClient & { getContext: () => RequestContext } {
  const context: RequestContext = {};
  const { cache, cacheKeyPrefix = '', cacheTtl = 5 * 60 * Limits.MS_TO_SECONDS } = options;

  const getCacheKey = (method: string, endpoint: string): string => {
    return `${cacheKeyPrefix}${method}:${endpoint}`;
  };

  const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const url = `${config.baseUrl}${endpoint}`;
    const method = options.method || 'GET';

    Logger.debug('HTTP Request', { method, url });

    const startTime = Date.now();
    const response = await fetch(url, {
      ...options,
      headers: {
        ...createHeaders(config),
        ...options.headers,
      },
    });

    const duration = Date.now() - startTime;
    Logger.info('HTTP Response', {
      method,
      url,
      status: response.status,
      duration,
    });

    return handleResponse<T>(response, context);
  };

  return {
    get: async <T>(endpoint: string, params?: URLSearchParams): Promise<T> => {
      const queryString = params?.toString();
      const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;

      if (cache) {
        const cacheKey = getCacheKey('GET', fullEndpoint);

        const cachedValue = cache.get(cacheKey);
        if (cachedValue !== undefined) {
          Logger.debug('Cache hit', { endpoint: fullEndpoint, cacheKey });
          return cachedValue as T;
        }

        Logger.debug('Cache miss', { endpoint: fullEndpoint, cacheKey });

        const result = await request<T>(fullEndpoint);

        cache.set(cacheKey, result, cacheTtl);
        Logger.debug('Cached response', { endpoint: fullEndpoint, cacheKey, ttl: cacheTtl });

        return result;
      }

      return request<T>(fullEndpoint);
    },

    post: async <T>(endpoint: string, body?: unknown): Promise<T> => {
      const requestInit: RequestInit = {
        method: 'POST',
      };

      if (body !== undefined) {
        requestInit.body = JSON.stringify(body);
      }

      return request<T>(endpoint, requestInit);
    },

    getContext: () => context,
  };
}

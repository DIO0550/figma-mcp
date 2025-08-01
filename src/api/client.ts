// HTTP通信の基本関数

import type { ApiConfig } from './config.js';
import type { RateLimitInfo } from '../types/index.js';
import { createHeaders } from './config.js';
import { parseRateLimitHeaders, getRetryAfter } from '../utils/rate-limit.js';
import { createFigmaError, parseFigmaErrorResponse } from '../utils/errors.js';
import { Logger } from '../utils/logger/index.js';
import { HttpStatus, Limits } from '../constants/index.js';

export interface HttpClient {
  get: <T>(endpoint: string, params?: URLSearchParams) => Promise<T>;
  post: <T>(endpoint: string, body: unknown) => Promise<T>;
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
  // レート制限情報を更新
  context.rateLimitInfo = parseRateLimitHeaders(response.headers);

  if (!response.ok) {
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

  return response.json() as Promise<T>;
}

export function createHttpClient(
  config: ApiConfig,
  options: HttpClientOptions = {}
): HttpClient & { getContext: () => RequestContext } {
  const context: RequestContext = {};
  const { cache, cacheKeyPrefix = '', cacheTtl = 5 * 60 * Limits.MS_TO_SECONDS } = options; // デフォルト5分

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

      // キャッシュが有効な場合
      if (cache) {
        const cacheKey = getCacheKey('GET', fullEndpoint);

        // キャッシュから取得を試みる
        const cachedValue = cache.get(cacheKey);
        if (cachedValue !== undefined) {
          Logger.debug('Cache hit', { endpoint: fullEndpoint, cacheKey });
          return cachedValue as T;
        }

        Logger.debug('Cache miss', { endpoint: fullEndpoint, cacheKey });

        // キャッシュになければリクエスト
        const result = await request<T>(fullEndpoint);

        // 成功した結果のみキャッシュ
        cache.set(cacheKey, result, cacheTtl);
        Logger.debug('Cached response', { endpoint: fullEndpoint, cacheKey, ttl: cacheTtl });

        return result;
      }

      // キャッシュなしの場合は通常のリクエスト
      return request<T>(fullEndpoint);
    },

    post: async <T>(endpoint: string, body: unknown): Promise<T> => {
      // POSTリクエストはキャッシュしない
      return request<T>(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },

    getContext: () => context,
  };
}

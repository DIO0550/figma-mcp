// HTTP通信の基本関数

import type { ApiConfig } from './config.js';
import type { RateLimitInfo } from '../types/index.js';
import { createHeaders } from './config.js';
import { parseRateLimitHeaders, getRetryAfter } from '../utils/rate-limit.js';
import { createFigmaError, parseFigmaErrorResponse } from '../utils/errors.js';

export interface HttpClient {
  get: <T>(endpoint: string, params?: URLSearchParams) => Promise<T>;
  post: <T>(endpoint: string, body: unknown) => Promise<T>;
}

export interface RequestContext {
  rateLimitInfo?: RateLimitInfo;
}

async function handleResponse<T>(
  response: Response,
  context: RequestContext
): Promise<T> {
  // レート制限情報を更新
  context.rateLimitInfo = parseRateLimitHeaders(response.headers);

  if (!response.ok) {
    const errorMessage = await parseFigmaErrorResponse(response);
    
    if (response.status === 429) {
      const retryAfter = getRetryAfter(response.headers);
      const message = retryAfter 
        ? `${errorMessage} (Retry after ${retryAfter} seconds)`
        : errorMessage;
      throw createFigmaError(message, response.status, context.rateLimitInfo);
    }
    
    throw createFigmaError(errorMessage, response.status, context.rateLimitInfo);
  }

  return response.json() as Promise<T>;
}

export function createHttpClient(config: ApiConfig): HttpClient & { getContext: () => RequestContext } {
  const context: RequestContext = {};

  const request = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    const url = `${config.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...createHeaders(config),
        ...options.headers,
      },
    });

    return handleResponse<T>(response, context);
  };

  return {
    get: async <T>(endpoint: string, params?: URLSearchParams): Promise<T> => {
      const queryString = params?.toString();
      const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
      return request<T>(fullEndpoint);
    },

    post: async <T>(endpoint: string, body: unknown): Promise<T> => {
      return request<T>(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },

    getContext: () => context,
  };
}
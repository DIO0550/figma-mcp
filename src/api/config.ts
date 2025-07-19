// API設定

export interface ApiConfig {
  accessToken: string;
  baseUrl?: string;
}

export const DEFAULT_BASE_URL = 'https://api.figma.com';

export function createApiConfig(accessToken: string, baseUrl?: string): ApiConfig {
  if (!accessToken) {
    throw new Error('Figma access token is required');
  }

  return {
    accessToken,
    baseUrl: baseUrl || DEFAULT_BASE_URL,
  };
}

export function createHeaders(config: ApiConfig): Record<string, string> {
  return {
    'X-Figma-Token': config.accessToken,
    'Content-Type': 'application/json',
  };
}
import type { FigmaApiClient } from '../../api/figma-api-client.js';
import { createGetStylesTool } from './list.js';
import type { StyleTool } from './types.js';

interface StyleTools {
  getStyles: StyleTool;
}

// StyleTools作成に必要な最小限のインターフェース
export interface StyleApiClient {
  getStyles: FigmaApiClient['getStyles'];
}

export const createStyleTools = (apiClient: StyleApiClient): StyleTools => {
  return {
    getStyles: createGetStylesTool(apiClient),
  };
};

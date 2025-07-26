import type { FigmaApiClient } from '../../api/figma-api-client.js';
import { createGetStylesTool } from './list.js';
import type { StyleTool } from './types.js';

interface StyleTools {
  getStyles: StyleTool;
}

export const createStyleTools = (apiClient: FigmaApiClient): StyleTools => {
  return {
    getStyles: createGetStylesTool(apiClient),
  };
};
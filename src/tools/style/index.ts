import type { FigmaApiClient } from '../../api/figma-api-client.js';
import { createGetStylesTool } from './get-styles.js';
import type { StyleTool } from './get-styles.js';

interface StyleTools {
  getStyles: StyleTool;
}

export const createStyleTools = (apiClient: FigmaApiClient): StyleTools => {
  return {
    getStyles: createGetStylesTool(apiClient),
  };
};
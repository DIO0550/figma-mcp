import type { FigmaApiClient } from '../../api/figma-api-client.js';
import { createGetComponentsTool } from './list.js';
import type { ComponentTool } from './list.js';

interface ComponentTools {
  getComponents: ComponentTool;
}

export const createComponentTools = (apiClient: FigmaApiClient): ComponentTools => {
  return {
    getComponents: createGetComponentsTool(apiClient),
  };
};
import type { FigmaApiClient } from '../../api/figma-api-client.js';
import { createGetComponentsTool } from './get-components.js';
import type { ComponentTool } from './get-components.js';

interface ComponentTools {
  getComponents: ComponentTool;
}

export const createComponentTools = (apiClient: FigmaApiClient): ComponentTools => {
  return {
    getComponents: createGetComponentsTool(apiClient),
  };
};
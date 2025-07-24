import type { FigmaApiClient } from '../../api/figma-api-client.js';
import { createGetVersionsTool } from './list.js';
import type { VersionTool } from './list.js';

interface VersionTools {
  getVersions: VersionTool;
}

export const createVersionTools = (apiClient: FigmaApiClient): VersionTools => {
  return {
    getVersions: createGetVersionsTool(apiClient),
  };
};
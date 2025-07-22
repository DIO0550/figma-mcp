import type { FigmaApiClient } from '../../api/figma-api-client.js';
import { createGetVersionsTool } from './get-versions.js';
import type { VersionTool } from './get-versions.js';

interface VersionTools {
  getVersions: VersionTool;
}

export const createVersionTools = (apiClient: FigmaApiClient): VersionTools => {
  return {
    getVersions: createGetVersionsTool(apiClient),
  };
};
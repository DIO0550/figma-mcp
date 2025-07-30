import type { FigmaApiClient } from '../../api/figma-api-client.js';
import { createGetVersionsTool } from './list.js';
import type { VersionTool } from './types.js';

interface VersionTools {
  getVersions: VersionTool;
}

// VersionTools作成に必要な最小限のインターフェース
export interface VersionApiClient {
  getVersions: FigmaApiClient['getVersions'];
}

export const createVersionTools = (apiClient: VersionApiClient): VersionTools => {
  return {
    getVersions: createGetVersionsTool(apiClient),
  };
};

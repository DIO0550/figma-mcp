import type { FigmaApiClient } from '../../api/figma-api-client.js';
import { GetVersionsTool, GetVersionsToolDefinition } from './list.js';
import type { GetVersionsArgs } from './get-versions-args.js';
import type { GetVersionsResponse } from '../../types/api/responses/version-responses.js';

interface VersionTools {
  getVersions: {
    name: typeof GetVersionsToolDefinition.name;
    description: typeof GetVersionsToolDefinition.description;
    inputSchema: typeof GetVersionsToolDefinition.inputSchema;
    execute: (args: GetVersionsArgs) => Promise<GetVersionsResponse>;
  };
}

export const createVersionTools = (apiClient: FigmaApiClient): VersionTools => {
  const tool = GetVersionsTool.from(apiClient);
  return {
    getVersions: {
      ...GetVersionsToolDefinition,
      execute: (args: GetVersionsArgs) => GetVersionsTool.execute(tool, args),
    },
  };
};

// 再エクスポート
export {
  GetVersionsToolDefinition,
  GetVersionsTool,
} from './list.js';
export * from './types.js';
export * from './get-versions-args.js';
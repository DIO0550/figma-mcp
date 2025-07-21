import type { FigmaApiClient } from '../../api/figma-api-client.js';
import type { GetVersionsArgs } from './types.js';
import type { GetVersionsResponse } from '../../types/api/responses/version-responses.js';

export interface VersionTool {
  name: string;
  description: string;
  execute: (args: GetVersionsArgs) => Promise<GetVersionsResponse>;
}

export const createGetVersionsTool = (apiClient: FigmaApiClient): VersionTool => {
  return {
    name: 'get_versions',
    description: 'Get version history of a Figma file',
    execute: async (args: GetVersionsArgs): Promise<GetVersionsResponse> => {
      return apiClient.getVersions(args.fileKey);
    },
  };
};
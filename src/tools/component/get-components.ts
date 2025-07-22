import type { FigmaApiClient } from '../../api/figma-api-client.js';
import type { GetComponentsArgs } from './types.js';
import type { GetComponentsResponse } from '../../types/api/responses/component-responses.js';

export interface ComponentTool {
  name: string;
  description: string;
  execute: (args: GetComponentsArgs) => Promise<GetComponentsResponse>;
}

export const createGetComponentsTool = (apiClient: FigmaApiClient): ComponentTool => {
  return {
    name: 'get_components',
    description: 'Get components from a Figma file',
    execute: async (args: GetComponentsArgs): Promise<GetComponentsResponse> => {
      return apiClient.getComponents(args.fileKey);
    },
  };
};
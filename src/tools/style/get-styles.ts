import type { FigmaApiClient } from '../../api/figma-api-client.js';
import type { GetStylesArgs } from './types.js';
import type { GetStylesResponse } from '../../types/api/responses/style-responses.js';

export interface StyleTool {
  name: string;
  description: string;
  execute: (args: GetStylesArgs) => Promise<GetStylesResponse>;
}

export const createGetStylesTool = (apiClient: FigmaApiClient): StyleTool => {
  return {
    name: 'get_styles',
    description: 'Get styles from a Figma file',
    execute: async (args: GetStylesArgs): Promise<GetStylesResponse> => {
      return apiClient.getStyles(args.fileKey);
    },
  };
};
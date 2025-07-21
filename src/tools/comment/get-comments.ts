import type { FigmaApiClient } from '../../api/figma-api-client.js';
import type { GetCommentsArgs } from './types.js';
import type { GetCommentsResponse } from '../../types/api/responses/comment-responses.js';

export interface CommentTool {
  name: string;
  description: string;
  execute: (args: GetCommentsArgs) => Promise<GetCommentsResponse>;
}

export const createGetCommentsTool = (apiClient: FigmaApiClient): CommentTool => {
  return {
    name: 'get_comments',
    description: 'Get comments from a Figma file',
    execute: async (args: GetCommentsArgs): Promise<GetCommentsResponse> => {
      return apiClient.getComments(args.fileKey);
    },
  };
};
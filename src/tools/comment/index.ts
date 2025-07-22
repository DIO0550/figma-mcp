import type { FigmaApiClient } from '../../api/figma-api-client.js';
import { createGetCommentsTool } from './get-comments.js';
import type { CommentTool } from './get-comments.js';

interface CommentTools {
  getComments: CommentTool;
}

export const createCommentTools = (apiClient: FigmaApiClient): CommentTools => {
  return {
    getComments: createGetCommentsTool(apiClient),
  };
};
import type { FigmaApiClient } from '../../api/figma-api-client.js';
import { createGetCommentsTool } from './list.js';
import type { CommentTool } from './list.js';

interface CommentTools {
  getComments: CommentTool;
}

export const createCommentTools = (apiClient: FigmaApiClient): CommentTools => {
  return {
    getComments: createGetCommentsTool(apiClient),
  };
};
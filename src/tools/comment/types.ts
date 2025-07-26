import type { Comment } from '../../types/figma-types.js';
import type { ToolDefinition } from '../types.js';
import type { GetCommentsResponse } from '../../types/api/responses/comment-responses.js';
import type { GetCommentsArgs } from './get-comments-args.js';

export interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies[];
}

export type CommentTool = ToolDefinition<GetCommentsArgs, GetCommentsResponse>;
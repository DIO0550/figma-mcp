import type { CommentWithReplies } from '../../models/comment/index.js';
import type { ToolDefinition } from '../types.js';
import type { GetFileCommentsApiResponse } from '../../api/endpoints/comments/index.js';
import type { GetCommentsArgs } from './get-comments-args.js';

export { CommentWithReplies };

export type CommentTool = ToolDefinition<GetCommentsArgs, GetFileCommentsApiResponse>;

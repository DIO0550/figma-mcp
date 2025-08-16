import type { CommentWithReplies } from '../../models/comment/index.js';
import type { ToolDefinition } from '../types.js';
import type { GetCommentsResponse } from '../../types/api/responses/comment-responses.js';
import type { GetCommentsArgs } from './get-comments-args.js';

export { CommentWithReplies };

export type CommentTool = ToolDefinition<GetCommentsArgs, GetCommentsResponse>;

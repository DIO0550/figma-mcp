import type { Comment } from '../../types/figma-types.js';

export interface GetCommentsArgs {
  fileKey: string;
  showResolved?: boolean;
  userId?: string;
  nodeId?: string;
  organizeThreads?: boolean;
}

export interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies[];
}
import type { FigmaApiClient } from '../../api/figma-api-client.js';
import type { CommentWithReplies, CommentTool } from './types.js';
import type { GetCommentsResponse } from '../../types/api/responses/comment-responses.js';
import type { Comment } from '../../types/figma-types.js';
import { GetCommentsArgsSchema, type GetCommentsArgs } from './get-comments-args.js';
import { JsonSchema } from '../types.js';

export const createGetCommentsTool = (apiClient: FigmaApiClient): CommentTool => {
  return {
    name: 'get_comments',
    description: 'Get comments from a Figma file with optional filtering',
    inputSchema: JsonSchema.from(GetCommentsArgsSchema),
    execute: async (args: GetCommentsArgs): Promise<GetCommentsResponse> => {
      const response = await apiClient.getComments(args.fileKey);

      // showResolvedがfalseの場合、未解決のコメントのみを返す
      // デフォルト（undefinedまたはtrue）では全てのコメントを返す
      let filteredComments =
        args.showResolved === false
          ? response.comments.filter(
              (comment) => comment.resolved_at === null || comment.resolved_at === undefined
            )
          : response.comments;

      // userIdが指定されている場合、そのユーザーのコメントのみを返す
      if (args.userId) {
        filteredComments = filteredComments.filter((comment) => comment.user.id === args.userId);
      }

      // nodeIdが指定されている場合、そのノードに関連するコメントのみを返す
      if (args.nodeId) {
        const nodeId = args.nodeId;
        filteredComments = filteredComments.filter(
          (comment) => comment.client_meta?.node_id?.includes(nodeId) ?? false
        );
      }

      // organizeThreadsが有効な場合、返信をスレッド構造に整理
      if (args.organizeThreads) {
        const organizedComments = organizeCommentsIntoThreads(filteredComments);
        return {
          ...response,
          comments: organizedComments,
        };
      }

      return {
        ...response,
        comments: filteredComments,
      };
    },
  };
};

// コメントをスレッド構造に整理する関数
function organizeCommentsIntoThreads(comments: Comment[]): CommentWithReplies[] {
  const commentMap = new Map<string, CommentWithReplies>();
  const rootComments: CommentWithReplies[] = [];

  // まず全てのコメントをMapに格納
  comments.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // parent_idに基づいてスレッド構造を構築
  comments.forEach((comment) => {
    const commentWithReplies = commentMap.get(comment.id)!;

    if (!comment.parent_id || comment.parent_id === '') {
      // ルートコメント
      rootComments.push(commentWithReplies);
    } else {
      // 返信コメント
      const parent = commentMap.get(comment.parent_id);
      if (parent) {
        parent.replies = parent.replies || [];
        parent.replies.push(commentWithReplies);
      } else {
        // 親が見つからない場合はルートとして扱う
        rootComments.push(commentWithReplies);
      }
    }
  });

  // 返信を作成日時でソート
  function sortReplies(comment: CommentWithReplies): void {
    if (comment.replies && comment.replies.length > 0) {
      comment.replies.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      comment.replies.forEach(sortReplies);
    }
  }

  rootComments.forEach(sortReplies);

  return rootComments;
}

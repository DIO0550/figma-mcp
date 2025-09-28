import { getComments } from '../../api/figma-api-client/index.js';
import type { FigmaApiClientInterface } from '../../api/figma-api-client/index.js';
import type { GetFileCommentsApiResponse } from '../../api/endpoints/comments/index.js';
import { Comment } from '../../models/comment/index.js';
import { GetCommentsArgsSchema, type GetCommentsArgs } from './get-comments-args.js';
import { JsonSchema, type McpToolDefinition } from '../types.js';

/**
 * コメントツールの定義（定数オブジェクト）
 */
export const GetCommentsToolDefinition = {
  name: 'get_comments' as const,
  description: 'Get comments from a Figma file with optional filtering',
  inputSchema: JsonSchema.from(GetCommentsArgsSchema),
} as const satisfies McpToolDefinition;

/**
 * コメントにフィルターを適用する
 */
function applyFilters(comments: Comment[], args: GetCommentsArgs): Comment[] {
  const filters: Array<(comments: Comment[]) => Comment[]> = [];

  // showResolvedがfalseの場合、未解決のコメントのみを返す
  if (args.showResolved === false) {
    filters.push((comments) => comments.filter((comment) => comment.resolvedAt == null));
  }

  // userIdが指定されている場合、そのユーザーのコメントのみを返す
  if (args.userId) {
    const userId = args.userId;
    filters.push((comments) => comments.filter((comment) => comment.user.id === userId));
  }

  // nodeIdが指定されている場合、そのノードに関連するコメントのみを返す
  if (args.nodeId) {
    const nodeId = args.nodeId;
    filters.push((comments) =>
      comments.filter((comment) => comment.clientMeta?.nodeId?.includes(nodeId) ?? false)
    );
  }

  // すべてのフィルターを順番に適用
  return filters.reduce((acc, filter) => filter(acc), comments);
}

/**
 * ツールインスタンス（apiClientを保持）
 */
export interface GetCommentsTool {
  readonly apiClient: FigmaApiClientInterface;
}

/**
 * コメントツールのコンパニオンオブジェクト（関数群）
 */
export const GetCommentsTool = {
  /**
   * apiClientからツールインスタンスを作成
   */
  from(apiClient: FigmaApiClientInterface): GetCommentsTool {
    return { apiClient };
  },

  /**
   * コメント取得を実行
   */
  async execute(tool: GetCommentsTool, args: GetCommentsArgs): Promise<GetFileCommentsApiResponse> {
    const response = await getComments(tool.apiClient, args.fileKey);

    // フィルターを順番に適用
    const filteredComments = applyFilters(response.comments, args);

    // organizeThreadsが有効な場合、返信をスレッド構造に整理
    const finalComments = args.organizeThreads
      ? Comment.organizeIntoThreads(filteredComments)
      : filteredComments;

    return {
      ...response,
      comments: finalComments,
    };
  },
} as const;

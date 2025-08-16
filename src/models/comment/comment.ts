import type { FigmaUser, Vector } from '../../types/figma-types.js';

export interface Comment {
  readonly id: string;
  readonly fileKey: string;
  readonly parentId?: string;
  readonly user: FigmaUser;
  readonly createdAt: string;
  readonly resolvedAt?: string;
  readonly message: string;
  readonly clientMeta: {
    readonly nodeId?: string[];
    readonly nodeOffset?: Vector;
    readonly [key: string]: unknown;
  };
  readonly orderId: string;
  readonly reactions?: Reaction[];
}

export interface Reaction {
  readonly user: FigmaUser;
  readonly createdAt: string;
  readonly emoji: string;
}

export interface CommentWithReplies extends Comment {
  readonly replies?: CommentWithReplies[];
}

/**
 * Commentのコンパニオンオブジェクト
 */
export const Comment = {
  /**
   * コメントをスレッド構造に整理する
   */
  organizeIntoThreads(comments: Comment[]): CommentWithReplies[] {
    const commentMap = new Map<string, { comment: CommentWithReplies; replies: CommentWithReplies[] }>();
    const rootComments: CommentWithReplies[] = [];

    // まず全てのコメントをMapに格納（repliesは可変配列として別管理）
    comments.forEach((comment) => {
      const commentWithReplies: CommentWithReplies = { ...comment, replies: [] };
      commentMap.set(comment.id, { comment: commentWithReplies, replies: [] });
    });

    // parent_idに基づいてスレッド構造を構築
    comments.forEach((comment) => {
      const entry = commentMap.get(comment.id)!;

      // ルートコメントの場合
      if (!comment.parentId || comment.parentId === '') {
        rootComments.push(entry.comment);
        return;
      }

      // 返信コメントの場合
      const parentEntry = commentMap.get(comment.parentId);
      if (!parentEntry) {
        // 親が見つからない場合はルートとして扱う
        rootComments.push(entry.comment);
        return;
      }

      // 親コメントに返信を追加
      parentEntry.replies.push(entry.comment);
    });

    // repliesを各コメントに設定し、作成日時でソート
    function buildSortedThread(commentId: string): CommentWithReplies {
      const entry = commentMap.get(commentId);
      if (!entry) {
        throw new Error(`Comment ${commentId} not found`);
      }

      const sortedReplies = entry.replies
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .map(reply => buildSortedThread(reply.id));

      return Object.freeze({
        ...entry.comment,
        replies: sortedReplies.length > 0 ? sortedReplies : undefined
      });
    }

    // ルートコメントからスレッド構造を構築
    return rootComments
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map(root => buildSortedThread(root.id));
  }
} as const;
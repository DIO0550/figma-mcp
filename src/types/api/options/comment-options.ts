// コメント関連のAPIオプション型定義

export interface PostCommentOptions {
  message: string;
  clientMeta: {
    x: number;
    y: number;
  };
  commentId?: string;
}

// コメント関連のAPIオプション型定義

export interface PostCommentOptions {
  message: string;
  client_meta: {
    x: number;
    y: number;
  };
  comment_id?: string;
}
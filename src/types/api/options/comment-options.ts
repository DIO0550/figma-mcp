// コメント関連のAPIオプション型定義

export interface GetFileCommentsOptions {
  // 将来的にFigma APIがサポートするパラメータ用
  // 例: as_md?: boolean; // コメントをMarkdown形式で取得
  // 現時点では明示的なパラメータはないが、
  // 型安全性のためにインターフェースを定義
}

export interface PostCommentOptions {
  message: string;
  clientMeta: {
    x: number;
    y: number;
  };
  commentId?: string;
}

// コメント関連のAPIレスポンス型定義

import type { Comment } from '../../../models/comment/index.js';

export interface GetCommentsResponse {
  comments: Comment[];
}

// コメント関連のAPIレスポンス型定義

import type { Comment } from '../../figma-types.js';

export interface GetCommentsResponse {
  comments: Comment[];
}
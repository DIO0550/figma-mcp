// コメント関連のAPI呼び出し関数

import type { HttpClient } from '../../client.js';
import type { Comment } from '../../../models/comment/index.js';
import { buildUrlParams, buildRequestBody } from '../utils/params-builder.js';

// API Options
export interface GetFileCommentsApiOptions {
  // 将来的にFigma APIがサポートするパラメータ用
  // 例: as_md?: boolean; // コメントをMarkdown形式で取得
  // 現時点では明示的なパラメータはないが、
  // 型安全性のためにインターフェースを定義
}

export interface PostFileCommentApiOptions {
  message: string;
  clientMeta: {
    x: number;
    y: number;
  };
  commentId?: string;
}

// API Response
export interface GetFileCommentsApiResponse {
  comments: Comment[];
}

export type PostFileCommentApiResponse = Comment;

export async function getFileCommentsApi(
  client: HttpClient,
  fileKey: string,
  options?: GetFileCommentsApiOptions
): Promise<GetFileCommentsApiResponse> {
  const params = buildUrlParams(options);
  return client.get<GetFileCommentsApiResponse>(`/v1/files/${fileKey}/comments`, params);
}

export async function postFileCommentApi(
  client: HttpClient,
  fileKey: string,
  options: PostFileCommentApiOptions
): Promise<PostFileCommentApiResponse> {
  const body = buildRequestBody(options);
  return client.post<PostFileCommentApiResponse>(`/v1/files/${fileKey}/comments`, body);
}

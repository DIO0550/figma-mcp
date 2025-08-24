// コメント関連のAPI呼び出し関数

import type { HttpClient } from '../../client.js';
import type { GetFileCommentsApiResponse, PostFileCommentApiResponse, PostCommentOptions } from '../../../types/index.js';

export async function getFileCommentsApi(
  client: HttpClient,
  fileKey: string
): Promise<GetFileCommentsApiResponse> {
  return client.get<GetFileCommentsApiResponse>(`/v1/files/${fileKey}/comments`);
}

export async function postFileCommentApi(
  client: HttpClient,
  fileKey: string,
  options: PostCommentOptions
): Promise<PostFileCommentApiResponse> {
  const body: {
    message: string;
    client_meta: { x: number; y: number };
    comment_id?: string;
  } = {
    message: options.message,
    client_meta: options.client_meta,
  };

  if (options.comment_id) {
    body.comment_id = options.comment_id;
  }

  return client.post<PostFileCommentApiResponse>(`/v1/files/${fileKey}/comments`, body);
}

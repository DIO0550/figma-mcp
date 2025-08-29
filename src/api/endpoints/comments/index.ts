// コメント関連のAPI呼び出し関数

import type { HttpClient } from '../../client.js';
import type {
  GetFileCommentsApiResponse,
  PostFileCommentApiResponse,
  PostCommentOptions,
} from '../../../types/index.js';
import { buildUrlParams, buildRequestBody } from '../utils/params-builder.js';

export interface GetFileCommentsOptions {}

export async function getFileCommentsApi(
  client: HttpClient,
  fileKey: string,
  options?: GetFileCommentsOptions
): Promise<GetFileCommentsApiResponse> {
  const params = buildUrlParams(options);
  return client.get<GetFileCommentsApiResponse>(`/v1/files/${fileKey}/comments`, params);
}

export async function postFileCommentApi(
  client: HttpClient,
  fileKey: string,
  options: PostCommentOptions
): Promise<PostFileCommentApiResponse> {
  const body = buildRequestBody(options);
  return client.post<PostFileCommentApiResponse>(`/v1/files/${fileKey}/comments`, body);
}

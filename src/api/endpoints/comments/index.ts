// コメント関連のAPI呼び出し関数

import type { HttpClient } from '../../client/client.js';
import type { Comment } from '../../../models/comment/index.js';
import { buildUrlParams, buildRequestBody } from '../utils/params-builder.js';
import { ApiPath } from '../../paths.js';

// API Options
/**
 * Figmaファイルのコメント取得オプション
 *
 * @remarks
 * 現時点では明示的なパラメータはありませんが、
 * 将来的なFigma APIの拡張に備えて型定義を用意しています。
 * 例: as_md?: boolean; (コメントをMarkdown形式で取得)
 */
export interface GetFileCommentsApiOptions {}

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
  return await client.get<GetFileCommentsApiResponse>(ApiPath.fileComments(fileKey), params);
}

export async function postFileCommentApi(
  client: HttpClient,
  fileKey: string,
  options: PostFileCommentApiOptions
): Promise<PostFileCommentApiResponse> {
  const body = buildRequestBody(options);
  return await client.post<PostFileCommentApiResponse>(ApiPath.fileComments(fileKey), body);
}

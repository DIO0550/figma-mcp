// コメント関連のAPI関数

import type { HttpClient } from '../../client.js';
import type { GetCommentsResponse, Comment, PostCommentOptions } from '../../../types/index.js';

export interface CommentsApi {
  getComments: (fileKey: string) => Promise<GetCommentsResponse>;
  postComment: (fileKey: string, options: PostCommentOptions) => Promise<Comment>;
}

export function createCommentsApi(client: HttpClient): CommentsApi {
  return {
    getComments: async (fileKey: string): Promise<GetCommentsResponse> => {
      return client.get<GetCommentsResponse>(`/v1/files/${fileKey}/comments`);
    },

    postComment: async (fileKey: string, options: PostCommentOptions): Promise<Comment> => {
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

      return client.post<Comment>(`/v1/files/${fileKey}/comments`, body);
    },
  };
}

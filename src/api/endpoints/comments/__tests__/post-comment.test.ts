import { test, expect, vi } from 'vitest';
import { createCommentsApi } from '../index';
import type { HttpClient } from '../../../client';
import type { Comment, PostCommentOptions } from '../../../../types';
import { TestData } from '../../../../constants';

function createMockHttpClient(): HttpClient {
  return {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };
}

test('createCommentsApi.postCommentで新しいコメントを投稿できる', async () => {
  const mockHttpClient = createMockHttpClient();
  const mockComment: Comment = {
    id: 'comment-1',
    fileKey: TestData.FILE_KEY,
    parentId: '',
    user: {
      id: 'user-1',
      handle: 'user1',
      imgUrl: 'https://example.com/user1.png',
      email: 'user1@example.com',
    },
    createdAt: '2024-01-01T00:00:00Z',
    resolvedAt: undefined,
    message: 'New comment',
    clientMeta: {},
    orderId: '1',
  };

  vi.mocked(mockHttpClient.post).mockResolvedValueOnce(mockComment);

  const commentsApi = createCommentsApi(mockHttpClient);
  const options: PostCommentOptions = {
    message: 'New comment',
    client_meta: {
      x: 100,
      y: 200,
    },
  };

  const result = await commentsApi.postComment(TestData.FILE_KEY, options);

  expect(mockHttpClient.post).toHaveBeenCalledWith(
    '/v1/files/test-file-key/comments',
    {
      message: 'New comment',
      client_meta: { x: 100, y: 200 },
    }
  );
  expect(result).toEqual(mockComment);
});

test('createCommentsApi.postCommentで既存のコメントへの返信を投稿できる', async () => {
  const mockHttpClient = createMockHttpClient();
  const mockComment: Comment = {
    id: 'comment-2',
    fileKey: TestData.FILE_KEY,
    parentId: 'comment-1',
    user: {
      id: 'user-1',
      handle: 'user1',
      imgUrl: 'https://example.com/user1.png',
      email: 'user1@example.com',
    },
    createdAt: '2024-01-01T01:00:00Z',
    resolvedAt: undefined,
    message: 'Reply comment',
    clientMeta: {},
    orderId: '2',
  };

  vi.mocked(mockHttpClient.post).mockResolvedValueOnce(mockComment);

  const commentsApi = createCommentsApi(mockHttpClient);
  const options: PostCommentOptions = {
    message: 'Reply comment',
    client_meta: {
      x: 100,
      y: 200,
    },
    comment_id: 'comment-1',
  };

  const result = await commentsApi.postComment(TestData.FILE_KEY, options);

  expect(mockHttpClient.post).toHaveBeenCalledWith(
    '/v1/files/test-file-key/comments',
    {
      message: 'Reply comment',
      client_meta: { x: 100, y: 200 },
      comment_id: 'comment-1',
    }
  );
  expect(result.parentId).toBe('comment-1');
});

test('createCommentsApi.postCommentでcomment_idが未定義の場合はbodyに含まれない', async () => {
  const mockHttpClient = createMockHttpClient();
  const mockComment = {} as Comment;
  vi.mocked(mockHttpClient.post).mockResolvedValueOnce(mockComment);

  const commentsApi = createCommentsApi(mockHttpClient);
  const options: PostCommentOptions = {
    message: 'Test',
    client_meta: { x: 0, y: 0 },
  };

  await commentsApi.postComment(TestData.FILE_KEY, options);

  const calledBody = vi.mocked(mockHttpClient.post).mock.calls[0][1];
  expect(calledBody).not.toHaveProperty('comment_id');
});

test('createCommentsApi.postCommentで異なる座標位置でコメントを投稿できる', async () => {
  const mockHttpClient = createMockHttpClient();
  const mockComment = {} as Comment;
  vi.mocked(mockHttpClient.post).mockResolvedValueOnce(mockComment);

  const commentsApi = createCommentsApi(mockHttpClient);
  const options: PostCommentOptions = {
    message: 'Test at different position',
    client_meta: {
      x: 500,
      y: 750,
    },
  };

  await commentsApi.postComment(TestData.FILE_KEY, options);

  expect(mockHttpClient.post).toHaveBeenCalledWith(
    '/v1/files/test-file-key/comments',
    {
      message: 'Test at different position',
      client_meta: { x: 500, y: 750 },
    }
  );
});

test('createCommentsApi.postCommentで空のメッセージでもコメントを投稿できる', async () => {
  const mockHttpClient = createMockHttpClient();
  const mockComment = {} as Comment;
  vi.mocked(mockHttpClient.post).mockResolvedValueOnce(mockComment);

  const commentsApi = createCommentsApi(mockHttpClient);
  const options: PostCommentOptions = {
    message: '',
    client_meta: { x: 0, y: 0 },
  };

  await commentsApi.postComment(TestData.FILE_KEY, options);

  const calledBody = vi.mocked(mockHttpClient.post).mock.calls[0][1];
  expect(calledBody).toHaveProperty('message', '');
});

test('createCommentsApi.postCommentで長いメッセージを含むコメントを投稿できる', async () => {
  const mockHttpClient = createMockHttpClient();
  const mockComment = {} as Comment;
  vi.mocked(mockHttpClient.post).mockResolvedValueOnce(mockComment);

  const longMessage = 'A'.repeat(1000);
  const commentsApi = createCommentsApi(mockHttpClient);
  const options: PostCommentOptions = {
    message: longMessage,
    client_meta: { x: 0, y: 0 },
  };

  await commentsApi.postComment(TestData.FILE_KEY, options);

  const calledBody = vi.mocked(mockHttpClient.post).mock.calls[0][1];
  expect(calledBody).toHaveProperty('message', longMessage);
});

test('createCommentsApi.postCommentでHTTPクライアントがエラーをスローした場合、エラーが伝播される', async () => {
  const mockHttpClient = createMockHttpClient();
  const expectedError = new Error('Network error');
  vi.mocked(mockHttpClient.post).mockRejectedValueOnce(expectedError);

  const commentsApi = createCommentsApi(mockHttpClient);
  const options: PostCommentOptions = {
    message: 'Test',
    client_meta: { x: 0, y: 0 },
  };

  await expect(commentsApi.postComment(TestData.FILE_KEY, options)).rejects.toThrow('Network error');
});

test('createCommentsApi.postCommentで権限エラーが適切に処理される', async () => {
  const mockHttpClient = createMockHttpClient();
  const permissionError = new Error('Forbidden');
  vi.mocked(mockHttpClient.post).mockRejectedValueOnce(permissionError);

  const commentsApi = createCommentsApi(mockHttpClient);
  const options: PostCommentOptions = {
    message: 'Test',
    client_meta: { x: 0, y: 0 },
  };

  await expect(commentsApi.postComment(TestData.FILE_KEY, options)).rejects.toThrow('Forbidden');
});

test('createCommentsApi.postCommentで特殊文字を含むメッセージを正しく送信できる', async () => {
  const mockHttpClient = createMockHttpClient();
  const mockComment = {} as Comment;
  vi.mocked(mockHttpClient.post).mockResolvedValueOnce(mockComment);

  const commentsApi = createCommentsApi(mockHttpClient);
  const options: PostCommentOptions = {
    message: 'Message with "quotes" and 日本語',
    client_meta: { x: 0, y: 0 },
  };

  await commentsApi.postComment(TestData.FILE_KEY, options);

  const calledBody = vi.mocked(mockHttpClient.post).mock.calls[0][1];
  expect(calledBody).toHaveProperty('message', 'Message with "quotes" and 日本語');
});
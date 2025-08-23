import { test, expect, vi } from 'vitest';
import { createCommentsApi } from '../index';
import type { HttpClient } from '../../../client';
import type { GetCommentsResponse } from '../../../../types';
import { TestData } from '../../../../constants';

function createMockHttpClient(): HttpClient {
  return {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };
}

test('createCommentsApi.getCommentsでコメント一覧を取得できる', async () => {
  const mockHttpClient = createMockHttpClient();
  const mockResponse: GetCommentsResponse = {
    comments: [
      {
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
        message: 'Test comment',
        clientMeta: {
          nodeId: ['1:1'],
          nodeOffset: { x: 0, y: 0 },
        },
        orderId: '1',
      },
    ],
  };

  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const commentsApi = createCommentsApi(mockHttpClient);
  const result = await commentsApi.getComments(TestData.FILE_KEY);

  expect(mockHttpClient.get).toHaveBeenCalledWith(
    '/v1/files/test-file-key/comments'
  );
  expect(result).toEqual(mockResponse);
});

test('createCommentsApi.getCommentsで空のコメント一覧を取得できる', async () => {
  const mockHttpClient = createMockHttpClient();
  const mockResponse: GetCommentsResponse = {
    comments: [],
  };

  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const commentsApi = createCommentsApi(mockHttpClient);
  const result = await commentsApi.getComments(TestData.FILE_KEY);

  expect(result.comments).toHaveLength(0);
});

test('createCommentsApi.getCommentsで複数のコメントがある場合も正しく取得できる', async () => {
  const mockHttpClient = createMockHttpClient();
  const mockResponse: GetCommentsResponse = {
    comments: [
      {
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
        message: 'First comment',
        clientMeta: {},
        orderId: '1',
      },
      {
        id: 'comment-2',
        fileKey: TestData.FILE_KEY,
        parentId: 'comment-1',
        user: {
          id: 'user-2',
          handle: 'user2',
          imgUrl: 'https://example.com/user2.png',
          email: 'user2@example.com',
        },
        createdAt: '2024-01-01T01:00:00Z',
        resolvedAt: undefined,
        message: 'Reply to first comment',
        clientMeta: {},
        orderId: '2',
      },
    ],
  };

  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const commentsApi = createCommentsApi(mockHttpClient);
  const result = await commentsApi.getComments(TestData.FILE_KEY);

  expect(result.comments).toHaveLength(2);
  expect(result.comments[0].id).toBe('comment-1');
  expect(result.comments[1].parentId).toBe('comment-1');
});

test('createCommentsApi.getCommentsで解決済みのコメントも正しく取得できる', async () => {
  const mockHttpClient = createMockHttpClient();
  const mockResponse: GetCommentsResponse = {
    comments: [
      {
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
        resolvedAt: '2024-01-02T00:00:00Z',
        message: 'Resolved comment',
        clientMeta: {},
        orderId: '1',
      },
    ],
  };

  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const commentsApi = createCommentsApi(mockHttpClient);
  const result = await commentsApi.getComments(TestData.FILE_KEY);

  expect(result.comments[0].resolvedAt).toBe('2024-01-02T00:00:00Z');
});

test('createCommentsApi.getCommentsでHTTPクライアントがエラーをスローした場合、エラーが伝播される', async () => {
  const mockHttpClient = createMockHttpClient();
  const expectedError = new Error('Network error');
  vi.mocked(mockHttpClient.get).mockRejectedValueOnce(expectedError);

  const commentsApi = createCommentsApi(mockHttpClient);

  await expect(commentsApi.getComments(TestData.FILE_KEY)).rejects.toThrow('Network error');
});

test('createCommentsApi.getCommentsで認証エラーが適切に処理される', async () => {
  const mockHttpClient = createMockHttpClient();
  const authError = new Error('Unauthorized');
  vi.mocked(mockHttpClient.get).mockRejectedValueOnce(authError);

  const commentsApi = createCommentsApi(mockHttpClient);

  await expect(commentsApi.getComments(TestData.FILE_KEY)).rejects.toThrow('Unauthorized');
});

test('createCommentsApi.getCommentsで特殊文字を含むファイルキーが正しくエンコードされる', async () => {
  const mockHttpClient = createMockHttpClient();
  const mockResponse: GetCommentsResponse = { comments: [] };
  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const commentsApi = createCommentsApi(mockHttpClient);
  const specialFileKey = 'file:key/with-special@chars';
  await commentsApi.getComments(specialFileKey);

  expect(mockHttpClient.get).toHaveBeenCalledWith(
    '/v1/files/file:key/with-special@chars/comments'
  );
});
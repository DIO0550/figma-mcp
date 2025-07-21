import { describe, test, expect, vi, beforeEach } from 'vitest';
import type { FigmaApiClient } from '../../api/figma-api-client.js';
import type { GetCommentsResponse } from '../../types/api/responses/comment-responses.js';

describe('get-comments', () => {
  let mockApiClient: FigmaApiClient;
  let getComments: any;

  beforeEach(() => {
    // APIクライアントのモック作成
    mockApiClient = {
      getComments: vi.fn(),
    } as unknown as FigmaApiClient;
  });

  test('コメント一覧を取得できる', async () => {
    // Arrange
    const fileKey = 'test-file-key';
    const mockResponse: GetCommentsResponse = {
      comments: [
        {
          id: 'comment-1',
          message: 'This needs adjustment',
          user: {
            id: 'user-1',
            handle: 'designer1',
            img_url: 'https://example.com/avatar1.png',
          },
          created_at: '2024-01-01T00:00:00Z',
          resolved_at: null,
          client_meta: {
            x: 100,
            y: 200,
            node_id: ['1:2'],
          },
          file_key: fileKey,
          parent_id: '',
          reactions: [],
        },
        {
          id: 'comment-2', 
          message: 'Great work!',
          user: {
            id: 'user-2',
            handle: 'designer2',
            img_url: 'https://example.com/avatar2.png',
          },
          created_at: '2024-01-02T00:00:00Z',
          resolved_at: '2024-01-03T00:00:00Z',
          client_meta: {
            x: 300,
            y: 400,
            node_id: ['3:4'],
          },
          file_key: fileKey,
          parent_id: '',
          reactions: [
            {
              emoji: '👍',
              users: [{ id: 'user-1', handle: 'designer1', img_url: '' }],
            },
          ],
        },
      ],
    };

    vi.mocked(mockApiClient.getComments).mockResolvedValue(mockResponse);

    // Act
    const { createCommentTools } = await import('./index.js');
    const tools = createCommentTools(mockApiClient);
    const result = await tools.getComments.execute({ fileKey });

    // Assert
    expect(mockApiClient.getComments).toHaveBeenCalledWith(fileKey);
    expect(result).toEqual(mockResponse);
    expect(result.comments).toHaveLength(2);
  });

  test('APIエラーを適切に処理する', async () => {
    // Arrange
    const fileKey = 'test-file-key';
    const mockError = new Error('API Error: 401 Unauthorized');

    vi.mocked(mockApiClient.getComments).mockRejectedValue(mockError);

    // Act & Assert
    const { createCommentTools } = await import('./index.js');
    const tools = createCommentTools(mockApiClient);
    
    await expect(tools.getComments.execute({ fileKey })).rejects.toThrow('API Error: 401 Unauthorized');
  });

  test('空のコメントリストを処理できる', async () => {
    // Arrange
    const fileKey = 'test-file-key';
    const mockResponse: GetCommentsResponse = {
      comments: [],
    };

    vi.mocked(mockApiClient.getComments).mockResolvedValue(mockResponse);

    // Act
    const { createCommentTools } = await import('./index.js');
    const tools = createCommentTools(mockApiClient);
    const result = await tools.getComments.execute({ fileKey });

    // Assert
    expect(result.comments).toHaveLength(0);
  });

  test('スレッド形式のコメントを処理できる', async () => {
    // Arrange
    const fileKey = 'test-file-key';
    const mockResponse: GetCommentsResponse = {
      comments: [
        {
          id: 'comment-parent',
          message: 'Original comment',
          user: { id: 'user-1', handle: 'designer1', img_url: '' },
          created_at: '2024-01-01T00:00:00Z',
          resolved_at: null,
          client_meta: { x: 100, y: 200, node_id: ['1:2'] },
          file_key: fileKey,
          parent_id: '',
          reactions: [],
        },
        {
          id: 'comment-reply',
          message: 'Reply to original',
          user: { id: 'user-2', handle: 'designer2', img_url: '' },
          created_at: '2024-01-02T00:00:00Z',
          resolved_at: null,
          client_meta: null,
          file_key: fileKey,
          parent_id: 'comment-parent',
          reactions: [],
        },
      ],
    };

    vi.mocked(mockApiClient.getComments).mockResolvedValue(mockResponse);

    // Act
    const { createCommentTools } = await import('./index.js');
    const tools = createCommentTools(mockApiClient);
    const result = await tools.getComments.execute({ fileKey });

    // Assert
    const parentComment = result.comments.find(c => c.id === 'comment-parent');
    const replyComment = result.comments.find(c => c.id === 'comment-reply');
    
    expect(parentComment?.parent_id).toBe('');
    expect(replyComment?.parent_id).toBe('comment-parent');
  });

  test('解決済みコメントをフィルタリングできる', async () => {
    // Arrange  
    const fileKey = 'test-file-key';
    const mockResponse: GetCommentsResponse = {
      comments: [
        {
          id: 'comment-1',
          message: 'Unresolved',
          user: { id: 'user-1', handle: 'designer1', img_url: '' },
          created_at: '2024-01-01T00:00:00Z',
          resolved_at: null,
          client_meta: { x: 100, y: 200, node_id: ['1:2'] },
          file_key: fileKey,
          parent_id: '',
          reactions: [],
        },
        {
          id: 'comment-2',
          message: 'Resolved',
          user: { id: 'user-2', handle: 'designer2', img_url: '' },
          created_at: '2024-01-02T00:00:00Z',
          resolved_at: '2024-01-03T00:00:00Z',
          client_meta: { x: 300, y: 400, node_id: ['3:4'] },
          file_key: fileKey,
          parent_id: '',
          reactions: [],
        },
      ],
    };

    vi.mocked(mockApiClient.getComments).mockResolvedValue(mockResponse);

    // Act
    const { createCommentTools } = await import('./index.js');
    const tools = createCommentTools(mockApiClient);
    const result = await tools.getComments.execute({ fileKey });

    // Assert
    const unresolvedComments = result.comments.filter(c => c.resolved_at === null);
    const resolvedComments = result.comments.filter(c => c.resolved_at !== null);
    
    expect(unresolvedComments).toHaveLength(1);
    expect(resolvedComments).toHaveLength(1);
  });
});
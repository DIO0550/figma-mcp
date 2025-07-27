import { describe, test, expect, vi, beforeEach } from 'vitest';
import type { FigmaApiClient } from '../../api/figma-api-client.js';
import type { GetCommentsResponse } from '../../types/api/responses/comment-responses.js';
import type { CommentWithReplies } from './types.js';

describe('list', () => {
  let mockApiClient: FigmaApiClient;

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
            email: 'designer1@example.com',
          },
          created_at: '2024-01-01T00:00:00Z',
          resolved_at: undefined,
          client_meta: {
            x: 100,
            y: 200,
            node_id: ['1:2'],
          },
          file_key: fileKey,
          parent_id: '',
          order_id: '1',
          reactions: [],
        },
        {
          id: 'comment-2', 
          message: 'Great work!',
          user: {
            id: 'user-2',
            handle: 'designer2',
            img_url: 'https://example.com/avatar2.png',
            email: 'designer2@example.com',
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
          order_id: '1',
          reactions: [
            {
              emoji: '👍',
              user: { id: 'user-1', handle: 'designer1', img_url: '', email: 'designer1@example.com' },
              created_at: '2024-01-02T12:00:00Z',
            },
          ],
        },
      ],
    };

    (mockApiClient.getComments as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

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

    (mockApiClient.getComments as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

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

    (mockApiClient.getComments as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

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
          user: { id: 'user-1', handle: 'designer1', img_url: '', email: 'designer1@example.com' },
          created_at: '2024-01-01T00:00:00Z',
          resolved_at: undefined,
          client_meta: { x: 100, y: 200, node_id: ['1:2'] },
          file_key: fileKey,
          parent_id: '',
          order_id: '1',
          reactions: [],
        },
        {
          id: 'comment-reply',
          message: 'Reply to original',
          user: { id: 'user-2', handle: 'designer2', img_url: '', email: 'designer2@example.com' },
          created_at: '2024-01-02T00:00:00Z',
          resolved_at: undefined,
          client_meta: {},
          file_key: fileKey,
          parent_id: 'comment-parent',
          order_id: '1',
          reactions: [],
        },
      ],
    };

    (mockApiClient.getComments as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

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
          user: { id: 'user-1', handle: 'designer1', img_url: '', email: 'designer1@example.com' },
          created_at: '2024-01-01T00:00:00Z',
          resolved_at: undefined,
          client_meta: { x: 100, y: 200, node_id: ['1:2'] },
          file_key: fileKey,
          parent_id: '',
          order_id: '1',
          reactions: [],
        },
        {
          id: 'comment-2',
          message: 'Resolved',
          user: { id: 'user-2', handle: 'designer2', img_url: '', email: 'designer2@example.com' },
          created_at: '2024-01-02T00:00:00Z',
          resolved_at: '2024-01-03T00:00:00Z',
          client_meta: { x: 300, y: 400, node_id: ['3:4'] },
          file_key: fileKey,
          parent_id: '',
          order_id: '1',
          reactions: [],
        },
      ],
    };

    (mockApiClient.getComments as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    // Act
    const { createCommentTools } = await import('./index.js');
    const tools = createCommentTools(mockApiClient);
    const result = await tools.getComments.execute({ fileKey });

    // Assert
    const unresolvedComments = result.comments.filter(c => !c.resolved_at);
    const resolvedComments = result.comments.filter(c => c.resolved_at);
    
    expect(unresolvedComments).toHaveLength(1);
    expect(resolvedComments).toHaveLength(1);
  });

  test('showResolvedオプションでフィルタリングできる', async () => {
    // Arrange
    const fileKey = 'test-file-key';
    const mockResponse: GetCommentsResponse = {
      comments: [
        {
          id: 'comment-1',
          message: 'Unresolved',
          user: { id: 'user-1', handle: 'designer1', img_url: '', email: 'designer1@example.com' },
          created_at: '2024-01-01T00:00:00Z',
          resolved_at: undefined,
          client_meta: { x: 100, y: 200, node_id: ['1:2'] },
          file_key: fileKey,
          parent_id: '',
          order_id: '1',
          reactions: [],
        },
        {
          id: 'comment-2',
          message: 'Resolved',
          user: { id: 'user-2', handle: 'designer2', img_url: '', email: 'designer2@example.com' },
          created_at: '2024-01-02T00:00:00Z',
          resolved_at: '2024-01-03T00:00:00Z',
          client_meta: { x: 300, y: 400, node_id: ['3:4'] },
          file_key: fileKey,
          parent_id: '',
          order_id: '1',
          reactions: [],
        },
      ],
    };

    (mockApiClient.getComments as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    // Act - showResolved: false
    const { createCommentTools } = await import('./index.js');
    const tools = createCommentTools(mockApiClient);
    const resultUnresolvedOnly = await tools.getComments.execute({ 
      fileKey, 
      showResolved: false 
    });

    // Assert
    expect(resultUnresolvedOnly.comments).toHaveLength(1);
    expect(resultUnresolvedOnly.comments[0].resolved_at).toBeUndefined();
    
    // Act - showResolved: true (default)
    const resultAll = await tools.getComments.execute({ fileKey });
    
    // Assert
    expect(resultAll.comments).toHaveLength(2);
  });

  test('userIdオプションで特定ユーザーのコメントをフィルタリングできる', async () => {
    // Arrange
    const fileKey = 'test-file-key';
    const mockResponse: GetCommentsResponse = {
      comments: [
        {
          id: 'comment-1',
          message: 'User 1 comment',
          user: { id: 'user-1', handle: 'designer1', img_url: '', email: 'designer1@example.com' },
          created_at: '2024-01-01T00:00:00Z',
          resolved_at: undefined,
          client_meta: { x: 100, y: 200, node_id: ['1:2'] },
          file_key: fileKey,
          parent_id: '',
          order_id: '1',
          reactions: [],
        },
        {
          id: 'comment-2',
          message: 'User 2 comment',
          user: { id: 'user-2', handle: 'designer2', img_url: '', email: 'designer2@example.com' },
          created_at: '2024-01-02T00:00:00Z',
          resolved_at: undefined,
          client_meta: { x: 300, y: 400, node_id: ['3:4'] },
          file_key: fileKey,
          parent_id: '',
          order_id: '1',
          reactions: [],
        },
      ],
    };

    (mockApiClient.getComments as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    // Act
    const { createCommentTools } = await import('./index.js');
    const tools = createCommentTools(mockApiClient);
    const result = await tools.getComments.execute({ 
      fileKey, 
      userId: 'user-1' 
    });

    // Assert
    expect(result.comments).toHaveLength(1);
    expect(result.comments[0].user.id).toBe('user-1');
  });

  test('nodeIdオプションで特定ノードのコメントをフィルタリングできる', async () => {
    // Arrange
    const fileKey = 'test-file-key';
    const mockResponse: GetCommentsResponse = {
      comments: [
        {
          id: 'comment-1',
          message: 'Node 1:2 comment',
          user: { id: 'user-1', handle: 'designer1', img_url: '', email: 'designer1@example.com' },
          created_at: '2024-01-01T00:00:00Z',
          resolved_at: undefined,
          client_meta: { x: 100, y: 200, node_id: ['1:2'] },
          file_key: fileKey,
          parent_id: '',
          order_id: '1',
          reactions: [],
        },
        {
          id: 'comment-2',
          message: 'Node 3:4 comment',
          user: { id: 'user-2', handle: 'designer2', img_url: '', email: 'designer2@example.com' },
          created_at: '2024-01-02T00:00:00Z',
          resolved_at: undefined,
          client_meta: { x: 300, y: 400, node_id: ['3:4'] },
          file_key: fileKey,
          parent_id: '',
          order_id: '1',
          reactions: [],
        },
      ],
    };

    (mockApiClient.getComments as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    // Act
    const { createCommentTools } = await import('./index.js');
    const tools = createCommentTools(mockApiClient);
    const result = await tools.getComments.execute({ 
      fileKey, 
      nodeId: '1:2' 
    });

    // Assert
    expect(result.comments).toHaveLength(1);
    expect(result.comments[0].client_meta?.node_id).toContain('1:2');
  });

  test('organizeThreadsオプションでスレッドを構造化できる', async () => {
    // Arrange
    const fileKey = 'test-file-key';
    const mockResponse: GetCommentsResponse = {
      comments: [
        {
          id: 'comment-parent',
          message: 'Original comment',
          user: { id: 'user-1', handle: 'designer1', img_url: '', email: 'designer1@example.com' },
          created_at: '2024-01-01T00:00:00Z',
          resolved_at: undefined,
          client_meta: { x: 100, y: 200, node_id: ['1:2'] },
          file_key: fileKey,
          parent_id: '',
          order_id: '1',
          reactions: [],
        },
        {
          id: 'comment-reply1',
          message: 'First reply',
          user: { id: 'user-2', handle: 'designer2', img_url: '', email: 'designer2@example.com' },
          created_at: '2024-01-02T00:00:00Z',
          resolved_at: undefined,
          client_meta: {},
          file_key: fileKey,
          parent_id: 'comment-parent',
          order_id: '1',
          reactions: [],
        },
        {
          id: 'comment-reply2',
          message: 'Second reply',
          user: { id: 'user-1', handle: 'designer1', img_url: '', email: 'designer1@example.com' },
          created_at: '2024-01-03T00:00:00Z',
          resolved_at: undefined,
          client_meta: {},
          file_key: fileKey,
          parent_id: 'comment-parent',
          order_id: '1',
          reactions: [],
        },
      ],
    };

    (mockApiClient.getComments as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    // Act
    const { createCommentTools } = await import('./index.js');
    const tools = createCommentTools(mockApiClient);
    const result = await tools.getComments.execute({ 
      fileKey, 
      organizeThreads: true 
    });

    // Assert
    expect(result.comments).toHaveLength(1); // Only parent comment at top level
    expect(result.comments[0].id).toBe('comment-parent');
    
    // organizeThreadsオプションを使用した場合、コメントはCommentWithReplies型として扱われる
    const parentComment = result.comments[0] as CommentWithReplies;
    expect(parentComment.replies).toHaveLength(2);
    expect(parentComment.replies?.[0].id).toBe('comment-reply1');
    expect(parentComment.replies?.[1].id).toBe('comment-reply2');
  });

  test('複数のフィルタオプションを組み合わせて使用できる', async () => {
    // Arrange
    const fileKey = 'test-file-key';
    const mockResponse: GetCommentsResponse = {
      comments: [
        {
          id: 'comment-1',
          message: 'User 1 unresolved on node 1:2',
          user: { id: 'user-1', handle: 'designer1', img_url: '', email: 'designer1@example.com' },
          created_at: '2024-01-01T00:00:00Z',
          resolved_at: undefined,
          client_meta: { x: 100, y: 200, node_id: ['1:2'] },
          file_key: fileKey,
          parent_id: '',
          order_id: '1',
          reactions: [],
        },
        {
          id: 'comment-2',
          message: 'User 1 resolved on node 1:2',
          user: { id: 'user-1', handle: 'designer1', img_url: '', email: 'designer1@example.com' },
          created_at: '2024-01-02T00:00:00Z',
          resolved_at: '2024-01-03T00:00:00Z',
          client_meta: { x: 150, y: 250, node_id: ['1:2'] },
          file_key: fileKey,
          parent_id: '',
          order_id: '1',
          reactions: [],
        },
        {
          id: 'comment-3',
          message: 'User 2 unresolved on node 3:4',
          user: { id: 'user-2', handle: 'designer2', img_url: '', email: 'designer2@example.com' },
          created_at: '2024-01-03T00:00:00Z',
          resolved_at: undefined,
          client_meta: { x: 300, y: 400, node_id: ['3:4'] },
          file_key: fileKey,
          parent_id: '',
          order_id: '1',
          reactions: [],
        },
      ],
    };

    (mockApiClient.getComments as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    // Act
    const { createCommentTools } = await import('./index.js');
    const tools = createCommentTools(mockApiClient);
    const result = await tools.getComments.execute({ 
      fileKey, 
      userId: 'user-1',
      nodeId: '1:2',
      showResolved: false
    });

    // Assert
    expect(result.comments).toHaveLength(1);
    expect(result.comments[0].id).toBe('comment-1');
  });
});
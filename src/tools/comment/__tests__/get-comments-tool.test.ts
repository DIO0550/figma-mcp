import { test, expect, beforeAll, afterAll } from 'vitest';
import { FigmaApiClient } from '../../../api/figma-api-client/index.js';
import type { FigmaApiClientInterface } from '../../../api/figma-api-client/index.js';
import type { CommentWithReplies } from '../types.js';
import { MockFigmaServer } from '../../../__tests__/mocks/server.js';
import { GetCommentsTool } from '../index.js';

let mockServer: MockFigmaServer;
let apiClient: FigmaApiClientInterface;

beforeAll(async () => {
  // モックサーバーを起動
  mockServer = new MockFigmaServer(3006);
  await mockServer.start();

  // 実際のAPIクライアントを作成（モックサーバーに接続）
  apiClient = FigmaApiClient.create('test-token', 'http://localhost:3006');
});

afterAll(async () => {
  await mockServer.stop();
});

test('有効なファイルキーでコメント一覧を取得すると配列形式でコメントが返される', async () => {
  // Arrange
  const fileKey = 'test-file-key';

  // Act
  const result = await GetCommentsTool.execute(GetCommentsTool.from(apiClient), { fileKey });

  // Assert
  expect(result).toBeDefined();
  expect(result.comments).toBeDefined();
  expect(Array.isArray(result.comments)).toBe(true);
  expect(result.comments.length).toBeGreaterThan(0);

  const firstComment = result.comments[0];
  expect(firstComment.id).toBeDefined();
  expect(firstComment.message).toBeDefined();
  expect(firstComment.user).toBeDefined();
});

test('コメントが存在しないファイルのコメントを取得すると空配列が返される', async () => {
  // Arrange
  const fileKey = 'empty-file-key';

  // Act
  const result = await GetCommentsTool.execute(GetCommentsTool.from(apiClient), { fileKey });

  // Assert
  expect(result).toBeDefined();
  expect(result.comments).toBeDefined();
  expect(Array.isArray(result.comments)).toBe(true);
  expect(result.comments).toHaveLength(0);
});

test('organizeThreadsオプションを有効にしてコメントを取得するとスレッド形式で整理される', async () => {
  // Arrange
  const fileKey = 'test-file-key';

  // Act
  const result = await GetCommentsTool.execute(GetCommentsTool.from(apiClient), {
    fileKey,
    organizeThreads: true,
  });

  // Assert
  expect(result).toBeDefined();
  expect(result.comments).toBeDefined();
  expect(Array.isArray(result.comments)).toBe(true);

  // スレッド形式の場合、親コメントのみがトップレベルに存在
  const parentComments = result.comments.filter((c) => {
    return !c.parentId || c.parentId === '';
  });
  expect(parentComments.length).toBeGreaterThan(0);

  // 返信がある場合の検証
  const commentWithReplies = result.comments.find((c) => {
    const withReplies = c as CommentWithReplies;
    return withReplies.replies && withReplies.replies.length > 0;
  }) as CommentWithReplies | undefined;

  if (commentWithReplies) {
    expect(commentWithReplies.replies).toBeDefined();
    expect(Array.isArray(commentWithReplies.replies)).toBe(true);
  }
});

test('showResolvedをfalseに設定すると解決済みコメントが除外される', async () => {
  // Arrange
  const fileKey = 'test-file-key';

  // Act
  const result = await GetCommentsTool.execute(GetCommentsTool.from(apiClient), {
    fileKey,
    showResolved: false,
  });

  // Assert
  expect(result).toBeDefined();
  expect(result.comments).toBeDefined();

  // 未解決のコメントのみが返される
  const resolvedComments = result.comments.filter((c) => {
    return c.resolvedAt;
  });
  expect(resolvedComments).toHaveLength(0);
});

test('showResolvedオプションの値に応じて解決済みコメントの表示・非表示が制御される', async () => {
  // Arrange
  const fileKey = 'test-file-key';

  // Act - showResolved=false
  const result1 = await GetCommentsTool.execute(GetCommentsTool.from(apiClient), {
    fileKey,
    showResolved: false,
  });

  // Act - showResolved=true
  const result2 = await GetCommentsTool.execute(GetCommentsTool.from(apiClient), {
    fileKey,
    showResolved: true,
  });

  // Assert
  expect(result1).toBeDefined();
  expect(result2).toBeDefined();

  // showResolved=false では解決済みコメントが含まれない
  const resolvedInResult1 = result1.comments.filter((c) => {
    return c.resolvedAt;
  });
  expect(resolvedInResult1).toHaveLength(0);

  // showResolved=true では解決済みコメントも含まれる可能性がある
  expect(result2.comments.length).toBeGreaterThanOrEqual(result1.comments.length);
});

test('特定のユーザーIDを指定するとそのユーザーのコメントのみが返される', async () => {
  // Arrange
  const fileKey = 'test-file-key';
  const userId = 'user-1';

  // Act
  const result = await GetCommentsTool.execute(GetCommentsTool.from(apiClient), {
    fileKey,
    userId,
  });

  // Assert
  expect(result).toBeDefined();
  expect(result.comments).toBeDefined();

  // 指定したユーザーのコメントのみが返される
  const otherUserComments = result.comments.filter((c) => {
    return c.user.id !== userId;
  });
  expect(otherUserComments).toHaveLength(0);

  // 少なくとも1つのコメントが返される（モックデータに存在する場合）
  if (result.comments.length > 0) {
    expect(result.comments[0].user.id).toBe(userId);
  }
});

test('特定のノードIDを指定するとそのノードに関連するコメントのみが返される', async () => {
  // Arrange
  const fileKey = 'test-file-key';
  const nodeId = '1:2';

  // Act
  const result = await GetCommentsTool.execute(GetCommentsTool.from(apiClient), {
    fileKey,
    nodeId,
  });

  // Assert
  expect(result).toBeDefined();
  expect(result.comments).toBeDefined();

  // 指定したノードに関連するコメントのみが返される
  result.comments.forEach((c) => {
    expect(c.clientMeta?.nodeId).toBeDefined();
    expect(c.clientMeta?.nodeId?.includes(nodeId)).toBe(true);
  });
});

test('複数のフィルター条件を同時に指定するとすべての条件を満たすコメントのみが返される', async () => {
  // Arrange
  const fileKey = 'test-file-key';
  const userId = 'user-1';
  const nodeId = '1:2';

  // Act
  const result = await GetCommentsTool.execute(GetCommentsTool.from(apiClient), {
    fileKey,
    userId,
    nodeId,
    showResolved: false,
  });

  // Assert
  expect(result).toBeDefined();
  expect(result.comments).toBeDefined();

  // すべてのフィルター条件を満たすコメントのみが返される
  result.comments.forEach((c) => {
    expect(c.user.id).toBe(userId);
    expect(c.clientMeta?.nodeId?.includes(nodeId)).toBe(true);
    expect(c.resolvedAt).toBeUndefined();
  });
});

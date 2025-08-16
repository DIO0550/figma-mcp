import { test, expect } from 'vitest';
import { Comment } from '../comment.js';
import type { FigmaUser } from '../../../types/figma-types.js';

// テストヘルパー関数
function createMockUser(id = 'user-1'): FigmaUser {
  return {
    id,
    email: `${id}@example.com`,
    handle: id,
    imgUrl: `https://example.com/${id}.png`,
  };
}

function createMockComment(
  id: string,
  options: Partial<Comment> = {}
): Comment {
  return {
    id,
    fileKey: 'file-key',
    user: createMockUser(),
    createdAt: '2024-01-01T00:00:00Z',
    message: `Message ${id}`,
    clientMeta: {},
    orderId: id,
    ...options,
  };
}

test('Comment.organizeIntoThreads: 空のコメント配列で空の配列を返す', () => {
  const result = Comment.organizeIntoThreads([]);
  expect(result).toEqual([]);
});

test('Comment.organizeIntoThreads: 単一のルートコメントを正しく処理する', () => {
  const comments = [createMockComment('comment-1')];
  const result = Comment.organizeIntoThreads(comments);

  expect(result).toHaveLength(1);
  expect(result[0].id).toBe('comment-1');
  expect(result[0].replies).toBeUndefined();
});

test('Comment.organizeIntoThreads: ルートコメントと返信を含むスレッド構造を構築する', () => {
  const comments = [
    createMockComment('comment-1'),
    createMockComment('comment-2', {
      parentId: 'comment-1',
      createdAt: '2024-01-01T01:00:00Z',
    }),
    createMockComment('comment-3', {
      parentId: 'comment-1',
      createdAt: '2024-01-01T02:00:00Z',
    }),
  ];

  const result = Comment.organizeIntoThreads(comments);

  expect(result).toHaveLength(1);
  expect(result[0].id).toBe('comment-1');
  expect(result[0].replies).toHaveLength(2);
  expect(result[0].replies![0].id).toBe('comment-2');
  expect(result[0].replies![1].id).toBe('comment-3');
});

test('Comment.organizeIntoThreads: ネストされた返信（返信への返信）を正しく処理する', () => {
  const comments = [
    createMockComment('comment-1'),
    createMockComment('comment-2', {
      parentId: 'comment-1',
      createdAt: '2024-01-01T01:00:00Z',
    }),
    createMockComment('comment-3', {
      parentId: 'comment-2',
      createdAt: '2024-01-01T02:00:00Z',
    }),
  ];

  const result = Comment.organizeIntoThreads(comments);

  expect(result).toHaveLength(1);
  expect(result[0].id).toBe('comment-1');
  expect(result[0].replies).toHaveLength(1);
  expect(result[0].replies![0].id).toBe('comment-2');
  expect(result[0].replies![0].replies).toHaveLength(1);
  expect(result[0].replies![0].replies![0].id).toBe('comment-3');
});

test.each([
  {
    name: '複数のルートコメントを作成日時順にソートする',
    comments: [
      createMockComment('comment-2', { createdAt: '2024-01-02T00:00:00Z' }),
      createMockComment('comment-1', { createdAt: '2024-01-01T00:00:00Z' }),
      createMockComment('comment-3', { createdAt: '2024-01-03T00:00:00Z' }),
    ],
    expected: ['comment-1', 'comment-2', 'comment-3'],
  },
  {
    name: '返信を作成日時順にソートする',
    comments: [
      createMockComment('comment-1'),
      createMockComment('comment-3', {
        parentId: 'comment-1',
        createdAt: '2024-01-01T03:00:00Z',
      }),
      createMockComment('comment-2', {
        parentId: 'comment-1',
        createdAt: '2024-01-01T01:00:00Z',
      }),
    ],
    expected: ['comment-1'],
    replyOrder: ['comment-2', 'comment-3'],
  },
])('Comment.organizeIntoThreads: $name', ({ comments, expected, replyOrder }) => {
  const result = Comment.organizeIntoThreads(comments);
  
  expect(result.map(c => c.id)).toEqual(expected);
  
  if (replyOrder) {
    expect(result[0].replies?.map(r => r.id)).toEqual(replyOrder);
  }
});

test.each([
  {
    name: '存在しない親IDを持つコメントをルートとして扱う',
    parentId: 'non-existent-parent',
  },
  {
    name: '空文字列のparentIdをルートとして扱う',
    parentId: '',
  },
])('Comment.organizeIntoThreads: $name', ({ parentId }) => {
  const comments = [createMockComment('comment-1', { parentId })];
  const result = Comment.organizeIntoThreads(comments);

  expect(result).toHaveLength(1);
  expect(result[0].id).toBe('comment-1');
  expect(result[0].replies).toBeUndefined();
});

test('Comment.organizeIntoThreads: 結果の各コメントオブジェクトがイミュータブルである', () => {
  const comments = [
    createMockComment('comment-1'),
    createMockComment('comment-2', {
      parentId: 'comment-1',
      createdAt: '2024-01-01T01:00:00Z',
    }),
  ];
  const result = Comment.organizeIntoThreads(comments);

  // 各コメントオブジェクトがfreezeされていることを確認
  expect(Object.isFrozen(result[0])).toBe(true);
  expect(Object.isFrozen(result[0].replies![0])).toBe(true);
});

test('Comment.organizeIntoThreads: clientMetaとreactionsプロパティを保持する', () => {
  const clientMeta = {
    nodeId: ['node-123'],
    nodeOffset: { x: 10, y: 20 },
    customField: 'custom value',
  };
  const reactions = [
    {
      user: createMockUser(),
      createdAt: '2024-01-01T01:00:00Z',
      emoji: '👍',
    },
  ];
  
  const comments = [
    createMockComment('comment-1', { clientMeta, reactions }),
  ];
  const result = Comment.organizeIntoThreads(comments);

  expect(result[0].clientMeta).toEqual(clientMeta);
  expect(result[0].reactions).toHaveLength(1);
  expect(result[0].reactions![0].emoji).toBe('👍');
});
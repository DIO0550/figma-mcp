import { test, expect } from 'vitest';
import { buildRequestBody } from '../params-builder';

test('buildRequestBodyでcamelCaseをsnake_caseに変換する', () => {
  const input = {
    userName: 'test',
    firstName: 'John',
    lastName: 'Doe',
  };

  const result = buildRequestBody(input);

  expect(result).toEqual({
    user_name: 'test',
    first_name: 'John',
    last_name: 'Doe',
  });
});

test('buildRequestBodyでundefined値を除外する', () => {
  const input = {
    message: 'Hello',
    optionalField: undefined,
    anotherField: 'World',
  };

  const result = buildRequestBody(input);

  expect(result).toEqual({
    message: 'Hello',
    another_field: 'World',
  });
  expect(result).not.toHaveProperty('optional_field');
});

test('buildRequestBodyでネストされたオブジェクトも変換する', () => {
  const input = {
    userName: 'test',
    clientMeta: {
      xPosition: 100,
      yPosition: 200,
    },
  };

  const result = buildRequestBody(input);

  expect(result).toEqual({
    user_name: 'test',
    client_meta: {
      x_position: 100,
      y_position: 200,
    },
  });
});

test('buildRequestBodyで配列はそのまま保持する', () => {
  const input = {
    itemIds: ['id1', 'id2', 'id3'],
    nodeRefs: [1, 2, 3],
  };

  const result = buildRequestBody(input);

  expect(result).toEqual({
    item_ids: ['id1', 'id2', 'id3'],
    node_refs: [1, 2, 3],
  });
});

test('buildRequestBodyでnull値は保持する', () => {
  const input = {
    userName: 'test',
    deletedAt: null,
  };

  const result = buildRequestBody(input);

  expect(result).toEqual({
    user_name: 'test',
    deleted_at: null,
  });
});

test('buildRequestBodyで空のオブジェクトを処理できる', () => {
  const input = {};

  const result = buildRequestBody(input);

  expect(result).toEqual({});
});

test('buildRequestBodyでboolean値を保持する', () => {
  const input = {
    isActive: true,
    hasPermission: false,
  };

  const result = buildRequestBody(input);

  expect(result).toEqual({
    is_active: true,
    has_permission: false,
  });
});

test('buildRequestBodyで数値を保持する', () => {
  const input = {
    userId: 123,
    averageScore: 95.5,
  };

  const result = buildRequestBody(input);

  expect(result).toEqual({
    user_id: 123,
    average_score: 95.5,
  });
});

test('buildRequestBodyで深くネストされたオブジェクトも再帰的に変換する', () => {
  const input = {
    userProfile: {
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
      },
      accountSettings: {
        emailNotifications: true,
        pushNotifications: false,
      },
    },
  };

  const result = buildRequestBody(input);

  expect(result).toEqual({
    user_profile: {
      personal_info: {
        first_name: 'John',
        last_name: 'Doe',
      },
      account_settings: {
        email_notifications: true,
        push_notifications: false,
      },
    },
  });
});

test('buildRequestBodyで実際のPostCommentOptionsを処理できる', () => {
  const input = {
    message: 'Test comment',
    clientMeta: {
      x: 100,
      y: 200,
    },
    commentId: 'comment-123',
  };

  const result = buildRequestBody(input);

  expect(result).toEqual({
    message: 'Test comment',
    client_meta: {
      x: 100,
      y: 200,
    },
    comment_id: 'comment-123',
  });
});

test('buildRequestBodyでcommentIdがundefinedの場合は除外される', () => {
  const input = {
    message: 'Test comment',
    clientMeta: {
      x: 100,
      y: 200,
    },
    commentId: undefined,
  };

  const result = buildRequestBody(input);

  expect(result).toEqual({
    message: 'Test comment',
    client_meta: {
      x: 100,
      y: 200,
    },
  });
  expect(result).not.toHaveProperty('comment_id');
});

test('buildRequestBodyで文字列値を保持する', () => {
  const input = {
    message: 'Hello World',
    specialChars: '!@#$%^&*()',
    unicode: '日本語テキスト',
  };

  const result = buildRequestBody(input);

  expect(result).toEqual({
    message: 'Hello World',
    special_chars: '!@#$%^&*()',
    unicode: '日本語テキスト',
  });
});

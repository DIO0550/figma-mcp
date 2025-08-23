import { test, expect, vi } from 'vitest';
import { createVersionsApi } from '../index';
import type { HttpClient } from '../../../client';
import type { GetVersionsResponse } from '../../../../types';
import { TestData } from '../../../../constants';

test('createVersionsApi.getVersions - バージョン一覧を取得できる', async () => {
  const mockHttpClient: HttpClient = {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };

  const mockResponse: GetVersionsResponse = {
    versions: [
      {
        id: 'version-1',
        createdAt: '2024-01-01T00:00:00Z',
        label: 'Version 1.0',
        description: 'Initial version',
        user: {
          id: 'user-1',
          handle: 'user1',
          imgUrl: 'https://example.com/user1.png',
          email: 'user1@example.com',
        },
      },
    ],
  };

  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const versionsApi = createVersionsApi(mockHttpClient);
  const result = await versionsApi.getVersions(TestData.FILE_KEY);

  expect(mockHttpClient.get).toHaveBeenCalledWith(
    '/v1/files/test-file-key/versions'
  );
  expect(result).toEqual(mockResponse);
});

test('createVersionsApi.getVersions - 空のバージョン一覧を取得できる', async () => {
  const mockHttpClient: HttpClient = {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };

  const mockResponse: GetVersionsResponse = {
    versions: [],
  };

  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const versionsApi = createVersionsApi(mockHttpClient);
  const result = await versionsApi.getVersions(TestData.FILE_KEY);

  expect(result.versions).toHaveLength(0);
});

test('createVersionsApi.getVersions - 複数のバージョンを正しく取得できる', async () => {
  const mockHttpClient: HttpClient = {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };

  const mockResponse: GetVersionsResponse = {
    versions: [
      {
        id: 'version-3',
        createdAt: '2024-01-03T00:00:00Z',
        label: 'Version 3.0',
        description: 'Latest version',
        user: {
          id: 'user-1',
          handle: 'user1',
          imgUrl: 'https://example.com/user1.png',
          email: 'user1@example.com',
        },
      },
      {
        id: 'version-2',
        createdAt: '2024-01-02T00:00:00Z',
        label: 'Version 2.0',
        description: 'Updated version',
        user: {
          id: 'user-2',
          handle: 'user2',
          imgUrl: 'https://example.com/user2.png',
          email: 'user2@example.com',
        },
      },
      {
        id: 'version-1',
        createdAt: '2024-01-01T00:00:00Z',
        label: 'Version 1.0',
        description: 'Initial version',
        user: {
          id: 'user-1',
          handle: 'user1',
          imgUrl: 'https://example.com/user1.png',
          email: 'user1@example.com',
        },
      },
    ],
  };

  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const versionsApi = createVersionsApi(mockHttpClient);
  const result = await versionsApi.getVersions(TestData.FILE_KEY);

  expect(result.versions).toHaveLength(3);
  expect(result.versions[0].id).toBe('version-3');
  expect(result.versions[1].id).toBe('version-2');
  expect(result.versions[2].id).toBe('version-1');
});

test('createVersionsApi.getVersions - ラベルと説明が空文字のバージョンも正しく取得できる', async () => {
  const mockHttpClient: HttpClient = {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };

  const mockResponse: GetVersionsResponse = {
    versions: [
      {
        id: 'version-1',
        createdAt: '2024-01-01T00:00:00Z',
        label: '',
        description: '',
        user: {
          id: 'user-1',
          handle: 'user1',
          imgUrl: 'https://example.com/user1.png',
          email: 'user1@example.com',
        },
      },
    ],
  };

  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const versionsApi = createVersionsApi(mockHttpClient);
  const result = await versionsApi.getVersions(TestData.FILE_KEY);

  expect(result.versions[0].label).toBe('');
  expect(result.versions[0].description).toBe('');
});

test('createVersionsApi.getVersions - HTTPクライアントがエラーをスローした場合、エラーが伝播される', async () => {
  const mockHttpClient: HttpClient = {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };

  const expectedError = new Error('Network error');
  vi.mocked(mockHttpClient.get).mockRejectedValueOnce(expectedError);

  const versionsApi = createVersionsApi(mockHttpClient);

  await expect(versionsApi.getVersions(TestData.FILE_KEY)).rejects.toThrow('Network error');
});

test('createVersionsApi.getVersions - 認証エラーが適切に処理される', async () => {
  const mockHttpClient: HttpClient = {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };

  const authError = new Error('Unauthorized');
  vi.mocked(mockHttpClient.get).mockRejectedValueOnce(authError);

  const versionsApi = createVersionsApi(mockHttpClient);

  await expect(versionsApi.getVersions(TestData.FILE_KEY)).rejects.toThrow('Unauthorized');
});

test('createVersionsApi.getVersions - 特殊文字を含むファイルキーが正しくエンコードされる', async () => {
  const mockHttpClient: HttpClient = {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };

  const mockResponse: GetVersionsResponse = { versions: [] };
  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const versionsApi = createVersionsApi(mockHttpClient);
  const specialFileKey = 'file:key/with-special@chars';
  await versionsApi.getVersions(specialFileKey);

  expect(mockHttpClient.get).toHaveBeenCalledWith(
    '/v1/files/file:key/with-special@chars/versions'
  );
});

test('createVersionsApi.getVersions - 各バージョンのユーザー情報が正しく含まれる', async () => {
  const mockHttpClient: HttpClient = {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };

  const mockResponse: GetVersionsResponse = {
    versions: [
      {
        id: 'version-1',
        createdAt: '2024-01-01T00:00:00Z',
        label: 'Test Version',
        description: 'Test Description',
        user: {
          id: 'user-123',
          handle: 'testuser',
          imgUrl: 'https://example.com/avatar.png',
          email: 'test@example.com',
        },
      },
    ],
  };

  vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

  const versionsApi = createVersionsApi(mockHttpClient);
  const result = await versionsApi.getVersions(TestData.FILE_KEY);

  const user = result.versions[0].user;
  expect(user.id).toBe('user-123');
  expect(user.handle).toBe('testuser');
  expect(user.imgUrl).toBe('https://example.com/avatar.png');
  expect(user.email).toBe('test@example.com');
});

test('createVersionsApi.getVersions - タイムアウトエラーが適切に処理される', async () => {
  const mockHttpClient: HttpClient = {
    get: vi.fn().mockImplementation(() => Promise.resolve()),
    post: vi.fn().mockImplementation(() => Promise.resolve()),
  };

  const timeoutError = new Error('Request timeout');
  vi.mocked(mockHttpClient.get).mockRejectedValueOnce(timeoutError);

  const versionsApi = createVersionsApi(mockHttpClient);

  await expect(versionsApi.getVersions(TestData.FILE_KEY)).rejects.toThrow('Request timeout');
});
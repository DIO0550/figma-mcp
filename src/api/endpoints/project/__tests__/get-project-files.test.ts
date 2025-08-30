import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { HttpClient } from '../../../client.js';
import type { GetProjectFilesApiResponse } from '../../../../types/index.js';
import { getProjectFilesApi } from '../index.js';

describe('getProjectFilesApi', () => {
  let mockClient: HttpClient;

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
    };
  });

  it('プロジェクトのファイル一覧を取得できる', async () => {
    const projectId = 'proj-123';
    const mockResponse: GetProjectFilesApiResponse = {
      files: [
        {
          key: 'file-key-1',
          name: 'Component Library',
          thumbnail_url: 'https://example.com/thumb1.png',
          last_modified: '2024-01-01T00:00:00Z',
        },
        {
          key: 'file-key-2',
          name: 'Icons',
          thumbnail_url: 'https://example.com/thumb2.png',
          last_modified: '2024-01-02T00:00:00Z',
        },
      ],
    };

    vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

    const result = await getProjectFilesApi(mockClient, projectId);

    expect(mockClient.get).toHaveBeenCalledWith(`/v1/projects/${projectId}/files`, undefined);
    expect(result).toEqual(mockResponse);
  });

  it('ブランチデータ付きでファイル一覧を取得できる', async () => {
    const projectId = 'proj-123';
    const options = { branch_data: true };
    const mockResponse: GetProjectFilesApiResponse = {
      files: [
        {
          key: 'file-key-1',
          name: 'Component Library',
          thumbnail_url: 'https://example.com/thumb1.png',
          last_modified: '2024-01-01T00:00:00Z',
          branches: [
            {
              key: 'branch-1',
              name: 'feature-branch',
              thumbnail_url: 'https://example.com/branch-thumb.png',
              last_modified: '2024-01-03T00:00:00Z',
            },
          ],
        },
      ],
    };

    vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

    const result = await getProjectFilesApi(mockClient, projectId, options);

    const expectedParams = new URLSearchParams();
    expectedParams.append('branch_data', 'true');
    expect(mockClient.get).toHaveBeenCalledWith(`/v1/projects/${projectId}/files`, expectedParams);
    expect(result).toEqual(mockResponse);
  });

  it('エラーが発生した場合、エラーをスローする', async () => {
    const projectId = 'proj-123';
    const error = new Error('Network error');

    vi.mocked(mockClient.get).mockRejectedValue(error);

    await expect(getProjectFilesApi(mockClient, projectId)).rejects.toThrow('Network error');
  });
});

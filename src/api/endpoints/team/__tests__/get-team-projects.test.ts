import { test, expect, vi } from 'vitest';
import type { HttpClient } from '../../../client.js';
import type { GetTeamProjectsApiResponse } from '../../../../types/index.js';
import { getTeamProjectsApi } from '../index.js';

test('getTeamProjectsApi: チームのプロジェクト一覧を取得できる', async () => {
  const mockClient: HttpClient = {
    get: vi.fn(),
    post: vi.fn(),
  };

  const teamId = 'team-123';
  const mockResponse: GetTeamProjectsApiResponse = {
    projects: [
      {
        id: 'proj-1',
        name: 'Design System',
      },
      {
        id: 'proj-2',
        name: 'Marketing Site',
      },
    ],
  };

  vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

  const result = await getTeamProjectsApi(mockClient, teamId);

  expect(mockClient.get).toHaveBeenCalledWith(`/v1/teams/${teamId}/projects`);
  expect(result).toEqual(mockResponse);
});

test('getTeamProjectsApi: エラーが発生した場合、エラーをスローする', async () => {
  const mockClient: HttpClient = {
    get: vi.fn(),
    post: vi.fn(),
  };

  const teamId = 'team-123';
  const error = new Error('Network error');

  vi.mocked(mockClient.get).mockRejectedValue(error);

  await expect(getTeamProjectsApi(mockClient, teamId)).rejects.toThrow('Network error');
});

// チーム関連のAPI呼び出し関数

import type { HttpClient } from '../../client.js';
import type { GetTeamProjectsApiResponse } from '../../../types/index.js';

export async function getTeamProjectsApi(
  client: HttpClient,
  teamId: string
): Promise<GetTeamProjectsApiResponse> {
  return client.get<GetTeamProjectsApiResponse>(`/v1/teams/${teamId}/projects`);
}

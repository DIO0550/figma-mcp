// チーム関連のAPI呼び出し関数

import type { HttpClient } from '../../client/client.js';

// API Response
export interface GetTeamProjectsApiResponse {
  projects: Array<{
    id: string;
    name: string;
  }>;
}

export async function getTeamProjectsApi(
  client: HttpClient,
  teamId: string
): Promise<GetTeamProjectsApiResponse> {
  return await client.get<GetTeamProjectsApiResponse>(`/v1/teams/${teamId}/projects`);
}

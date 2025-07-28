// チーム・プロジェクト関連のAPI関数

import type { HttpClient } from '../client.js';
import type { GetTeamProjectsResponse, GetProjectFilesResponse } from '../../types/index.js';

export interface TeamsApi {
  getTeamProjects: (teamId: string) => Promise<GetTeamProjectsResponse>;
  getProjectFiles: (projectId: string) => Promise<GetProjectFilesResponse>;
}

export function createTeamsApi(client: HttpClient): TeamsApi {
  return {
    getTeamProjects: async (teamId: string): Promise<GetTeamProjectsResponse> => {
      return client.get<GetTeamProjectsResponse>(`/v1/teams/${teamId}/projects`);
    },

    getProjectFiles: async (projectId: string): Promise<GetProjectFilesResponse> => {
      return client.get<GetProjectFilesResponse>(`/v1/projects/${projectId}/files`);
    },
  };
}

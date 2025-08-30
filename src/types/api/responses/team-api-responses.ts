// チーム関連のAPIレスポンス型定義

export interface GetTeamProjectsApiResponse {
  projects: Array<{
    id: string;
    name: string;
  }>;
}

// チーム・プロジェクト関連のAPIレスポンス型定義

export interface GetTeamProjectsResponse {
  projects: Array<{
    id: string;
    name: string;
  }>;
}

export interface GetProjectFilesResponse {
  files: Array<{
    key: string;
    name: string;
    thumbnailUrl: string;
    lastModified: string;
  }>;
}

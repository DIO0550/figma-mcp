// プロジェクト関連のAPIレスポンス型定義

export interface GetProjectFilesApiOptions {
  branch_data?: boolean;
}

export interface ProjectFile {
  key: string;
  name: string;
  thumbnail_url: string;
  last_modified: string;
  branches?: Array<{
    key: string;
    name: string;
    thumbnail_url: string;
    last_modified: string;
  }>;
}

export interface GetProjectFilesApiResponse {
  files: ProjectFile[];
}

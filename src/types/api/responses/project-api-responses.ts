// プロジェクト関連のAPIレスポンス型定義

export interface GetProjectFilesApiOptions {
  branchData?: boolean;
}

export interface ProjectFile {
  key: string;
  name: string;
  thumbnailUrl: string;
  lastModified: string;
  branches?: Array<{
    key: string;
    name: string;
    thumbnailUrl: string;
    lastModified: string;
  }>;
}

export interface GetProjectFilesApiResponse {
  files: ProjectFile[];
}

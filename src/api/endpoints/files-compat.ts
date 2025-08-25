// 互換性のためのFilesApiインターフェース
// 新しいAPIは file/ と file-nodes/ にあります

import type { HttpClient } from '../client.js';
import type { FigmaFile, GetFileOptions, GetFileNodesResponse } from '../../types/index.js';
import { getFileApi } from './file/index.js';
import { getFileNodesApi } from './file-nodes/index.js';

// 互換性のためのFilesApiインターフェース
export interface FilesApi {
  getFile: (fileKey: string, options?: GetFileOptions) => Promise<FigmaFile>;
  getFileNodes: (
    fileKey: string,
    ids: string[],
    options?: GetFileOptions
  ) => Promise<GetFileNodesResponse>;
}

// 互換性のためのcreateFilesApi関数
export function createFilesApi(client: HttpClient): FilesApi {
  return {
    getFile: (fileKey: string, options?: GetFileOptions) => getFileApi(client, fileKey, options),
    getFileNodes: (fileKey: string, ids: string[], options?: GetFileOptions) =>
      getFileNodesApi(client, fileKey, ids, options),
  };
}

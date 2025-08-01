import type { FigmaApiClient } from '../../api/figma-api-client.js';
import type { FilesApi } from '../../api/endpoints/files.js';
import type { FileTools } from './types.js';
import { createGetFileTool } from './info.js';
import { createGetFileNodesTool } from './nodes.js';

export function createFileTools(apiClient: FigmaApiClient): FileTools {
  const filesApi: FilesApi = apiClient.files;

  return {
    getFile: createGetFileTool(filesApi),
    getFileNodes: createGetFileNodesTool(filesApi),
  };
}

export type { FigmaTool, FileTools } from './types.js';

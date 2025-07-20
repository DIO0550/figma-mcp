import type { FigmaApiClient } from '../../api/figma-api-client.js';
import type { FilesApi } from '../../api/endpoints/files.js';
import type { FileToolsResult } from './types.js';
import { createGetFileTool } from './get-file.js';
import { createGetFileNodesTool } from './get-file-nodes.js';

export function createFileTools(apiClient: FigmaApiClient): FileToolsResult {
  const filesApi: FilesApi = apiClient.files;
  
  return {
    get_file: createGetFileTool(filesApi),
    get_file_nodes: createGetFileNodesTool(filesApi),
  };
}

export type { ToolWithHandler, FileToolsResult } from './types.js';
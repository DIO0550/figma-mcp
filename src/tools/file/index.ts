import type { FigmaApiClient } from '../../api/figma-api-client.js';
import type { FilesApi } from '../../api/endpoints/files.js';
import type { FileTools } from './types.js';
import { GetFileTool as GetFileToolCompanion, GetFileToolDefinition } from './info.js';
import { GetFileNodesTool as GetFileNodesToolCompanion, GetFileNodesToolDefinition } from './nodes.js';

export function createFileTools(apiClient: FigmaApiClient): FileTools {
  const filesApi: FilesApi = apiClient.files;

  const getFileTool = GetFileToolCompanion.from(filesApi);
  const getFileNodesTool = GetFileNodesToolCompanion.from(filesApi);

  return {
    getFile: {
      ...GetFileToolDefinition,
      execute: (args) => GetFileToolCompanion.execute(getFileTool, args),
    },
    getFileNodes: {
      ...GetFileNodesToolDefinition,
      execute: (args) => GetFileNodesToolCompanion.execute(getFileNodesTool, args),
    },
  };
}

export type { FigmaTool, FileTools } from './types.js';
export { GetFileTool, GetFileToolDefinition } from './info.js';
export { GetFileNodesTool, GetFileNodesToolDefinition } from './nodes.js';

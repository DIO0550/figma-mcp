export {
  FigmaApiClient,
  createFigmaApiClient,
  createFigmaApiClientFromContext,
  createFigmaApiClientFromEnv,
  createFigmaApiClientWithHeaders,
  getFile,
  getFileNodes,
  getComponents,
  getComponentSets,
  getStyles,
  exportImages,
  getComments,
  getVersions,
  getTeamProjects,
  getProjectFiles,
} from './figma-api-client.js';

export type {
  FigmaApiClientInterface,
  FigmaApiClient as FigmaApiClientType,
} from './figma-api-client.js';

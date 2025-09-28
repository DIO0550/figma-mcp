import { FigmaContext } from '../context/index.js';
import { createApiConfig } from '../config/api-config.js';
import { createHttpClient } from '../client/client.js';
import { getRuntimeConfig } from '../../config/runtime-config/index.js';
import type { HttpClient } from '../client/client.js';
import type {
  GetFileApiResponse,
  GetFileApiOptions,
  GetFileNodesApiResponse,
  GetFileNodesApiOptions,
  ImageApiOptions,
  ImageApiResponse,
  VersionsApiResponse,
  StylesApiResponse,
  FileComponentSetsApiResponse,
  ComponentApiAnalysis,
} from '../endpoints/index.js';
import type { GetTeamProjectsApiResponse } from '../endpoints/team/index.js';
import type { GetProjectFilesApiResponse } from '../endpoints/project/index.js';
import type { GetFileCommentsApiResponse } from '../endpoints/comments/index.js';
import {
  fileApi,
  fileNodesApi,
  fileVersionsApi,
  fileStylesApi,
  fileCommentsApi,
  fileImagesApi,
} from '../endpoints/index.js';
import { fileComponentsApi, fileComponentSetsApi } from '../endpoints/components/index.js';
import { getTeamProjectsApi } from '../endpoints/team/index.js';
import { getProjectFilesApi } from '../endpoints/project/index.js';

// デフォルト値の定数
const DEFAULT_COMPONENT_ANALYSIS: ComponentApiAnalysis = {
  totalComponents: 0,
  categories: {},
  namingPatterns: {},
  pagesDistribution: {},
  descriptionCoverage: 0,
};

// FigmaApiClient interface
export interface FigmaApiClientInterface {
  readonly context: FigmaContext;
  readonly httpClient: HttpClient;
}

// Factory functions
export function createFigmaApiClient(
  accessToken: string,
  baseUrl?: string
): FigmaApiClientInterface {
  const runtimeConfig = getRuntimeConfig();
  const context = FigmaContext.from(accessToken, { baseUrl: baseUrl || runtimeConfig.baseUrl });
  const config = createApiConfig(context.accessToken, context.baseUrl);
  const httpClient = createHttpClient(config);
  return { context, httpClient };
}

export function createFigmaApiClientFromContext(context: FigmaContext): FigmaApiClientInterface {
  const config = createApiConfig(context.accessToken, context.baseUrl);
  const httpClient = createHttpClient(config);
  return { context, httpClient };
}

export function createFigmaApiClientFromEnv(): FigmaApiClientInterface {
  const accessToken = process.env.FIGMA_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('FIGMA_ACCESS_TOKEN environment variable is required');
  }
  const baseUrl = process.env.FIGMA_BASE_URL;
  return createFigmaApiClient(accessToken, baseUrl);
}

export function createFigmaApiClientWithHeaders(
  client: FigmaApiClientInterface,
  headers: Record<string, string>
): FigmaApiClientInterface {
  const newContext = FigmaContext.withHeaders(client.context, headers);
  return createFigmaApiClientFromContext(newContext);
}

// API operations
export async function getFile(
  client: FigmaApiClientInterface,
  fileKey: string,
  options?: GetFileApiOptions
): Promise<GetFileApiResponse> {
  return await fileApi(client.httpClient, fileKey, options);
}

export async function getFileNodes(
  client: FigmaApiClientInterface,
  fileKey: string,
  ids: string[],
  options?: GetFileNodesApiOptions
): Promise<GetFileNodesApiResponse> {
  return await fileNodesApi(client.httpClient, fileKey, ids, options);
}

export async function getComponents(
  client: FigmaApiClientInterface,
  fileKey: string
): Promise<ComponentApiAnalysis> {
  const response = await fileComponentsApi(client.httpClient, fileKey);
  if (response.analysis) {
    return response.analysis;
  }
  const components = response.meta.components || [];
  return {
    ...DEFAULT_COMPONENT_ANALYSIS,
    totalComponents: components.length,
  };
}

export async function getComponentSets(
  client: FigmaApiClientInterface,
  fileKey: string
): Promise<FileComponentSetsApiResponse> {
  return await fileComponentSetsApi(client.httpClient, fileKey);
}

export async function getStyles(
  client: FigmaApiClientInterface,
  fileKey: string
): Promise<StylesApiResponse> {
  return await fileStylesApi(client.httpClient, fileKey);
}

export async function exportImages(
  client: FigmaApiClientInterface,
  fileKey: string,
  params: ImageApiOptions
): Promise<ImageApiResponse> {
  return await fileImagesApi(client.httpClient, fileKey, params);
}

export async function getComments(
  client: FigmaApiClientInterface,
  fileKey: string
): Promise<GetFileCommentsApiResponse> {
  return await fileCommentsApi(client.httpClient, fileKey);
}

export async function getVersions(
  client: FigmaApiClientInterface,
  fileKey: string
): Promise<VersionsApiResponse> {
  return await fileVersionsApi(client.httpClient, fileKey);
}

export async function getTeamProjects(
  client: FigmaApiClientInterface,
  teamId: string
): Promise<GetTeamProjectsApiResponse> {
  return await getTeamProjectsApi(client.httpClient, teamId);
}

export async function getProjectFiles(
  client: FigmaApiClientInterface,
  projectId: string,
  _options?: Record<string, unknown>
): Promise<GetProjectFilesApiResponse> {
  return await getProjectFilesApi(client.httpClient, projectId);
}

// Namespace export with all functions
export const FigmaApiClient = {
  create: createFigmaApiClient,
  fromContext: createFigmaApiClientFromContext,
  fromEnv: createFigmaApiClientFromEnv,
  withHeaders: createFigmaApiClientWithHeaders,
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
} as const;

export type FigmaApiClient = FigmaApiClientInterface;

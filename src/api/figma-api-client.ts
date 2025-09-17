import { createApiConfig } from './config.js';
import { createHttpClient, type HttpClient } from './client/client.js';
import { getFileApi } from './endpoints/file/index.js';
import { getFileNodesApi } from './endpoints/file-nodes/index.js';
import {
  getNodesApi,
  type GetNodesApiResponse,
  type GetNodesApiOptions,
} from './endpoints/nodes/index.js';
import {
  fileComponentsApi,
  fileComponentSetsApi,
  type FileComponentsApiResponse,
  type FileComponentSetsApiResponse,
} from './endpoints/components/index.js';
import { getStylesApi, type GetStylesApiResponse } from './endpoints/styles/index.js';
import { imagesApi } from './endpoints/images/index.js';
import { getFileCommentsApi, type GetFileCommentsApiResponse } from './endpoints/comments/index.js';
import { getFileVersionsApi } from './endpoints/versions/index.js';
import { getTeamProjectsApi } from './endpoints/team/index.js';
import { getProjectFilesApi } from './endpoints/project/index.js';
import { FigmaContext } from './context.js';
import { getRuntimeConfig } from '../config/runtime-config/runtime-config.js';
import { convertKeysToCamelCase, convertKeysToSnakeCase } from '../utils/case-converter/index.js';
import type { ImageApiResponse, ImageApiOptions } from './endpoints/images/index.js';
import type { GetVersionsApiResponse } from './endpoints/versions/index.js';
import type { GetProjectFilesApiOptions } from './endpoints/project/index.js';
import type { GetFileApiOptions, GetFileApiResponse } from './endpoints/file/index.js';
import type { GetFileNodesApiResponse } from './endpoints/file-nodes/index.js';

/**
 * FigmaApiClientのデータ構造
 * 全てのAPIエンドポイントとコンテキスト情報を含む
 */
export interface FigmaApiClient {
  /** Figma Context */
  readonly context: FigmaContext;
  /** HTTP Client */
  readonly httpClient: HttpClient;
}

/**
 * FigmaApiClientのコンパニオンオブジェクト相当
 */
function create(accessToken: string, baseUrl?: string): FigmaApiClient {
  const runtimeConfig = getRuntimeConfig();
  const effectiveBaseUrl = runtimeConfig.baseUrl || baseUrl || process.env.FIGMA_API_BASE_URL;

  const config = createApiConfig(accessToken, effectiveBaseUrl);
  const httpClient = createHttpClient(config);
  const context = FigmaContext.from(accessToken, { baseUrl: effectiveBaseUrl });

  return {
    context,
    httpClient,
  };
}

function fromContext(context: FigmaContext): FigmaApiClient {
  const config = createApiConfig(context.accessToken, context.baseUrl);
  const httpClient = createHttpClient(config);

  return {
    context,
    httpClient,
  };
}

function fromEnv(): FigmaApiClient {
  const context = FigmaContext.fromEnv();
  return fromContext(context);
}

function withHeaders(client: FigmaApiClient, headers: Record<string, string>): FigmaApiClient {
  const newContext = FigmaContext.withHeaders(client.context, headers);
  return fromContext(newContext);
}

async function getComponents(
  client: FigmaApiClient,
  fileKey: string
): Promise<FileComponentsApiResponse> {
  const response = await fileComponentsApi(client.httpClient, fileKey);
  return convertKeysToCamelCase(response);
}

async function getComponentSets(
  client: FigmaApiClient,
  fileKey: string
): Promise<FileComponentSetsApiResponse> {
  const response = await fileComponentSetsApi(client.httpClient, fileKey);
  return convertKeysToCamelCase(response);
}

async function getStyles(client: FigmaApiClient, fileKey: string): Promise<GetStylesApiResponse> {
  const response = await getStylesApi(client.httpClient, fileKey);
  return convertKeysToCamelCase(response);
}

async function exportImages(
  client: FigmaApiClient,
  fileKey: string,
  options: ImageApiOptions
): Promise<ImageApiResponse> {
  const snakeOptions = convertKeysToSnakeCase(options);
  const response = await imagesApi(client.httpClient, fileKey, snakeOptions);
  return convertKeysToCamelCase(response);
}

async function getComments(
  client: FigmaApiClient,
  fileKey: string
): Promise<GetFileCommentsApiResponse> {
  const response = await getFileCommentsApi(client.httpClient, fileKey);
  return convertKeysToCamelCase(response);
}

async function getVersions(
  client: FigmaApiClient,
  fileKey: string
): Promise<GetVersionsApiResponse> {
  const response = await getFileVersionsApi(client.httpClient, fileKey);
  return convertKeysToCamelCase(response);
}

async function getFile(
  client: FigmaApiClient,
  fileKey: string,
  options?: GetFileApiOptions
): Promise<GetFileApiResponse> {
  const response = await getFileApi(client.httpClient, fileKey, options);
  return convertKeysToCamelCase(response) as GetFileApiResponse;
}

async function getFileNodes(
  client: FigmaApiClient,
  fileKey: string,
  ids: string[],
  options?: GetFileApiOptions
): Promise<GetFileNodesApiResponse> {
  const response = await getFileNodesApi(client.httpClient, fileKey, ids, options);
  return convertKeysToCamelCase(response) as GetFileNodesApiResponse;
}

async function getNodes(
  client: FigmaApiClient,
  fileKey: string,
  options: GetNodesApiOptions
): Promise<GetNodesApiResponse> {
  const snakeOptions = convertKeysToSnakeCase(options);
  const response = await getNodesApi(client.httpClient, fileKey, snakeOptions);
  return convertKeysToCamelCase(response) as GetNodesApiResponse;
}

async function getTeamProjects(
  client: FigmaApiClient,
  teamId: string
): Promise<Record<string, unknown>> {
  const response = await getTeamProjectsApi(client.httpClient, teamId);
  return convertKeysToCamelCase(response);
}

async function getProjectFiles(
  client: FigmaApiClient,
  projectId: string,
  options?: GetProjectFilesApiOptions
): Promise<Record<string, unknown>> {
  const response = await getProjectFilesApi(client.httpClient, projectId, options);
  return convertKeysToCamelCase(response);
}

export const FigmaApiClient = {
  create,
  fromContext,
  fromEnv,
  withHeaders,
  getComponents,
  getComponentSets,
  getStyles,
  exportImages,
  getComments,
  getVersions,
  getFile,
  getFileNodes,
  getNodes,
  getTeamProjects,
  getProjectFiles,
} as const;

/**
 * 新しいFigmaApiClientを作成する
 * @deprecated Use FigmaApiClient.create() instead
 */
export const createFigmaApiClient = FigmaApiClient.create;

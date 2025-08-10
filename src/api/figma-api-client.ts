import { createApiConfig } from './config.js';
import { createHttpClient } from './client.js';
import { createFilesApi, type FilesApi } from './endpoints/files.js';
import { createNodesApi } from './endpoints/nodes.js';
import { createComponentsApi } from './endpoints/components.js';
import { createStylesApi } from './endpoints/styles.js';
import { createImagesApi } from './endpoints/images.js';
import { createCommentsApi } from './endpoints/comments.js';
import { createVersionsApi } from './endpoints/versions.js';
import { createTeamsApi } from './endpoints/teams.js';
import { getRuntimeConfig } from '../config/runtime-config.js';
import { convertKeysToCamelCase, convertKeysToSnakeCase } from '../utils/case-converter.js';
import type { GetComponentsResponse } from '../types/api/responses/component-responses.js';
import type { GetStylesResponse } from '../types/api/responses/style-responses.js';
import type { ExportImageResponse } from '../types/api/responses/image-responses.js';
import type { GetCommentsResponse } from '../types/api/responses/comment-responses.js';
import type { GetVersionsResponse } from '../types/api/responses/version-responses.js';
import type { ExportImageOptions } from '../types/api/options/image-options.js';

interface FigmaApiClientInterface {
  files: FilesApi;
  nodes: ReturnType<typeof createNodesApi>;
  components: ReturnType<typeof createComponentsApi>;
  styles: ReturnType<typeof createStylesApi>;
  images: ReturnType<typeof createImagesApi>;
  comments: ReturnType<typeof createCommentsApi>;
  versions: ReturnType<typeof createVersionsApi>;
  teams: ReturnType<typeof createTeamsApi>;
  reinitialize(): void;
  getComponents(fileKey: string): Promise<GetComponentsResponse>;
  getStyles(fileKey: string): Promise<GetStylesResponse>;
  exportImages(fileKey: string, options: ExportImageOptions): Promise<ExportImageResponse>;
  getComments(fileKey: string): Promise<GetCommentsResponse>;
  getVersions(fileKey: string): Promise<GetVersionsResponse>;
}

export function createFigmaApiClient(accessToken: string, baseUrl?: string): FigmaApiClientInterface {
  let files: FilesApi;
  let nodes: ReturnType<typeof createNodesApi>;
  let components: ReturnType<typeof createComponentsApi>;
  let styles: ReturnType<typeof createStylesApi>;
  let images: ReturnType<typeof createImagesApi>;
  let comments: ReturnType<typeof createCommentsApi>;
  let versions: ReturnType<typeof createVersionsApi>;
  let teams: ReturnType<typeof createTeamsApi>;

  const reinitialize = (): void => {
    const runtimeConfig = getRuntimeConfig();
    const effectiveBaseUrl = runtimeConfig.baseUrl || baseUrl || process.env.FIGMA_API_BASE_URL;

    const config = createApiConfig(accessToken, effectiveBaseUrl);
    const httpClient = createHttpClient(config);

    files = createFilesApi(httpClient);
    nodes = createNodesApi(httpClient);
    components = createComponentsApi(httpClient);
    styles = createStylesApi(httpClient);
    images = createImagesApi(httpClient);
    comments = createCommentsApi(httpClient);
    versions = createVersionsApi(httpClient);
    teams = createTeamsApi(httpClient);
  };

  reinitialize();

  return {
    get files(): FilesApi { return files; },
    get nodes(): ReturnType<typeof createNodesApi> { return nodes; },
    get components(): ReturnType<typeof createComponentsApi> { return components; },
    get styles(): ReturnType<typeof createStylesApi> { return styles; },
    get images(): ReturnType<typeof createImagesApi> { return images; },
    get comments(): ReturnType<typeof createCommentsApi> { return comments; },
    get versions(): ReturnType<typeof createVersionsApi> { return versions; },
    get teams(): ReturnType<typeof createTeamsApi> { return teams; },
    reinitialize,
    async getComponents(fileKey: string): Promise<GetComponentsResponse> {
      const response = await components.getComponents(fileKey);
      return convertKeysToCamelCase(response);
    },
    async getStyles(fileKey: string): Promise<GetStylesResponse> {
      const response = await styles.getStyles(fileKey);
      return convertKeysToCamelCase(response);
    },
    async exportImages(fileKey: string, options: ExportImageOptions): Promise<ExportImageResponse> {
      const snakeOptions = convertKeysToSnakeCase(options);
      const response = await images.exportImages(fileKey, snakeOptions);
      return convertKeysToCamelCase(response);
    },
    async getComments(fileKey: string): Promise<GetCommentsResponse> {
      const response = await comments.getComments(fileKey);
      return convertKeysToCamelCase(response);
    },
    async getVersions(fileKey: string): Promise<GetVersionsResponse> {
      const response = await versions.getVersions(fileKey);
      return convertKeysToCamelCase(response);
    }
  };
}

export type FigmaApiClient = FigmaApiClientInterface;

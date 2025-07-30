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

export class FigmaApiClient {
  public files!: FilesApi;
  public nodes!: ReturnType<typeof createNodesApi>;
  public components!: ReturnType<typeof createComponentsApi>;
  public styles!: ReturnType<typeof createStylesApi>;
  public images!: ReturnType<typeof createImagesApi>;
  public comments!: ReturnType<typeof createCommentsApi>;
  public versions!: ReturnType<typeof createVersionsApi>;
  public teams!: ReturnType<typeof createTeamsApi>;

  private accessToken: string;
  private defaultBaseUrl?: string;

  constructor(accessToken: string, baseUrl?: string) {
    this.accessToken = accessToken;
    this.defaultBaseUrl = baseUrl;
    this.reinitialize();
  }

  public reinitialize(): void {
    // Get runtime config, prioritizing it over constructor-provided baseUrl
    const runtimeConfig = getRuntimeConfig();
    const baseUrl = runtimeConfig.baseUrl || this.defaultBaseUrl;

    const config = createApiConfig(this.accessToken, baseUrl);
    const httpClient = createHttpClient(config);

    this.files = createFilesApi(httpClient);
    this.nodes = createNodesApi(httpClient);
    this.components = createComponentsApi(httpClient);
    this.styles = createStylesApi(httpClient);
    this.images = createImagesApi(httpClient);
    this.comments = createCommentsApi(httpClient);
    this.versions = createVersionsApi(httpClient);
    this.teams = createTeamsApi(httpClient);
  }

  // ツール互換性のためのエイリアスメソッド
  async getComponents(fileKey: string): Promise<GetComponentsResponse> {
    const response = await this.components.getComponents(fileKey);
    return convertKeysToCamelCase(response);
  }

  async getStyles(fileKey: string): Promise<GetStylesResponse> {
    const response = await this.styles.getStyles(fileKey);
    return convertKeysToCamelCase(response);
  }

  async exportImages(fileKey: string, options: ExportImageOptions): Promise<ExportImageResponse> {
    // optionsは既にExportImageOptions (DeepCamelCase<ExportImageOptionsSnake>)型
    // convertKeysToSnakeCaseでスネークケースに戻す
    const snakeOptions = convertKeysToSnakeCase(options);
    const response = await this.images.exportImages(fileKey, snakeOptions);
    return convertKeysToCamelCase(response);
  }

  async getComments(fileKey: string): Promise<GetCommentsResponse> {
    const response = await this.comments.getComments(fileKey);
    return convertKeysToCamelCase(response);
  }

  async getVersions(fileKey: string): Promise<GetVersionsResponse> {
    const response = await this.versions.getVersions(fileKey);
    return convertKeysToCamelCase(response);
  }
}

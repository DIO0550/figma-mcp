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
import type { GetComponentsResponse } from '../types/api/responses/component-responses.js';
import type { GetStylesResponse } from '../types/api/responses/style-responses.js';
import type { ExportImageResponse } from '../types/api/responses/image-responses.js';
import type { GetCommentsResponse } from '../types/api/responses/comment-responses.js';
import type { GetVersionsResponse } from '../types/api/responses/version-responses.js';

export class FigmaApiClient {
  public files: FilesApi;
  public nodes: ReturnType<typeof createNodesApi>;
  public components: ReturnType<typeof createComponentsApi>;
  public styles: ReturnType<typeof createStylesApi>;
  public images: ReturnType<typeof createImagesApi>;
  public comments: ReturnType<typeof createCommentsApi>;
  public versions: ReturnType<typeof createVersionsApi>;
  public teams: ReturnType<typeof createTeamsApi>;

  constructor(accessToken: string, baseUrl?: string) {
    const config = createApiConfig(accessToken, baseUrl);
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
  getComponents(fileKey: string): Promise<GetComponentsResponse> {
    return this.components.getComponents(fileKey);
  }

  getStyles(fileKey: string): Promise<GetStylesResponse> {
    return this.styles.getStyles(fileKey);
  }

  exportImages(fileKey: string, options: Parameters<typeof this.images.exportImages>[1]): Promise<ExportImageResponse> {
    return this.images.exportImages(fileKey, options);
  }

  getComments(fileKey: string): Promise<GetCommentsResponse> {
    return this.comments.getComments(fileKey);
  }

  getVersions(fileKey: string): Promise<GetVersionsResponse> {
    return this.versions.getVersions(fileKey);
  }
}
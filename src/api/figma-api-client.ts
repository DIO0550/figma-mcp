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
}
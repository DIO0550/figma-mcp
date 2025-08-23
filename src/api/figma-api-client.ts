import { createApiConfig } from './config.js';
import { createHttpClient, type HttpClient } from './client.js';
import { createFilesApi, type FilesApi } from './endpoints/files/index.js';
import { createNodesApi } from './endpoints/nodes/index.js';
import { createComponentsApi } from './endpoints/components/index.js';
import { createStylesApi } from './endpoints/styles/index.js';
import { createImagesApi } from './endpoints/images/index.js';
import { createCommentsApi } from './endpoints/comments/index.js';
import { createVersionsApi } from './endpoints/versions/index.js';
import { createTeamsApi } from './endpoints/teams/index.js';
import { FigmaContext } from './context.js';
import { getRuntimeConfig } from '../config/runtime-config/runtime-config.js';
import { convertKeysToCamelCase, convertKeysToSnakeCase } from '../utils/case-converter.js';
import type { GetComponentsResponse } from '../types/api/responses/component-responses.js';
import type { GetStylesResponse } from '../types/api/responses/style-responses.js';
import type { ExportImageResponse } from '../types/api/responses/image-responses.js';
import type { GetCommentsResponse } from '../types/api/responses/comment-responses.js';
import type { GetVersionsResponse } from '../types/api/responses/version-responses.js';
import type { ExportImageOptions } from '../types/api/options/image-options.js';

/**
 * FigmaApiClientのデータ構造
 * 全てのAPIエンドポイントとコンテキスト情報を含む
 */
export interface FigmaApiClient {
  /** Figma Context */
  readonly context: FigmaContext;
  /** HTTP Client */
  readonly httpClient: HttpClient;
  /** Files API endpoint */
  readonly files: FilesApi;
  /** Nodes API endpoint */
  readonly nodes: ReturnType<typeof createNodesApi>;
  /** Components API endpoint */
  readonly components: ReturnType<typeof createComponentsApi>;
  /** Styles API endpoint */
  readonly styles: ReturnType<typeof createStylesApi>;
  /** Images API endpoint */
  readonly images: ReturnType<typeof createImagesApi>;
  /** Comments API endpoint */
  readonly comments: ReturnType<typeof createCommentsApi>;
  /** Versions API endpoint */
  readonly versions: ReturnType<typeof createVersionsApi>;
  /** Teams API endpoint */
  readonly teams: ReturnType<typeof createTeamsApi>;
}

/**
 * FigmaApiClientのコンパニオンオブジェクト
 * APIクライアントの作成と操作のための純粋関数を提供
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace FigmaApiClient {
  /**
   * アクセストークンから新しいFigmaApiClientを作成
   */
  export function create(accessToken: string, baseUrl?: string): FigmaApiClient {
    const runtimeConfig = getRuntimeConfig();
    const effectiveBaseUrl = runtimeConfig.baseUrl || baseUrl || process.env.FIGMA_API_BASE_URL;
    
    const config = createApiConfig(accessToken, effectiveBaseUrl);
    const httpClient = createHttpClient(config);
    const context = FigmaContext.from(accessToken, { baseUrl: effectiveBaseUrl });
    
    return {
      context,
      httpClient,
      files: createFilesApi(httpClient),
      nodes: createNodesApi(httpClient),
      components: createComponentsApi(httpClient),
      styles: createStylesApi(httpClient),
      images: createImagesApi(httpClient),
      comments: createCommentsApi(httpClient),
      versions: createVersionsApi(httpClient),
      teams: createTeamsApi(httpClient),
    };
  }

  /**
   * FigmaContextから新しいFigmaApiClientを作成
   */
  export function fromContext(context: FigmaContext): FigmaApiClient {
    const config = createApiConfig(context.accessToken, context.baseUrl);
    const httpClient = createHttpClient(config);
    
    return {
      context,
      httpClient,
      files: createFilesApi(httpClient),
      nodes: createNodesApi(httpClient),
      components: createComponentsApi(httpClient),
      styles: createStylesApi(httpClient),
      images: createImagesApi(httpClient),
      comments: createCommentsApi(httpClient),
      versions: createVersionsApi(httpClient),
      teams: createTeamsApi(httpClient),
    };
  }

  /**
   * 環境変数から新しいFigmaApiClientを作成
   */
  export function fromEnv(): FigmaApiClient {
    const context = FigmaContext.fromEnv();
    return fromContext(context);
  }

  /**
   * カスタムヘッダーを追加した新しいクライアントを作成
   */
  export function withHeaders(
    client: FigmaApiClient,
    headers: Record<string, string>
  ): FigmaApiClient {
    const newContext = FigmaContext.withHeaders(client.context, headers);
    return fromContext(newContext);
  }

  /**
   * コンポーネント一覧を取得（キャメルケース変換付き）
   */
  export async function getComponents(
    client: FigmaApiClient,
    fileKey: string
  ): Promise<GetComponentsResponse> {
    const response = await client.components.getComponents(fileKey);
    return convertKeysToCamelCase(response);
  }

  /**
   * スタイル一覧を取得（キャメルケース変換付き）
   */
  export async function getStyles(
    client: FigmaApiClient,
    fileKey: string
  ): Promise<GetStylesResponse> {
    const response = await client.styles.getStyles(fileKey);
    return convertKeysToCamelCase(response);
  }

  /**
   * 画像をエクスポート（キャメルケース変換付き）
   */
  export async function exportImages(
    client: FigmaApiClient,
    fileKey: string,
    options: ExportImageOptions
  ): Promise<ExportImageResponse> {
    const snakeOptions = convertKeysToSnakeCase(options);
    const response = await client.images.exportImages(fileKey, snakeOptions);
    return convertKeysToCamelCase(response);
  }

  /**
   * コメント一覧を取得（キャメルケース変換付き）
   */
  export async function getComments(
    client: FigmaApiClient,
    fileKey: string
  ): Promise<GetCommentsResponse> {
    const response = await client.comments.getComments(fileKey);
    return convertKeysToCamelCase(response);
  }

  /**
   * バージョン一覧を取得（キャメルケース変換付き）
   */
  export async function getVersions(
    client: FigmaApiClient,
    fileKey: string
  ): Promise<GetVersionsResponse> {
    const response = await client.versions.getVersions(fileKey);
    return convertKeysToCamelCase(response);
  }
}

/**
 * 新しいFigmaApiClientを作成する
 * @deprecated Use FigmaApiClient.create() instead
 */
export const createFigmaApiClient = FigmaApiClient.create;
import { createApiConfig } from './config.js';
import { createHttpClient, type HttpClient } from './client.js';
import { getFileApi } from './endpoints/file/index.js';
import { getFileNodesApi } from './endpoints/file-nodes/index.js';
import { getNodesApi } from './endpoints/nodes/index.js';
import { fileComponentsApi, fileComponentSetsApi } from './endpoints/components/index.js';
import { createStylesApi } from './endpoints/styles/index.js';
import { imagesApi } from './endpoints/images/index.js';
import { getFileCommentsApi } from './endpoints/comments/index.js';
import { createVersionsApi } from './endpoints/versions/index.js';
import { createTeamsApi } from './endpoints/teams/index.js';
import { FigmaContext } from './context.js';
import { getRuntimeConfig } from '../config/runtime-config/runtime-config.js';
import { convertKeysToCamelCase, convertKeysToSnakeCase } from '../utils/case-converter.js';
import type {
  FileComponentsApiResponse,
  FileComponentSetsApiResponse,
} from '../types/api/responses/component-responses.js';
import type { GetStylesResponse } from '../types/api/responses/style-responses.js';
import type { ImageApiResponse } from '../types/api/responses/image-responses.js';
import type { GetFileCommentsApiResponse } from '../types/api/responses/comment-responses.js';
import type { GetVersionsResponse } from '../types/api/responses/version-responses.js';
import type { ImageApiOptions } from '../types/api/options/image-options.js';
import type {
  FigmaFile,
  GetFileOptions,
  GetFileNodesResponse,
  GetNodesResponse,
  GetNodesOptions,
} from '../types/index.js';

/**
 * FigmaApiClientのデータ構造
 * 全てのAPIエンドポイントとコンテキスト情報を含む
 */
export interface FigmaApiClient {
  /** Figma Context */
  readonly context: FigmaContext;
  /** HTTP Client */
  readonly httpClient: HttpClient;
  /** Styles API endpoint */
  readonly styles: ReturnType<typeof createStylesApi>;
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
      styles: createStylesApi(httpClient),
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
      styles: createStylesApi(httpClient),
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
  ): Promise<FileComponentsApiResponse> {
    const response = await fileComponentsApi(client.httpClient, fileKey);
    return convertKeysToCamelCase(response);
  }

  /**
   * コンポーネントセット一覧を取得（キャメルケース変換付き）
   */
  export async function getComponentSets(
    client: FigmaApiClient,
    fileKey: string
  ): Promise<FileComponentSetsApiResponse> {
    const response = await fileComponentSetsApi(client.httpClient, fileKey);
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
    options: ImageApiOptions
  ): Promise<ImageApiResponse> {
    const snakeOptions = convertKeysToSnakeCase(options);
    const response = await imagesApi(client.httpClient, fileKey, snakeOptions);
    return convertKeysToCamelCase(response);
  }

  /**
   * コメント一覧を取得（キャメルケース変換付き）
   */
  export async function getComments(
    client: FigmaApiClient,
    fileKey: string
  ): Promise<GetFileCommentsApiResponse> {
    const response = await getFileCommentsApi(client.httpClient, fileKey);
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

  /**
   * ファイル情報を取得（キャメルケース変換付き）
   */
  export async function getFile(
    client: FigmaApiClient,
    fileKey: string,
    options?: GetFileOptions
  ): Promise<FigmaFile> {
    const response = await getFileApi(client.httpClient, fileKey, options);
    return convertKeysToCamelCase(response) as FigmaFile;
  }

  /**
   * ファイルノード情報を取得（キャメルケース変換付き）
   */
  export async function getFileNodes(
    client: FigmaApiClient,
    fileKey: string,
    ids: string[],
    options?: GetFileOptions
  ): Promise<GetFileNodesResponse> {
    const response = await getFileNodesApi(client.httpClient, fileKey, ids, options);
    return convertKeysToCamelCase(response) as GetFileNodesResponse;
  }

  /**
   * ノード情報を取得（キャメルケース変換付き）
   */
  export async function getNodes(
    client: FigmaApiClient,
    fileKey: string,
    options: GetNodesOptions
  ): Promise<GetNodesResponse> {
    const snakeOptions = convertKeysToSnakeCase(options);
    const response = await getNodesApi(client.httpClient, fileKey, snakeOptions);
    return convertKeysToCamelCase(response) as GetNodesResponse;
  }
}

/**
 * 新しいFigmaApiClientを作成する
 * @deprecated Use FigmaApiClient.create() instead
 */
export const createFigmaApiClient = FigmaApiClient.create;

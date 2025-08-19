import { FigmaApiClient } from '../../api/figma-api-client.js';
import type { GetVersionsResponse } from '../../types/api/responses/version-responses.js';
import { GetVersionsArgsSchema, type GetVersionsArgs } from './get-versions-args.js';
import { JsonSchema, type McpToolDefinition } from '../types.js';

/**
 * バージョン取得ツールの定義（定数オブジェクト）
 */
export const GetVersionsToolDefinition = {
  name: 'get_versions' as const,
  description: 'Get version history of a Figma file with optional details',
  inputSchema: JsonSchema.from(GetVersionsArgsSchema),
} as const satisfies McpToolDefinition;

/**
 * ツールインスタンス（apiClientを保持）
 */
export interface GetVersionsTool {
  readonly apiClient: FigmaApiClient;
}

/**
 * バージョン取得ツールのコンパニオンオブジェクト（関数群）
 */
export const GetVersionsTool = {
  /**
   * apiClientからツールインスタンスを作成
   * @param apiClient - Figma APIクライアント
   * @returns GetVersionsToolインスタンス
   */
  from(apiClient: FigmaApiClient): GetVersionsTool {
    return { apiClient };
  },

  /**
   * バージョン取得を実行
   * @param tool - GetVersionsToolインスタンス
   * @param args - バージョン取得の引数（fileKeyを含む）
   * @returns バージョン一覧のレスポンス
   */
  async execute(tool: GetVersionsTool, args: GetVersionsArgs): Promise<GetVersionsResponse> {
    return FigmaApiClient.getVersions(tool.apiClient, args.fileKey);
  },
};


import { FigmaApiClient } from '../../api/figma-api-client.js';
import type { GetStylesResponse } from '../../types/api/responses/style-responses.js';
import { GetStylesArgsSchema, type GetStylesArgs } from './get-styles-args.js';
import { JsonSchema, type McpToolDefinition } from '../types.js';
import { Style } from '../../models/style/style.js';

/**
 * スタイル取得ツールの定義（定数オブジェクト）
 */
export const GetStylesToolDefinition = {
  name: 'get_styles' as const,
  description: 'Get styles from a Figma file with optional categorization',
  inputSchema: JsonSchema.from(GetStylesArgsSchema),
} as const satisfies McpToolDefinition;

/**
 * ツールインスタンス（apiClientを保持）
 */
export interface GetStylesTool {
  readonly apiClient: FigmaApiClient;
}

/**
 * スタイル取得ツールのコンパニオンオブジェクト（関数群）
 */
export const GetStylesTool = {
  /**
   * apiClientからツールインスタンスを作成
   */
  from(apiClient: FigmaApiClient): GetStylesTool {
    return { apiClient };
  },

  /**
   * スタイル取得を実行
   */
  async execute(tool: GetStylesTool, args: GetStylesArgs): Promise<GetStylesResponse> {
    const response = await FigmaApiClient.getStyles(tool.apiClient, args.fileKey);

    if (args.categorize && response.meta.styles.length > 0) {
      const { categorized, statistics } = Style.categorize(response.meta.styles);
      return {
        ...response,
        categorized,
        statistics,
      };
    }

    return response;
  },
} as const;

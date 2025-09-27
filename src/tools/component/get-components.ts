import { FigmaApiClient } from '../../api/figma-api-client/index.js';
import type { FigmaApiClientInterface } from '../../api/figma-api-client/index.js';
import type { FileComponentsApiResponse } from '../../api/endpoints/components/index.js';
import { GetComponentsArgsSchema, type GetComponentsArgs } from './get-components-args.js';
import { JsonSchema, type McpToolDefinition } from '../types.js';

/**
 * コンポーネントツールの定義（定数オブジェクト）
 */
export const GetComponentsToolDefinition = {
  name: 'get_components' as const,
  description: 'Get components from a Figma file with optional metadata analysis',
  inputSchema: JsonSchema.from(GetComponentsArgsSchema),
} as const satisfies McpToolDefinition;

/**
 * ツールインスタンス（apiClientを保持）
 */
export interface GetComponentsTool {
  readonly apiClient: FigmaApiClientInterface;
}

/**
 * コンポーネントツールのコンパニオンオブジェクト（関数群）
 */
export const GetComponentsTool = {
  /**
   * apiClientからツールインスタンスを作成
   */
  from(apiClient: FigmaApiClientInterface): GetComponentsTool {
    return { apiClient };
  },

  /**
   * コンポーネント取得を実行
   */
  async execute(
    tool: GetComponentsTool,
    args: GetComponentsArgs
  ): Promise<FileComponentsApiResponse> {
    const analysis = await FigmaApiClient.getComponents(tool.apiClient, args.fileKey);

    // ComponentApiAnalysisをFileComponentsApiResponseに変換
    const result: FileComponentsApiResponse = {
      meta: {
        components: [], // 実際のコンポーネントデータは別途取得が必要
      },
    };

    if (args.analyzeMetadata) {
      result.analysis = analysis;
    }

    // 注: organizeVariantsオプションを使用する場合は、
    // 実際のコンポーネントデータが必要なため、別のAPIを呼び出す必要があります

    return result;
  },
} as const;

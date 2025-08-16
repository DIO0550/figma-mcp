import { FigmaApiClient } from '../../api/figma-api-client.js';
import type { GetComponentsResponse } from '../../types/api/responses/component-responses.js';
import { Component } from '../../models/component/index.js';
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
  readonly apiClient: FigmaApiClient;
}

/**
 * コンポーネントツールのコンパニオンオブジェクト（関数群）
 */
export const GetComponentsTool = {
  /**
   * apiClientからツールインスタンスを作成
   */
  from(apiClient: FigmaApiClient): GetComponentsTool {
    return { apiClient };
  },

  /**
   * コンポーネント取得を実行
   */
  async execute(
    tool: GetComponentsTool,
    args: GetComponentsArgs
  ): Promise<GetComponentsResponse> {
    const response = await FigmaApiClient.getComponents(tool.apiClient, args.fileKey);
    const result = { ...response };

    if (args.analyzeMetadata && response.meta.components.length > 0) {
      result.analysis = Component.analyze(response.meta.components);
    }

    if (args.organizeVariants && response.meta.components.length > 0) {
      result.variantSets = Component.organizeVariants(response.meta.components);
    }

    return result;
  },
} as const;

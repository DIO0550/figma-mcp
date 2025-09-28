import type { FigmaApiClientInterface } from '../../api/figma-api-client/index.js';
import {
  fileComponentsApi,
  type FileComponentsApiResponse,
} from '../../api/endpoints/components/index.js';
// 分析は既存レスポンスから算出して追加する（重複API呼び出しを回避）
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
    // APIから実際のコンポーネントデータを取得
    const response = await fileComponentsApi(tool.apiClient.httpClient, args.fileKey);

    // analyzeMetadataオプションが有効な場合、取得済みデータから分析を生成
    if (args.analyzeMetadata) {
      const components = response.meta.components;
      response.analysis = Component.analyze(components);
    }

    // organizeVariantsオプションが有効な場合、バリアント情報を整理
    if (args.organizeVariants && response.meta.components.length > 0) {
      response.variantSets = Component.organizeVariants(response.meta.components);
    }

    return response;
  },
} as const;

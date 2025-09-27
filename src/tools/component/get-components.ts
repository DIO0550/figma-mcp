import type { FigmaApiClientInterface } from '../../api/figma-api-client/index.js';
import {
  fileComponentsApi,
  type FileComponentsApiResponse,
} from '../../api/endpoints/components/index.js';
import { getComponents } from '../../api/figma-api-client/index.js';
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

    // analyzeMetadataオプションが有効な場合、分析情報を追加
    if (args.analyzeMetadata) {
      const analysis = await getComponents(tool.apiClient, args.fileKey);
      response.analysis = analysis;
    }

    // organizeVariantsオプションが有効な場合、バリアント情報を整理
    if (args.organizeVariants && response.meta.components.length > 0) {
      // TODO: バリアント情報を整理するロジックを実装
      response.variantSets = {};
    }

    return response;
  },
} as const;

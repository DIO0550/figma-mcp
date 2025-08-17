import type { GetFileOptions } from '../../types/index.js';
import type { FigmaApiClient } from '../../api/figma-api-client.js';
import type { NodeEntry, FileNodesResponse } from './types.js';
import type { McpToolDefinition } from '../types.js';
import { GetFileNodesArgsSchema, type GetFileNodesArgs } from './get-file-nodes-args.js';
import { JsonSchema } from '../types.js';

/**
 * GetFileNodesツールの定義（定数オブジェクト）
 */
export const GetFileNodesToolDefinition = {
  name: 'get_file_nodes' as const,
  description: 'Get specific nodes from a Figma file with optional depth and geometry',
  inputSchema: JsonSchema.from(GetFileNodesArgsSchema),
} as const satisfies McpToolDefinition;

/**
 * ツールインスタンス（apiClientを保持）
 */
export interface GetFileNodesTool {
  readonly apiClient: FigmaApiClient;
}

/**
 * GetFileNodesツールのコンパニオンオブジェクト（関数群）
 */
export const GetFileNodesTool = {
  /**
   * apiClientからツールインスタンスを作成
   */
  from(apiClient: FigmaApiClient): GetFileNodesTool {
    return { apiClient };
  },

  /**
   * ノード情報取得を実行
   */
  async execute(
    tool: GetFileNodesTool,
    args: GetFileNodesArgs
  ): Promise<FileNodesResponse> {
    const options: GetFileOptions = {
      depth: args.depth,
      geometry: args.geometry,
      branchData: args.branch_data,
      version: args.version,
      pluginData: args.plugin_data,
    };

    // Remove undefined values
    Object.keys(options).forEach((key) => {
      if (options[key as keyof GetFileOptions] === undefined) {
        delete options[key as keyof GetFileOptions];
      }
    });

    const response = await tool.apiClient.files.getFileNodes(args.file_key, args.ids, options);
    const nodeEntries = Object.entries(response.nodes || {}) as NodeEntry[];
    const nodes = nodeEntries.map(([nodeId, nodeData]) => ({
      ...nodeData.document,
      id: nodeId,
    }));

    return {
      name: response.name,
      lastModified: response.lastModified,
      version: response.version,
      nodes,
    };
  },
} as const;

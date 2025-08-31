import type { GetFileApiOptions } from '../../api/endpoints/file/index.js';
import { FigmaApiClient } from '../../api/figma-api-client.js';
import type { FileResponse } from './types.js';
import type { McpToolDefinition } from '../types.js';
import { GetFileArgsSchema, type GetFileArgs } from './get-file-args.js';
import { JsonSchema } from '../types.js';

/**
 * GetFileツールの定義（定数オブジェクト）
 */
export const GetFileToolDefinition = {
  name: 'get_file' as const,
  description: 'Get Figma file information including metadata and structure',
  inputSchema: JsonSchema.from(GetFileArgsSchema),
} as const satisfies McpToolDefinition;

/**
 * ツールインスタンス（apiClientを保持）
 */
export interface GetFileTool {
  readonly apiClient: FigmaApiClient;
}

/**
 * GetFileツールのコンパニオンオブジェクト（関数群）
 */
export const GetFileTool = {
  /**
   * apiClientからツールインスタンスを作成
   */
  from(apiClient: FigmaApiClient): GetFileTool {
    return { apiClient };
  },

  /**
   * ファイル情報取得を実行
   */
  async execute(tool: GetFileTool, args: GetFileArgs): Promise<FileResponse> {
    const options: GetFileApiOptions = {
      branchData: args.branch_data,
      version: args.version,
      pluginData: args.plugin_data,
    };

    // Remove undefined values
    Object.keys(options).forEach((key) => {
      if (options[key as keyof GetFileApiOptions] === undefined) {
        delete options[key as keyof GetFileApiOptions];
      }
    });

    const file = await FigmaApiClient.getFile(tool.apiClient, args.file_key, options);
    const documentChildren = file.document.children || [];
    const pagesCount = documentChildren.filter(
      (child: any) => 'type' in child && child.type === 'CANVAS'
    ).length;

    return {
      name: file.name,
      lastModified: file.lastModified,
      editorType: file.editorType,
      thumbnailUrl: file.thumbnailUrl,
      version: file.version,
      documentName: file.document.name,
      pagesCount,
      componentsCount: Object.keys(file.components || {}).length,
      stylesCount: Object.keys(file.styles || {}).length,
    };
  },
} as const;

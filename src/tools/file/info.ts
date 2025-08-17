import type { GetFileOptions } from '../../types/index.js';
import type { FilesApi } from '../../api/endpoints/files.js';
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
 * ツールインスタンス（filesApiを保持）
 */
export interface GetFileTool {
  readonly filesApi: FilesApi;
}

/**
 * GetFileツールのコンパニオンオブジェクト（関数群）
 */
export const GetFileTool = {
  /**
   * filesApiからツールインスタンスを作成
   */
  from(filesApi: FilesApi): GetFileTool {
    return { filesApi };
  },

  /**
   * ファイル情報取得を実行
   */
  async execute(
    tool: GetFileTool,
    args: GetFileArgs
  ): Promise<FileResponse> {
    const options: GetFileOptions = {
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

    const file = await tool.filesApi.getFile(args.file_key, options);
    const documentChildren = file.document.children || [];
    const pagesCount = documentChildren.filter(
      (child) => 'type' in child && child.type === 'CANVAS'
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

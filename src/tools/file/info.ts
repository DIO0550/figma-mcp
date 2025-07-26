import type { GetFileOptions } from '../../types/index.js';
import type { FilesApi } from '../../api/endpoints/files.js';
import type { GetFileTool, FileResponse } from './types.js';
import type { ToolDefinition } from '../types.js';
import { GetFileArgsSchema, type GetFileArgs } from './get-file-args.js';
import { JsonSchema } from '../types.js';

export function createGetFileTool(filesApi: FilesApi): GetFileTool & ToolDefinition<GetFileArgs, FileResponse> {
  return {
    name: 'get_file',
    description: 'Get Figma file information including metadata and structure',
    inputSchema: JsonSchema.from(GetFileArgsSchema),
    execute: async (args: GetFileArgs): Promise<FileResponse> => {
      const options: GetFileOptions = {
        branch_data: args.branch_data,
        version: args.version,
        plugin_data: args.plugin_data,
      };
      
      // Remove undefined values
      Object.keys(options).forEach(key => {
        if (options[key as keyof GetFileOptions] === undefined) {
          delete options[key as keyof GetFileOptions];
        }
      });
      
      const file = await filesApi.getFile(args.file_key, options);
      const documentChildren = file.document.children || [];
      const pagesCount = documentChildren.filter((child) => 'type' in child && child.type === 'CANVAS').length;

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
  };
}
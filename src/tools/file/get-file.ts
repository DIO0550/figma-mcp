import type { GetFileOptions, FigmaFile } from '../../types/index.js';
import type { FilesApi } from '../../api/endpoints/files.js';
import type { ToolWithHandler } from './types.js';

export function createGetFileTool(filesApi: FilesApi): ToolWithHandler {
  return {
    name: 'get_file',
    description: 'Get Figma file information including metadata and structure',
    inputSchema: {
      type: 'object',
      properties: {
        file_key: {
          type: 'string',
          description: 'The file key of the Figma file',
        },
        branch_data_id: {
          type: 'string',
          description: 'Optional branch ID to get file from a specific branch',
        },
        version: {
          type: 'string',
          description: 'Optional version ID to get a specific version',
        },
        plugin_data: {
          type: 'string',
          description: 'Optional plugin ID to include plugin data',
        },
      },
      required: ['file_key'],
    },
    handler: async (args: Record<string, unknown>) => {
      const file_key = args.file_key as string;
      const options: Record<string, unknown> = {
        branch_data_id: args.branch_data_id,
        version: args.version,
        plugin_data: args.plugin_data,
      };
      // Remove undefined values
      Object.keys(options).forEach(key => {
        if (options[key] === undefined) delete options[key];
      });
      const filePromise: Promise<FigmaFile> = filesApi.getFile(file_key, options as GetFileOptions);
      const file: FigmaFile = await filePromise;

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
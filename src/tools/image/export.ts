import type { FigmaApiClient } from '../../api/figma-api-client.js';
import type { ImageTool } from './types.js';
import type { ExportImagesResponse } from '../../types/api/responses/image-responses.js';
import { ExportImagesArgsSchema, type ExportImagesArgs } from './export-images-args.js';
import { JsonSchema } from '../types.js';

export const createExportImagesTool = (apiClient: FigmaApiClient): ImageTool => {
  return {
    name: 'export_images',
    description: 'Export images from a Figma file',
    inputSchema: JsonSchema.from(ExportImagesArgsSchema),
    execute: async (args: ExportImagesArgs): Promise<ExportImagesResponse> => {
      const { fileKey, ...options } = args;
      return apiClient.exportImages(fileKey, options);
    },
  };
};

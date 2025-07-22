import type { FigmaApiClient } from '../../api/figma-api-client.js';
import type { ExportImagesArgs } from './types.js';
import type { ExportImagesResponse } from '../../types/api/responses/image-responses.js';

export interface ImageTool {
  name: string;
  description: string;
  execute: (args: ExportImagesArgs) => Promise<ExportImagesResponse>;
}

export const createExportImagesTool = (apiClient: FigmaApiClient): ImageTool => {
  return {
    name: 'export_images',
    description: 'Export images from a Figma file',
    execute: async (args: ExportImagesArgs): Promise<ExportImagesResponse> => {
      const { fileKey, ...options } = args;
      return apiClient.exportImages(fileKey, options);
    },
  };
};
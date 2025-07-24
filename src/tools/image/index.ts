import type { FigmaApiClient } from '../../api/figma-api-client.js';
import { createExportImagesTool } from './export.js';
import type { ImageTool } from './export.js';

interface ImageTools {
  exportImages: ImageTool;
}

export const createImageTools = (apiClient: FigmaApiClient): ImageTools => {
  return {
    exportImages: createExportImagesTool(apiClient),
  };
};
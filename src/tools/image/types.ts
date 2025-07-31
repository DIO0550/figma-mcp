import type { ToolDefinition } from '../types.js';
import type { ExportImageResponse } from '../../types/api/responses/image-responses.js';
import type { ExportImagesArgs } from './export-images-args.js';

export interface ImageTool extends ToolDefinition<ExportImagesArgs, ExportImageResponse> {
  name: string;
  description: string;
  execute: (args: ExportImagesArgs) => Promise<ExportImageResponse>;
}

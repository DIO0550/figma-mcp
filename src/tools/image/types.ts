import type { ToolDefinition } from '../types.js';
import type { ExportImagesResponse } from '../../types/api/responses/image-responses.js';
import type { ExportImagesArgs } from './export-images-args.js';

export interface ImageTool extends ToolDefinition<ExportImagesArgs, ExportImagesResponse> {
  name: string;
  description: string;
  execute: (args: ExportImagesArgs) => Promise<ExportImagesResponse>;
}

import { exportImages } from '../../api/figma-api-client/index.js';
import type { FigmaApiClientInterface } from '../../api/figma-api-client/index.js';
import type { ImageApiResponse } from '../../api/endpoints/images/index.js';
import { ExportImagesArgsSchema, type ExportImagesArgs } from './export-images-args.js';
import { JsonSchema, type McpToolDefinition } from '../types.js';

/**
 * 画像エクスポートツールの定義（定数オブジェクト）
 */
export const ExportImagesToolDefinition = {
  name: 'export_images' as const,
  description: 'Export images from a Figma file',
  inputSchema: JsonSchema.from(ExportImagesArgsSchema),
} as const satisfies McpToolDefinition;

/**
 * ツールインスタンス（apiClientを保持）
 */
export interface ExportImagesTool {
  readonly apiClient: FigmaApiClientInterface;
}

/**
 * 画像エクスポートツールのコンパニオンオブジェクト（関数群）
 */
export const ExportImagesTool = {
  /**
   * apiClientからツールインスタンスを作成
   */
  from(apiClient: FigmaApiClientInterface): ExportImagesTool {
    return { apiClient };
  },

  /**
   * 画像エクスポートを実行
   */
  async execute(tool: ExportImagesTool, args: ExportImagesArgs): Promise<ImageApiResponse> {
    const { fileKey, ...options } = args;
    return exportImages(tool.apiClient, fileKey, options);
  },
} as const;

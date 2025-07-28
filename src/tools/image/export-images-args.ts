import { z } from 'zod';

// Zodスキーマ定義
export const ExportImagesArgsSchema = z.object({
  fileKey: z.string().describe('The Figma file key'),
  ids: z.array(z.string()).min(1).describe('Array of node IDs to export'),
  format: z.enum(['jpg', 'png', 'svg', 'pdf']).optional().describe('Export format (default: png)'),
  scale: z.number().min(0.01).max(4).optional().describe('Scale factor for exported images (1-4)'),
});

// 型の自動生成
export type ExportImagesArgs = z.infer<typeof ExportImagesArgsSchema>;

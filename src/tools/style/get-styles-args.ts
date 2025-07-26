import { z } from 'zod';

// Zodスキーマ定義
export const GetStylesArgsSchema = z.object({
  fileKey: z.string().describe('The Figma file key'),
  categorize: z.boolean().optional().describe('Whether to categorize styles by type and hierarchy'),
});

// 型の自動生成
export type GetStylesArgs = z.infer<typeof GetStylesArgsSchema>;
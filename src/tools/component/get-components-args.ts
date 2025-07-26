import { z } from 'zod';

// Zodスキーマ定義
export const GetComponentsArgsSchema = z.object({
  fileKey: z.string().describe('The Figma file key'),
  analyzeMetadata: z.boolean().optional().describe('Whether to analyze component metadata'),
  organizeVariants: z.boolean().optional().describe('Whether to organize components by variant sets'),
});

// 型の自動生成
export type GetComponentsArgs = z.infer<typeof GetComponentsArgsSchema>;
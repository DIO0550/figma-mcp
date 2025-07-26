import { z } from 'zod';

// Zodスキーマ定義
export const GetVersionsArgsSchema = z.object({
  fileKey: z.string().describe('The Figma file key'),
  includeDetails: z.boolean().optional().describe('Include detailed version information'),
  comparePair: z.tuple([z.string(), z.string()]).optional().describe('Compare two version IDs [from, to]'),
});

// 型の自動生成（スキーマと同じ名前）
export type GetVersionsArgs = z.infer<typeof GetVersionsArgsSchema>;
import { z } from 'zod';

// Zodスキーマ定義
export const GetCommentsArgsSchema = z.object({
  fileKey: z.string().describe('The Figma file key'),
  showResolved: z
    .boolean()
    .optional()
    .describe('Whether to include resolved comments (default: true)'),
  userId: z.string().optional().describe('Filter comments by user ID'),
  nodeId: z.string().optional().describe('Filter comments by node ID'),
  organizeThreads: z.boolean().optional().describe('Organize comments into thread structure'),
});

// 型の自動生成
export type GetCommentsArgs = z.infer<typeof GetCommentsArgsSchema>;

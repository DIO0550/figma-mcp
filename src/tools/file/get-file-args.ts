import { z } from 'zod';

// Zodスキーマ定義
export const GetFileArgsSchema = z.object({
  file_key: z.string().describe('The Figma file key'),
  branch_data: z.boolean().optional().describe('Include branch data'),
  version: z.string().optional().describe('Version ID to fetch'),
  plugin_data: z.string().optional().describe('Plugin data to include'),
});

// 型の自動生成
export type GetFileArgs = z.infer<typeof GetFileArgsSchema>;

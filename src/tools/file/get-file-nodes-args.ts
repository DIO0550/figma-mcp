import { z } from 'zod';

// Zodスキーマ定義
export const GetFileNodesArgsSchema = z.object({
  file_key: z.string().describe('The Figma file key'),
  ids: z.array(z.string()).min(1).describe('Array of node IDs to fetch'),
  depth: z.number().optional().describe('Depth of nodes to fetch'),
  geometry: z.string().optional().describe('Geometry type to include'),
  branch_data: z.boolean().optional().describe('Include branch data'),
  version: z.string().optional().describe('Version ID to fetch'),
  plugin_data: z.string().optional().describe('Plugin data to include'),
});

// 型の自動生成
export type GetFileNodesArgs = z.infer<typeof GetFileNodesArgsSchema>;
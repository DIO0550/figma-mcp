import { z } from 'zod';

/**
 * Arguments schema for set_config tool
 */
export const SetConfigArgsSchema = z.object({
  baseUrl: z.string().url().optional().describe('Figma API base URL (e.g., https://api.figma.com)'),
});

export type SetConfigArgs = z.infer<typeof SetConfigArgsSchema>;

import { z } from 'zod';

export const GetVersionsArgsSchema = z.object({
  fileKey: z.string().describe('The Figma file key'),
});

export type GetVersionsArgs = z.infer<typeof GetVersionsArgsSchema>;

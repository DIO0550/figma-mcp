import { z } from 'zod';

export const parseFigmaUrlArgsSchema = z.object({
  url: z.string().describe('Figma URL to parse (e.g., https://www.figma.com/file/ABC123xyz/My-Design-File?node-id=1234-5678)'),
});

export type ParseFigmaUrlArgs = z.infer<typeof parseFigmaUrlArgsSchema>;
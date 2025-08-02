import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { parseFigmaUrl } from './parse-figma-url.js';

export const parseFigmaUrlTool: Tool = {
  name: 'parse_figma_url',
  description: 'Parse a Figma URL to extract file ID, file name, and node ID, then save to local storage',
  inputSchema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'Figma URL to parse (e.g., https://www.figma.com/file/ABC123xyz/My-Design-File?node-id=1234-5678)',
      },
    },
    required: ['url'],
  },
};

export { parseFigmaUrl };
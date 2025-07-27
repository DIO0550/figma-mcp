import { setConfig } from './set.js';
import type { ConfigTool } from './types.js';

/**
 * Creates configuration management tools
 */
export const createConfigTools = (): { setConfig: ConfigTool } => {
  return {
    setConfig: {
      name: 'set_config',
      description: 'Set runtime configuration for Figma MCP server',
      inputSchema: {
        type: 'object',
        properties: {
          baseUrl: {
            type: 'string',
            description: 'Figma API base URL (e.g., https://api.figma.com)',
          },
        },
        required: [],
        additionalProperties: false,
      },
      execute: setConfig,
    },
  };
};

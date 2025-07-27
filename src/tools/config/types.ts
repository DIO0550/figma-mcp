import type { SetConfigArgs } from './set-config-args.js';

/**
 * Configuration tool types
 */
export interface ConfigTool {
  name: string;
  description: string;
  inputSchema: object;
  execute: (args: SetConfigArgs) => Promise<ConfigToolResult>;
}

export interface ConfigToolResult {
  success: boolean;
  config: {
    baseUrl?: string;
  };
  message?: string;
}

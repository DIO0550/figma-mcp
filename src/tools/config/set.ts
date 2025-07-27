import { setRuntimeConfig, getRuntimeConfig } from '../../config/runtime-config.js';
import { Logger } from '../../utils/logger/index.js';
import type { SetConfigArgs } from './set-config-args.js';
import type { ConfigToolResult } from './types.js';

/**
 * Sets runtime configuration for the Figma MCP server
 */
export const setConfig = (args: SetConfigArgs): Promise<ConfigToolResult> => {
  try {
    // Update runtime configuration
    setRuntimeConfig(args);

    const currentConfig = getRuntimeConfig();

    Logger.info('Runtime configuration updated', currentConfig);

    return Promise.resolve({
      success: true,
      config: currentConfig,
      message: 'Configuration updated successfully. Note: The new base URL will be used for new API client instances.',
    });
  } catch (error) {
    Logger.error('Failed to update configuration', { error });

    return Promise.resolve({
      success: false,
      config: getRuntimeConfig(),
      message: `Failed to update configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
};

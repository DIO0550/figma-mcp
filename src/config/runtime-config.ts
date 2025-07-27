/**
 * Runtime configuration management for Figma MCP server
 * Allows dynamic configuration updates during runtime
 */

export interface RuntimeConfig {
  /** Figma API base URL override */
  baseUrl?: string;
  // Future configuration options can be added here
}

// Private configuration store
let runtimeConfig: RuntimeConfig = {};

/**
 * Updates the runtime configuration
 * @param config Partial configuration to merge with existing config
 */
export const setRuntimeConfig = (config: Partial<RuntimeConfig>): void => {
  runtimeConfig = { ...runtimeConfig, ...config };
};

/**
 * Gets the current runtime configuration
 * @returns A copy of the current configuration
 */
export const getRuntimeConfig = (): RuntimeConfig => {
  return { ...runtimeConfig };
};

/**
 * Resets the runtime configuration to empty state
 */
export const resetRuntimeConfig = (): void => {
  runtimeConfig = {};
};

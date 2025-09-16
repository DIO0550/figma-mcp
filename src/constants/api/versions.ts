/**
 * API version constants
 */
export const ApiVersion = {
  /** Current API version */
  V1: 'v1',
} as const;

export type ApiVersionKey = keyof typeof ApiVersion;
export type ApiVersionValue = (typeof ApiVersion)[ApiVersionKey];

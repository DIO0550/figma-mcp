/**
 * URL query parameter names used in Figma URLs and API
 */
export const QueryParams = {
  /** Node ID parameter in Figma URLs */
  NODE_ID: 'node-id',

  /** Version ID parameter */
  VERSION_ID: 'version',

  /** Depth parameter for API requests */
  DEPTH: 'depth',

  /** Geometry parameter for API requests */
  GEOMETRY: 'geometry',

  /** Branch data parameter */
  BRANCH_DATA: 'branch_data',

  /** Plugin data parameter */
  PLUGIN_DATA: 'plugin_data',
} as const;

export type QueryParamKey = keyof typeof QueryParams;
export type QueryParam = (typeof QueryParams)[QueryParamKey];

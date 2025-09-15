/**
 * API resource name constants
 */
export const ApiResource = {
  /** Files resource */
  FILES: 'files',
  /** Images resource */
  IMAGES: 'images',
  /** Nodes sub-resource */
  NODES: 'nodes',
  /** Components sub-resource */
  COMPONENTS: 'components',
  /** Component sets sub-resource */
  COMPONENT_SETS: 'component_sets',
  /** Styles sub-resource */
  STYLES: 'styles',
  /** Comments sub-resource */
  COMMENTS: 'comments',
  /** Versions sub-resource */
  VERSIONS: 'versions',
} as const;

export type ApiResourceKey = keyof typeof ApiResource;
export type ApiResourceValue = (typeof ApiResource)[ApiResourceKey];

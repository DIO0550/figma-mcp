/**
 * Figma API paths using Companion Object Pattern
 * Separates static constants from dynamic path builders
 */

/**
 * Static API base paths
 */
export const ApiPaths = {
  /** Base path for file endpoints */
  FILES: '/v1/files' as const,
  /** Base path for image endpoints */
  IMAGES: '/v1/images' as const,
} as const;

/**
 * Dynamic path builders for API endpoints
 */
export const ApiPath = {
  /** Builds path to access file metadata and content */
  file: (fileKey: string) => `${ApiPaths.FILES}/${fileKey}` as const,

  /** Builds path to access specific nodes in a file */
  fileNodes: (fileKey: string) => `${ApiPaths.FILES}/${fileKey}/nodes` as const,

  /** Builds path to access components in a file */
  fileComponents: (fileKey: string) => `${ApiPaths.FILES}/${fileKey}/components` as const,

  /** Builds path to access component sets in a file */
  fileComponentSets: (fileKey: string) => `${ApiPaths.FILES}/${fileKey}/component_sets` as const,

  /** Builds path to access styles in a file */
  fileStyles: (fileKey: string) => `${ApiPaths.FILES}/${fileKey}/styles` as const,

  /** Builds path to access comments in a file */
  fileComments: (fileKey: string) => `${ApiPaths.FILES}/${fileKey}/comments` as const,

  /** Builds path to access version history of a file */
  fileVersions: (fileKey: string) => `${ApiPaths.FILES}/${fileKey}/versions` as const,

  /** Builds path for exporting file contents as images */
  images: (fileKey: string) => `${ApiPaths.IMAGES}/${fileKey}` as const,
} as const;

// Type exports
export type ApiPathsKey = keyof typeof ApiPaths;
export type ApiPathKey = keyof typeof ApiPath;
export type ApiPathValue = (typeof ApiPaths)[ApiPathsKey];
export type ApiPathFunction = (typeof ApiPath)[ApiPathKey];

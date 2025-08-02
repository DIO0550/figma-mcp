/**
 * Figma API endpoint paths
 */
export const ApiPaths = {
  /** File endpoints */
  FILE: (fileKey: string) => `/v1/files/${fileKey}`,
  FILE_NODES: (fileKey: string) => `/v1/files/${fileKey}/nodes`,
  FILE_COMPONENTS: (fileKey: string) => `/v1/files/${fileKey}/components`,
  FILE_STYLES: (fileKey: string) => `/v1/files/${fileKey}/styles`,
  FILE_COMMENTS: (fileKey: string) => `/v1/files/${fileKey}/comments`,
  FILE_VERSIONS: (fileKey: string) => `/v1/files/${fileKey}/versions`,
  
  /** Image export endpoint */
  IMAGES: (fileKey: string) => `/v1/images/${fileKey}`,
} as const;
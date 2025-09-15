/**
 * Figma-specific error messages and names
 */
export const FigmaErrorMessages = {
  /** Figma URL parser errors */
  NOT_FIGMA_URL: 'Not a Figma URL',
  UNSUPPORTED_FIGMA_URL_PATTERN: 'Unsupported Figma URL pattern',
  INVALID_FIGMA_FILE_ID: 'Invalid file ID',
} as const;

/**
 * Figma error names
 */
export const FigmaErrorNames = {
  FIGMA_ERROR: 'FigmaError',
} as const;

export type FigmaErrorMessageKey = keyof typeof FigmaErrorMessages;
export type FigmaErrorMessage = (typeof FigmaErrorMessages)[FigmaErrorMessageKey];
export type FigmaErrorNameKey = keyof typeof FigmaErrorNames;
export type FigmaErrorName = (typeof FigmaErrorNames)[FigmaErrorNameKey];

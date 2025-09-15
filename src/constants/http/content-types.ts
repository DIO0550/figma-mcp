/**
 * HTTP content type values
 */
export const ContentType = {
  /** JSON content type */
  JSON: 'application/json',
  /** Plain text content type */
  TEXT: 'text/plain',
  /** HTML content type */
  HTML: 'text/html',
  /** Form data content type */
  FORM_DATA: 'multipart/form-data',
  /** URL encoded form content type */
  FORM_URLENCODED: 'application/x-www-form-urlencoded',
} as const;

export type ContentTypeKey = keyof typeof ContentType;
export type ContentTypeValue = (typeof ContentType)[ContentTypeKey];

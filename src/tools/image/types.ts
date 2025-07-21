export interface ExportImagesArgs {
  fileKey: string;
  ids: string[];
  format?: 'jpg' | 'png' | 'svg' | 'pdf';
  scale?: number;
}
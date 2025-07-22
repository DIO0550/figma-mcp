export interface GetVersionsArgs {
  fileKey: string;
  includeDetails?: boolean;
  comparePair?: [string, string]; // [fromVersionId, toVersionId]
}
import type { HttpClient } from '../../client.js';
import type { FigmaFile, GetFileOptions, GetFileNodesResponse } from '../../../types/index.js';

export interface FilesApi {
  getFile: (fileKey: string, options?: GetFileOptions) => Promise<FigmaFile>;
  getFileNodes: (
    fileKey: string,
    ids: string[],
    options?: GetFileOptions
  ) => Promise<GetFileNodesResponse>;
}

export function createFilesApi(client: HttpClient): FilesApi {
  return {
    getFile: async (fileKey: string, options?: GetFileOptions): Promise<FigmaFile> => {
      const params = new URLSearchParams();

      if (options) {
        if (options.version) params.append('version', options.version);
        if (options.ids) params.append('ids', options.ids.join(','));
        if (options.depth !== undefined) params.append('depth', options.depth.toString());
        if (options.geometry) params.append('geometry', options.geometry);
        if (options.pluginData) params.append('plugin_data', options.pluginData);
        if (options.branchData !== undefined)
          params.append('branch_data', options.branchData.toString());
      }

      return client.get<FigmaFile>(`/v1/files/${fileKey}`, params);
    },

    getFileNodes: async (
      fileKey: string,
      ids: string[],
      options?: GetFileOptions
    ): Promise<GetFileNodesResponse> => {
      const params = new URLSearchParams();
      params.append('ids', ids.join(','));

      if (options) {
        if (options.version) params.append('version', options.version);
        if (options.depth !== undefined) params.append('depth', options.depth.toString());
        if (options.geometry) params.append('geometry', options.geometry);
        if (options.pluginData) params.append('plugin_data', options.pluginData);
        if (options.branchData !== undefined)
          params.append('branch_data', options.branchData.toString());
      }

      return client.get<GetFileNodesResponse>(`/v1/files/${fileKey}/nodes`, params);
    },
  };
}

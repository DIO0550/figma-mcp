// ファイル関連のAPI関数

import type { HttpClient } from '../client.js';
import type { FigmaFile, GetFileOptions } from '../../types/index.js';

export interface FilesApi {
  getFile: (fileKey: string, options?: GetFileOptions) => Promise<FigmaFile>;
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
        if (options.plugin_data) params.append('plugin_data', options.plugin_data);
        if (options.branch_data !== undefined) params.append('branch_data', options.branch_data.toString());
      }

      return client.get<FigmaFile>(`/v1/files/${fileKey}`, params);
    },
  };
}
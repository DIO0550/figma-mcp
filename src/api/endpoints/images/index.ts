// 画像エクスポート関連のAPI関数

import type { HttpClient } from '../../client.js';
import type { ExportImageResponse } from '../../../types/index.js';
import type { ExportImageOptions } from '../../../types/api/options/image-options.js';
import type { DeepSnakeCase } from '../../../utils/type-transformers.js';

export interface ImagesApi {
  exportImages: (fileKey: string, options: DeepSnakeCase<ExportImageOptions>) => Promise<ExportImageResponse>;
}

export function createImagesApi(client: HttpClient): ImagesApi {
  return {
    exportImages: async (
      fileKey: string,
      options: DeepSnakeCase<ExportImageOptions>
    ): Promise<ExportImageResponse> => {
      const params = new URLSearchParams();

      params.append('ids', options.ids.join(','));
      if (options.scale) params.append('scale', options.scale.toString());
      if (options.format) params.append('format', options.format);
      if (options.svg_include_id !== undefined) {
        params.append('svg_include_id', options.svg_include_id.toString());
      }
      if (options.svg_simplify_stroke !== undefined) {
        params.append('svg_simplify_stroke', options.svg_simplify_stroke.toString());
      }
      if (options.use_absolute_bounds !== undefined) {
        params.append('use_absolute_bounds', options.use_absolute_bounds.toString());
      }
      if (options.version) params.append('version', options.version);

      return client.get<ExportImageResponse>(`/v1/images/${fileKey}`, params);
    },
  };
}

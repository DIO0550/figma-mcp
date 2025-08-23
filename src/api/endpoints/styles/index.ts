// スタイル関連のAPI関数

import type { HttpClient } from '../../client.js';
import type { GetStylesResponse } from '../../../types/index.js';

export interface StylesApi {
  getStyles: (fileKey: string) => Promise<GetStylesResponse>;
}

export function createStylesApi(client: HttpClient): StylesApi {
  return {
    getStyles: async (fileKey: string): Promise<GetStylesResponse> => {
      return client.get<GetStylesResponse>(`/v1/files/${fileKey}/styles`);
    },
  };
}

// スタイル関連のAPIレスポンス型定義

import type { Style } from '../../figma-types.js';

export interface GetStylesResponse {
  meta: {
    styles: Style[];
  };
}
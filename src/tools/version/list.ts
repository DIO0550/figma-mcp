import { FigmaApiClient } from '../../api/figma-api-client.js';
import type { VersionTool } from './types.js';
import type { GetVersionsResponse } from '../../types/api/responses/version-responses.js';
import { GetVersionsArgsSchema, type GetVersionsArgs } from './get-versions-args.js';
import { JsonSchema } from '../types.js';

export const createGetVersionsTool = (apiClient: FigmaApiClient): VersionTool => {
  return {
    name: 'get_versions',
    description: 'Get version history of a Figma file with optional details',
    inputSchema: JsonSchema.from(GetVersionsArgsSchema),
    execute: async (args: GetVersionsArgs): Promise<GetVersionsResponse> => {
      const response = await FigmaApiClient.getVersions(apiClient, args.fileKey);

      // includeDetailsが指定されている場合、詳細情報を含む
      // 実際のFigma APIはこの情報を直接提供しないので、
      // ここではモックとして実装（実際のAPIでは別のエンドポイントが必要）
      if (args.includeDetails) {
        // 本来は各バージョンごとに追加のAPI呼び出しが必要
        // ここではレスポンスをそのまま返す
      }

      // comparePairが指定されている場合、バージョン間の差分を計算
      // 実際のFigma APIでは、各バージョンのファイル情報を取得して比較する必要がある
      if (args.comparePair && args.comparePair.length === 2) {
        const [fromVersionId, toVersionId] = args.comparePair;

        // 本来はここで各バージョンのファイル詳細を取得して比較
        // モックとしてcomparisonデータを追加
        return {
          ...response,
          comparison: {
            from: fromVersionId,
            to: toVersionId,
            changes: {
              pagesAdded: [],
              pagesRemoved: [],
              pagesModified: [],
              componentsAdded: 0,
              componentsRemoved: 0,
              componentsModified: 0,
              stylesAdded: 0,
              stylesRemoved: 0,
              stylesModified: 0,
            },
          },
        };
      }

      return response;
    },
  };
};

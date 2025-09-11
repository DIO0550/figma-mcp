// 再エクスポート
export { GetStylesTool, GetStylesToolDefinition } from './get-styles.js';
export type { GetStylesArgs } from './get-styles-args.js';
export { Style } from '../../models/style/style.js';
export type { CategorizedStyles } from '../../models/style/style.js';

// 互換性のために残しておく（後で削除予定）
import type { FigmaApiClient } from '../../api/figma-api-client.js';
import { GetStylesTool, GetStylesToolDefinition } from './get-styles.js';
import type { StyleTool } from './types.js';

interface StyleTools {
  getStyles: StyleTool;
}

export const createStyleTools = (apiClient: FigmaApiClient): StyleTools => {
  const tool = GetStylesTool.from(apiClient);
  return {
    getStyles: {
      name: GetStylesToolDefinition.name,
      description: GetStylesToolDefinition.description,
      inputSchema: GetStylesToolDefinition.inputSchema,
      execute: (args) => GetStylesTool.execute(tool, args),
    },
  };
};

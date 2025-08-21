import { parseFigmaUrl as parseUrl } from '../../utils/figma-url-parser.js';
import { setRuntimeConfig } from '../../config/runtime-config/runtime-config.js';
import { ParseFigmaUrlArgsSchema, type ParseFigmaUrlArgs } from './parse-figma-url-args.js';
import { JsonSchema, type McpToolDefinition } from '../types.js';

/**
 * ParseFigmaURLツールの定義（定数オブジェクト）
 */
export const ParseFigmaUrlToolDefinition = {
  name: 'parse_figma_url' as const,
  description:
    'Parse a Figma URL to extract file ID, file name, and node ID, then save to local storage',
  inputSchema: JsonSchema.from(ParseFigmaUrlArgsSchema),
} as const satisfies McpToolDefinition;

/**
 * ツールインスタンス（状態なし）
 */
export interface ParseFigmaUrlTool {}

/**
 * ParseFigmaURLの結果型
 */
interface ParseFigmaUrlResult {
  figmaInfo: {
    fileId: string;
    fileName?: string;
    nodeId?: string;
  };
  message: string;
}

/**
 * ParseFigmaURLツールのコンパニオンオブジェクト（関数群）
 */
export const ParseFigmaUrlTool = {
  /**
   * ツールインスタンスを作成
   */
  create(): ParseFigmaUrlTool {
    return {};
  },

  /**
   * Figma URLをパースして保存
   */
  execute(_tool: ParseFigmaUrlTool, args: ParseFigmaUrlArgs): ParseFigmaUrlResult {
    const { url } = args;

    // URLをパース
    const figmaInfo = parseUrl(url);

    // runtime-configに保存
    setRuntimeConfig({ figmaInfo });

    return {
      figmaInfo,
      message: 'Figma URL parsed and saved successfully',
    };
  },
} as const;

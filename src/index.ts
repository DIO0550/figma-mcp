import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';

import { createFigmaApiClient } from './api/figma-api-client/index.js';
import {
  GetFileTool,
  GetFileToolDefinition,
  GetFileNodesTool,
  GetFileNodesToolDefinition,
} from './tools/file/index.js';
import { GetComponentsTool, GetComponentsToolDefinition } from './tools/component/index.js';
import { GetStylesTool, GetStylesToolDefinition } from './tools/style/index.js';
import { ExportImagesTool, ExportImagesToolDefinition } from './tools/image/index.js';
import { GetCommentsTool, GetCommentsToolDefinition } from './tools/comment/index.js';
import { GetVersionsTool, GetVersionsToolDefinition } from './tools/version/index.js';
import { ParseFigmaUrlTool, ParseFigmaUrlToolDefinition } from './tools/parse-figma-url/index.js';
import { Logger, LogLevel } from './utils/logger/index.js';

import { GetFileArgsSchema, type GetFileArgs } from './tools/file/get-file-args.js';
import { GetFileNodesArgsSchema, type GetFileNodesArgs } from './tools/file/get-file-nodes-args.js';
import {
  GetComponentsArgsSchema,
  type GetComponentsArgs,
} from './tools/component/get-components-args.js';
import { GetStylesArgsSchema, type GetStylesArgs } from './tools/style/get-styles-args.js';
import { ExportImagesArgsSchema, type ExportImagesArgs } from './tools/image/export-images-args.js';
import { GetCommentsArgsSchema, type GetCommentsArgs } from './tools/comment/get-comments-args.js';
import { GetVersionsArgsSchema, type GetVersionsArgs } from './tools/version/get-versions-args.js';
import {
  ParseFigmaUrlArgsSchema,
  type ParseFigmaUrlArgs,
} from './tools/parse-figma-url/parse-figma-url-args.js';

dotenv.config();

const server = new Server(
  {
    name: 'figma-mcp',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ロガーの初期化
function resolveLogLevelFromEnv(envValue: string | undefined): LogLevel {
  if (!envValue) return LogLevel.INFO;

  const key = envValue.trim().toUpperCase();
  // enum のキーにマッチするかを安全に確認
  if (key in LogLevel) {
    const lvl = (LogLevel as unknown as Record<string, LogLevel>)[key];
    if (typeof lvl === 'number') return lvl;
  }

  // Logger 初期化前のため console.warn を使用
  console.warn(
    `Invalid LOG_LEVEL: ${envValue}. Falling back to INFO. Allowed: DEBUG|INFO|WARN|ERROR|OFF`
  );
  return LogLevel.INFO;
}

const logLevel = resolveLogLevelFromEnv(process.env.LOG_LEVEL);
Logger.init({ type: 'mcp', server, level: logLevel });

// APIクライアントの初期化
const accessToken = process.env.FIGMA_ACCESS_TOKEN;
if (!accessToken) {
  Logger.error('FIGMA_ACCESS_TOKEN environment variable is required');
  process.exit(1);
}

// APIクライアントの作成（モック用にベースURLを環境変数から上書き可能）
// FIGMA_API_BASE_URL を優先し、後方互換として FIGMA_BASE_URL も許可
const baseUrlEnv = (process.env.FIGMA_API_BASE_URL || process.env.FIGMA_BASE_URL || '').trim();
const apiClient = createFigmaApiClient(accessToken, baseUrlEnv || undefined);

// ツールの作成
const getFileTool = GetFileTool.from(apiClient);
const getFileNodesTool = GetFileNodesTool.from(apiClient);
const componentTool = GetComponentsTool.from(apiClient);
const getStylesTool = GetStylesTool.from(apiClient);
const exportImagesTool = ExportImagesTool.from(apiClient);
const commentTool = GetCommentsTool.from(apiClient);
const getVersionsTool = GetVersionsTool.from(apiClient);
const parseFigmaUrlTool = ParseFigmaUrlTool.create();

/**
 * 指定されたツール名と引数に基づいてツールを実行します
 * @param name - 実行するツールの名前（ToolDefinition.nameの値）
 * @param args - ツール固有の引数オブジェクト（各ツールのArgsSchemaで検証される）
 * @returns ツールの実行結果（各ツール固有のレスポンス形式）
 * @throws 不明なツール名の場合はErrorをスロー
 */
async function executeTool(name: string, args: unknown): Promise<unknown> {
  switch (name) {
    case GetFileToolDefinition.name: {
      const validatedArgs: GetFileArgs = GetFileArgsSchema.parse(args);
      return GetFileTool.execute(getFileTool, validatedArgs);
    }
    case GetFileNodesToolDefinition.name: {
      const validatedArgs: GetFileNodesArgs = GetFileNodesArgsSchema.parse(args);
      return GetFileNodesTool.execute(getFileNodesTool, validatedArgs);
    }
    case GetComponentsToolDefinition.name: {
      const validatedArgs: GetComponentsArgs = GetComponentsArgsSchema.parse(args);
      return GetComponentsTool.execute(componentTool, validatedArgs);
    }
    case GetStylesToolDefinition.name: {
      const validatedArgs: GetStylesArgs = GetStylesArgsSchema.parse(args);
      return GetStylesTool.execute(getStylesTool, validatedArgs);
    }
    case ExportImagesToolDefinition.name: {
      const validatedArgs: ExportImagesArgs = ExportImagesArgsSchema.parse(args);
      return ExportImagesTool.execute(exportImagesTool, validatedArgs);
    }
    case GetCommentsToolDefinition.name: {
      const validatedArgs: GetCommentsArgs = GetCommentsArgsSchema.parse(args);
      return GetCommentsTool.execute(commentTool, validatedArgs);
    }
    case GetVersionsToolDefinition.name: {
      const validatedArgs: GetVersionsArgs = GetVersionsArgsSchema.parse(args);
      return GetVersionsTool.execute(getVersionsTool, validatedArgs);
    }
    case ParseFigmaUrlToolDefinition.name: {
      const validatedArgs: ParseFigmaUrlArgs = ParseFigmaUrlArgsSchema.parse(args);
      // 他のツールとの一貫性を保つため、同期関数の結果をPromiseでラップして統一的なインターフェースを提供
      return Promise.resolve(ParseFigmaUrlTool.execute(parseFigmaUrlTool, validatedArgs));
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

server.setRequestHandler(ListToolsRequestSchema, () => {
  return {
    tools: [
      {
        name: GetFileToolDefinition.name,
        description: GetFileToolDefinition.description,
        inputSchema: GetFileToolDefinition.inputSchema,
      },
      {
        name: GetFileNodesToolDefinition.name,
        description: GetFileNodesToolDefinition.description,
        inputSchema: GetFileNodesToolDefinition.inputSchema,
      },
      {
        name: GetComponentsToolDefinition.name,
        description: GetComponentsToolDefinition.description,
        inputSchema: GetComponentsToolDefinition.inputSchema,
      },
      {
        name: GetStylesToolDefinition.name,
        description: GetStylesToolDefinition.description,
        inputSchema: GetStylesToolDefinition.inputSchema,
      },
      {
        name: ExportImagesToolDefinition.name,
        description: ExportImagesToolDefinition.description,
        inputSchema: ExportImagesToolDefinition.inputSchema,
      },
      {
        name: GetCommentsToolDefinition.name,
        description: GetCommentsToolDefinition.description,
        inputSchema: GetCommentsToolDefinition.inputSchema,
      },
      {
        name: GetVersionsToolDefinition.name,
        description: GetVersionsToolDefinition.description,
        inputSchema: GetVersionsToolDefinition.inputSchema,
      },
      {
        name: ParseFigmaUrlToolDefinition.name,
        description: ParseFigmaUrlToolDefinition.description,
        inputSchema: ParseFigmaUrlToolDefinition.inputSchema,
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const result = await executeTool(name, args);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);

Logger.info('Figma MCP server started', {
  version: '0.1.0',
  logLevel: LogLevel[logLevel],
  cacheEnabled: true,
});

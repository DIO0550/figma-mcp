import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';

import { createFigmaApiClient } from './api/figma-api-client.js';
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
const logLevel = process.env.LOG_LEVEL
  ? LogLevel[process.env.LOG_LEVEL as keyof typeof LogLevel]
  : LogLevel.INFO;

Logger.init({ type: 'mcp', server, level: logLevel });

// APIクライアントの初期化
const accessToken = process.env.FIGMA_ACCESS_TOKEN;
if (!accessToken) {
  Logger.error('FIGMA_ACCESS_TOKEN environment variable is required');
  process.exit(1);
}

// APIクライアントの作成
const apiClient = createFigmaApiClient(accessToken);

// ツールの作成
const getFileTool = GetFileTool.from(apiClient);
const getFileNodesTool = GetFileNodesTool.from(apiClient);
const componentTool = GetComponentsTool.from(apiClient);
const getStylesTool = GetStylesTool.from(apiClient);
const exportImagesTool = ExportImagesTool.from(apiClient);
const commentTool = GetCommentsTool.from(apiClient);
const getVersionsTool = GetVersionsTool.from(apiClient);
const parseFigmaUrlTool = ParseFigmaUrlTool.create();

// ツール実行のヘルパー関数
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
      return ParseFigmaUrlTool.execute(parseFigmaUrlTool, validatedArgs);
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

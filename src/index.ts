import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';

import { createFigmaApiClient } from './api/figma-api-client.js';
import { GetFileTool, GetFileToolDefinition, GetFileNodesTool, GetFileNodesToolDefinition } from './tools/file/index.js';
import { GetComponentsTool, GetComponentsToolDefinition } from './tools/component/index.js';
import { createStyleTools } from './tools/style/index.js';
import { createImageTools } from './tools/image/index.js';
import { GetCommentsTool, GetCommentsToolDefinition } from './tools/comment/index.js';
import { createVersionTools } from './tools/version/index.js';
import { parseFigmaUrlTool, parseFigmaUrl } from './tools/parse-figma-url/index.js';
import { Logger, LogLevel } from './utils/logger/index.js';

import { GetFileArgsSchema } from './tools/file/get-file-args.js';
import { GetFileNodesArgsSchema } from './tools/file/get-file-nodes-args.js';
import { GetComponentsArgsSchema } from './tools/component/get-components-args.js';
import { GetStylesArgsSchema } from './tools/style/get-styles-args.js';
import { ExportImagesArgsSchema } from './tools/image/export-images-args.js';
import { GetCommentsArgsSchema } from './tools/comment/get-comments-args.js';
import { GetVersionsArgsSchema } from './tools/version/get-versions-args.js';
import { parseFigmaUrlArgsSchema } from './tools/parse-figma-url/parse-figma-url-args.js';

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
const styleTools = createStyleTools(apiClient);
const imageTools = createImageTools(apiClient);
const commentTool = GetCommentsTool.from(apiClient);
const versionTools = createVersionTools(apiClient);

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
        name: styleTools.getStyles.name,
        description: styleTools.getStyles.description,
        inputSchema: styleTools.getStyles.inputSchema,
      },
      {
        name: imageTools.exportImages.name,
        description: imageTools.exportImages.description,
        inputSchema: imageTools.exportImages.inputSchema,
      },
      {
        name: GetCommentsToolDefinition.name,
        description: GetCommentsToolDefinition.description,
        inputSchema: GetCommentsToolDefinition.inputSchema,
      },
      {
        name: versionTools.getVersions.name,
        description: versionTools.getVersions.description,
        inputSchema: versionTools.getVersions.inputSchema,
      },
      {
        name: parseFigmaUrlTool.name,
        description: parseFigmaUrlTool.description,
        inputSchema: parseFigmaUrlTool.inputSchema,
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_file': {
        const validatedArgs = GetFileArgsSchema.parse(args);
        const result = await GetFileTool.execute(getFileTool, validatedArgs);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_file_nodes': {
        const validatedArgs = GetFileNodesArgsSchema.parse(args);
        const result = await GetFileNodesTool.execute(getFileNodesTool, validatedArgs);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_components': {
        const validatedArgs = GetComponentsArgsSchema.parse(args);
        const result = await GetComponentsTool.execute(componentTool, validatedArgs);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_styles': {
        const validatedArgs = GetStylesArgsSchema.parse(args);
        const result = await styleTools.getStyles.execute(validatedArgs);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'export_images': {
        const validatedArgs = ExportImagesArgsSchema.parse(args);
        const result = await imageTools.exportImages.execute(validatedArgs);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_comments': {
        const validatedArgs = GetCommentsArgsSchema.parse(args);
        const result = await GetCommentsTool.execute(commentTool, validatedArgs);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_versions': {
        const validatedArgs = GetVersionsArgsSchema.parse(args);
        const result = await versionTools.getVersions.execute(validatedArgs);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'parse_figma_url': {
        const validatedArgs = parseFigmaUrlArgsSchema.parse(args);
        const result = parseFigmaUrl(validatedArgs);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
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

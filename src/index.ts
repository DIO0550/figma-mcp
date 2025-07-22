import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';

import { FigmaApiClient } from './api/figma-api-client.js';
import { createFileTools } from './tools/file/index.js';
import { createComponentTools } from './tools/component/index.js';
import { createStyleTools } from './tools/style/index.js';
import { createImageTools } from './tools/image/index.js';
import { createCommentTools } from './tools/comment/index.js';
import { createVersionTools } from './tools/version/index.js';
import type { GetFileArgs, GetFileNodesArgs } from './tools/file/types.js';
import type { GetComponentsArgs } from './tools/component/types.js';
import type { GetStylesArgs } from './tools/style/types.js';
import type { ExportImagesArgs } from './tools/image/types.js';
import type { GetCommentsArgs } from './tools/comment/types.js';
import type { GetVersionsArgs } from './tools/version/types.js';
import { Logger, LogLevel } from './utils/logger/index.js';

dotenv.config();

// MCPサーバーの設定
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
const apiClient = new FigmaApiClient(accessToken);

// ツールの作成
const fileTools = createFileTools(apiClient);
const componentTools = createComponentTools(apiClient);
const styleTools = createStyleTools(apiClient);
const imageTools = createImageTools(apiClient);
const commentTools = createCommentTools(apiClient);
const versionTools = createVersionTools(apiClient);

server.setRequestHandler(ListToolsRequestSchema, () => {
  return {
    tools: [
      {
        name: fileTools.getFile.name,
        description: fileTools.getFile.description,
        inputSchema: {
          type: 'object',
          properties: {
            file_key: {
              type: 'string',
              description: 'The Figma file key',
            },
            branch_data: {
              type: 'boolean',
              description: 'Include branch data',
            },
            version: {
              type: 'string',
              description: 'Version ID to fetch',
            },
            plugin_data: {
              type: 'string',
              description: 'Plugin data to include',
            },
          },
          required: ['file_key'],
        },
      },
      {
        name: fileTools.getFileNodes.name,
        description: fileTools.getFileNodes.description,
        inputSchema: {
          type: 'object',
          properties: {
            file_key: {
              type: 'string',
              description: 'The Figma file key',
            },
            ids: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Array of node IDs to fetch',
            },
            depth: {
              type: 'number',
              description: 'Depth of nodes to fetch',
            },
            geometry: {
              type: 'string',
              enum: ['paths', 'points'],
              description: 'Geometry type to include',
            },
            branch_data: {
              type: 'boolean',
              description: 'Include branch data',
            },
            version: {
              type: 'string',
              description: 'Version ID to fetch',
            },
            plugin_data: {
              type: 'string',
              description: 'Plugin data to include',
            },
          },
          required: ['file_key', 'ids'],
        },
      },
      {
        name: componentTools.getComponents.name,
        description: componentTools.getComponents.description,
        inputSchema: {
          type: 'object',
          properties: {
            fileKey: {
              type: 'string',
              description: 'The Figma file key',
            },
          },
          required: ['fileKey'],
        },
      },
      {
        name: styleTools.getStyles.name,
        description: styleTools.getStyles.description,
        inputSchema: {
          type: 'object',
          properties: {
            fileKey: {
              type: 'string',
              description: 'The Figma file key',
            },
          },
          required: ['fileKey'],
        },
      },
      {
        name: imageTools.exportImages.name,
        description: imageTools.exportImages.description,
        inputSchema: {
          type: 'object',
          properties: {
            fileKey: {
              type: 'string',
              description: 'The Figma file key',
            },
            ids: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Array of node IDs to export',
            },
            format: {
              type: 'string',
              enum: ['jpg', 'png', 'svg', 'pdf'],
              description: 'Export format',
            },
            scale: {
              type: 'number',
              description: 'Scale of the exported image',
            },
          },
          required: ['fileKey', 'ids'],
        },
      },
      {
        name: commentTools.getComments.name,
        description: commentTools.getComments.description,
        inputSchema: {
          type: 'object',
          properties: {
            fileKey: {
              type: 'string',
              description: 'The Figma file key',
            },
          },
          required: ['fileKey'],
        },
      },
      {
        name: versionTools.getVersions.name,
        description: versionTools.getVersions.description,
        inputSchema: {
          type: 'object',
          properties: {
            fileKey: {
              type: 'string',
              description: 'The Figma file key',
            },
          },
          required: ['fileKey'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const toolArgs = args as Record<string, unknown>;

  try {
    switch (name) {
      case 'get_file': {
        const file_key = toolArgs.file_key;
        if (!file_key || typeof file_key !== 'string') {
          throw new Error('file_key is required and must be a string');
        }
        const args: GetFileArgs = {
          file_key,
          branch_data: toolArgs.branch_data as boolean | undefined,
          version: toolArgs.version as string | undefined,
          plugin_data: toolArgs.plugin_data as string | undefined,
        };
        const result = await fileTools.getFile.execute(args);
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
        const file_key = toolArgs.file_key as string;
        const ids = toolArgs.ids as string[];
        if (!file_key) {
          throw new Error('file_key is required');
        }
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
          throw new Error('ids is required and must be a non-empty array');
        }
        const args: GetFileNodesArgs = {
          file_key,
          ids,
          depth: toolArgs.depth as number | undefined,
          geometry: toolArgs.geometry as 'paths' | 'points' | undefined,
          branch_data: toolArgs.branch_data as boolean | undefined,
          version: toolArgs.version as string | undefined,
          plugin_data: toolArgs.plugin_data as string | undefined,
        };
        const result = await fileTools.getFileNodes.execute(args);
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
        const args: GetComponentsArgs = {
          fileKey: toolArgs.fileKey as string,
        };
        const result = await componentTools.getComponents.execute(args);
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
        const args: GetStylesArgs = {
          fileKey: toolArgs.fileKey as string,
        };
        const result = await styleTools.getStyles.execute(args);
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
        const args: ExportImagesArgs = {
          fileKey: toolArgs.fileKey as string,
          ids: toolArgs.ids as string[],
          format: toolArgs.format as 'jpg' | 'png' | 'svg' | 'pdf' | undefined,
          scale: toolArgs.scale as number | undefined,
        };
        const result = await imageTools.exportImages.execute(args);
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
        const args: GetCommentsArgs = {
          fileKey: toolArgs.fileKey as string,
        };
        const result = await commentTools.getComments.execute(args);
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
        const args: GetVersionsArgs = {
          fileKey: toolArgs.fileKey as string,
        };
        const result = await versionTools.getVersions.execute(args);
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

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';

import { createApiConfig } from './api/config.js';
import { createHttpClient } from './api/client.js';
import { createComponentsApi } from './api/endpoints/components.js';
import { createStylesApi } from './api/endpoints/styles.js';
import { createImagesApi } from './api/endpoints/images.js';
import { createCommentsApi } from './api/endpoints/comments.js';
import { createVersionsApi } from './api/endpoints/versions.js';
// import { createTeamsApi } from './api/endpoints/teams.js';
import { FigmaApiClient } from './api/figma-api-client.js';
import { createFileTools } from './tools/file/index.js';
import type { GetFileArgs, GetFileNodesArgs } from './tools/file/types.js';
import { createCache } from './utils/cache.js';
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

// キャッシュの設定
const cache = createCache({
  maxSize: 100,
  defaultTtl: 300000, // 5分
});

const config = createApiConfig(accessToken);
const httpClient = createHttpClient(config, {
  cache,
  cacheKeyPrefix: 'figma:',
});

// API エンドポイントの作成
const componentsApi = createComponentsApi(httpClient);
const stylesApi = createStylesApi(httpClient);
const imagesApi = createImagesApi(httpClient);
const commentsApi = createCommentsApi(httpClient);
const versionsApi = createVersionsApi(httpClient);
// const teamsApi = createTeamsApi(httpClient);

// APIクライアントの作成
const apiClient = new FigmaApiClient(accessToken);

// ツールの作成
const fileTools = createFileTools(apiClient);

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
        name: 'get_components',
        description: 'Get components from a Figma file',
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
        name: 'get_styles',
        description: 'Get styles from a Figma file',
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
        name: 'export_images',
        description: 'Export images from a Figma file',
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
        name: 'get_comments',
        description: 'Get comments from a Figma file',
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
        name: 'get_versions',
        description: 'Get version history of a Figma file',
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
        const args: GetFileArgs = {
          file_key: toolArgs.file_key as string,
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
        const args: GetFileNodesArgs = {
          file_key: toolArgs.file_key as string,
          ids: toolArgs.ids as string[],
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
        const fileKey = toolArgs?.fileKey as string;
        if (!fileKey) {
          throw new Error('fileKey is required');
        }
        const result = await componentsApi.getComponents(fileKey);
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
        const fileKey = toolArgs?.fileKey as string;
        if (!fileKey) {
          throw new Error('fileKey is required');
        }
        const result = await stylesApi.getStyles(fileKey);
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
        const fileKey = toolArgs?.fileKey as string;
        const ids = toolArgs?.ids as string[];
        if (!fileKey || !ids) {
          throw new Error('fileKey and ids are required');
        }
        const result = await imagesApi.exportImages(fileKey, {
          ids,
          format: toolArgs?.format as 'jpg' | 'png' | 'svg' | 'pdf' | undefined,
          scale: toolArgs?.scale as number | undefined,
        });
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
        const fileKey = toolArgs?.fileKey as string;
        if (!fileKey) {
          throw new Error('fileKey is required');
        }
        const result = await commentsApi.getComments(fileKey);
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
        const fileKey = toolArgs?.fileKey as string;
        if (!fileKey) {
          throw new Error('fileKey is required');
        }
        const result = await versionsApi.getVersions(fileKey);
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

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
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

dotenv.config();

// APIクライアントの初期化
const accessToken = process.env.FIGMA_ACCESS_TOKEN;
if (!accessToken) {
  console.error('FIGMA_ACCESS_TOKEN environment variable is required');
  process.exit(1);
}

const config = createApiConfig(accessToken);
const httpClient = createHttpClient(config);

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

server.setRequestHandler(ListToolsRequestSchema, () => {
  return {
    tools: [
      fileTools.get_file,
      fileTools.get_file_nodes,
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
        const result = await fileTools.get_file.handler(toolArgs);
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
        const result = await fileTools.get_file_nodes.handler(toolArgs);
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

console.error('Figma MCP server running on stdio');
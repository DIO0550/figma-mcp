import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';

import { createApiConfig } from './api/config.js';
import { createHttpClient } from './api/client.js';
import { createFilesApi } from './api/endpoints/files.js';
import { createNodesApi } from './api/endpoints/nodes.js';
import { createComponentsApi } from './api/endpoints/components.js';
import { createStylesApi } from './api/endpoints/styles.js';
import { createImagesApi } from './api/endpoints/images.js';
import { createCommentsApi } from './api/endpoints/comments.js';
import { createVersionsApi } from './api/endpoints/versions.js';
// import { createTeamsApi } from './api/endpoints/teams.js';

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
const filesApi = createFilesApi(httpClient);
const nodesApi = createNodesApi(httpClient);
const componentsApi = createComponentsApi(httpClient);
const stylesApi = createStylesApi(httpClient);
const imagesApi = createImagesApi(httpClient);
const commentsApi = createCommentsApi(httpClient);
const versionsApi = createVersionsApi(httpClient);
// const teamsApi = createTeamsApi(httpClient);

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
      {
        name: 'get_file',
        description: 'Get Figma file information',
        inputSchema: {
          type: 'object',
          properties: {
            fileKey: {
              type: 'string',
              description: 'The Figma file key',
            },
            version: {
              type: 'string',
              description: 'A specific version ID to get',
            },
            depth: {
              type: 'number',
              description: 'Depth of the node tree to traverse',
            },
          },
          required: ['fileKey'],
        },
      },
      {
        name: 'get_nodes',
        description: 'Get specific nodes from a Figma file',
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
              description: 'Array of node IDs to retrieve',
            },
          },
          required: ['fileKey', 'ids'],
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

  try {
    switch (name) {
      case 'get_file': {
        const fileKey = args?.fileKey as string;
        if (!fileKey) {
          throw new Error('fileKey is required');
        }
        const result = await filesApi.getFile(fileKey, {
          version: args?.version as string | undefined,
          depth: args?.depth as number | undefined,
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

      case 'get_nodes': {
        const fileKey = args?.fileKey as string;
        const ids = args?.ids as string[];
        if (!fileKey || !ids) {
          throw new Error('fileKey and ids are required');
        }
        const result = await nodesApi.getNodes(fileKey, {
          ids,
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

      case 'get_components': {
        const fileKey = args?.fileKey as string;
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
        const fileKey = args?.fileKey as string;
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
        const fileKey = args?.fileKey as string;
        const ids = args?.ids as string[];
        if (!fileKey || !ids) {
          throw new Error('fileKey and ids are required');
        }
        const result = await imagesApi.exportImages(fileKey, {
          ids,
          format: args?.format as 'jpg' | 'png' | 'svg' | 'pdf' | undefined,
          scale: args?.scale as number | undefined,
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
        const fileKey = args?.fileKey as string;
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
        const fileKey = args?.fileKey as string;
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
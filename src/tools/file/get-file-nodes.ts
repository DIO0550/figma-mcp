import type { GetFileOptions, GetFileNodesResponse } from '../../types/index.js';
import type { FilesApi } from '../../api/endpoints/files.js';
import type { ToolWithHandler, NodeEntry } from './types.js';

export function createGetFileNodesTool(filesApi: FilesApi): ToolWithHandler {
  return {
    name: 'get_file_nodes',
    description: 'Get specific nodes from a Figma file with optional depth and geometry',
    inputSchema: {
      type: 'object',
      properties: {
        file_key: {
          type: 'string',
          description: 'The file key of the Figma file',
        },
        ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of node IDs to retrieve',
        },
        depth: {
          type: 'number',
          description: 'How deep to traverse the node tree (default: 1)',
        },
        geometry: {
          type: 'string',
          enum: ['paths'],
          description: 'Include geometry data (vector paths)',
        },
        branch_data_id: {
          type: 'string',
          description: 'Optional branch ID',
        },
        version: {
          type: 'string',
          description: 'Optional version ID',
        },
        plugin_data: {
          type: 'string',
          description: 'Optional plugin ID',
        },
      },
      required: ['file_key', 'ids'],
    },
    handler: async (args: Record<string, unknown>) => {
      const file_key = args.file_key as string;
      const ids = args.ids as string[];
      const options: Record<string, unknown> = {
        depth: args.depth,
        geometry: args.geometry,
        branch_data_id: args.branch_data_id,
        version: args.version,
        plugin_data: args.plugin_data,
      };
      // Remove undefined values
      Object.keys(options).forEach(key => {
        if (options[key] === undefined) delete options[key];
      });

      if (!ids || ids.length === 0) {
        throw new Error('At least one node ID is required');
      }

      const responsePromise: Promise<GetFileNodesResponse> = filesApi.getFileNodes(file_key, ids, options as GetFileOptions);
      const response: GetFileNodesResponse = await responsePromise;

      const nodeEntries = Object.entries(response.nodes || {}) as NodeEntry[];
      const nodes = nodeEntries.map(([nodeId, nodeData]) => {
        const result = {
          ...nodeData.document,
          id: nodeId,
        };
        return result;
      });

      return {
        name: response.name,
        lastModified: response.lastModified,
        version: response.version,
        nodes,
      };
    },
  };
}
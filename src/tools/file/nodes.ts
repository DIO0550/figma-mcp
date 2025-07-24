import type { GetFileOptions } from '../../types/index.js';
import type { FilesApi } from '../../api/endpoints/files.js';
import type { GetFileNodesTool, GetFileNodesArgs, NodeEntry, FileNodesResponse } from './types.js';

export function createGetFileNodesTool(filesApi: FilesApi): GetFileNodesTool {
  return {
    name: 'get_file_nodes',
    description: 'Get specific nodes from a Figma file with optional depth and geometry',
    execute: async (args: GetFileNodesArgs): Promise<FileNodesResponse> => {
      if (!args.ids || args.ids.length === 0) {
        throw new Error('At least one node ID is required');
      }

      const options: GetFileOptions = {
        depth: args.depth,
        geometry: args.geometry,
        branch_data: args.branch_data,
        version: args.version,
        plugin_data: args.plugin_data,
      };
      
      // Remove undefined values
      Object.keys(options).forEach(key => {
        if (options[key as keyof GetFileOptions] === undefined) {
          delete options[key as keyof GetFileOptions];
        }
      });

      const response = await filesApi.getFileNodes(args.file_key, args.ids, options);
      const nodeEntries = Object.entries(response.nodes || {}) as NodeEntry[];
      const nodes = nodeEntries.map(([nodeId, nodeData]) => ({
        ...nodeData.document,
        id: nodeId,
      }));

      return {
        name: response.name,
        lastModified: response.lastModified,
        version: response.version,
        nodes,
      };
    },
  };
}
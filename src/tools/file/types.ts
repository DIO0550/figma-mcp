import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { Node, Component, Style } from '../../types/index.js';

export interface ToolWithHandler extends Tool {
  handler: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
}

export interface FileToolsResult {
  get_file: ToolWithHandler;
  get_file_nodes: ToolWithHandler;
}

export type NodeData = {
  document: Node;
  components: Record<string, Component>;
  styles: Record<string, Style>;
};

export type NodeEntry = [string, NodeData];
import type { Request, Response } from 'express';

interface NodeData {
  document: {
    id: string;
    name: string;
    type: string;
    absoluteBoundingBox: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    backgroundColor: {
      r: number;
      g: number;
      b: number;
      a: number;
    };
    children: unknown[];
    strokeGeometry?: unknown[];
    fillGeometry?: unknown[];
    pluginData?: Record<string, unknown>;
  };
  components: Record<string, unknown>;
  componentSets: Record<string, unknown>;
  schemaVersion: number;
  styles: Record<string, unknown>;
}

export const nodeHandlers = {
  getNodes: (req: Request, res: Response): void => {
    const { fileKey } = req.params;
    const { ids, depth, geometry, plugin_data } = req.query;

    // クエリパラメータに基づいてレスポンスを調整
    const nodeIds = ids ? String(ids).split(',') : ['2:3'];
    const nodes: Record<string, NodeData> = {};

    nodeIds.forEach((nodeId) => {
      const nodeData: NodeData = {
        document: {
          id: nodeId,
          name: `Node ${nodeId}`,
          type: 'FRAME',
          absoluteBoundingBox: {
            x: 0,
            y: 0,
            width: 375,
            height: 812,
          },
          backgroundColor: {
            r: 1,
            g: 1,
            b: 1,
            a: 1,
          },
          children: [],
        },
        components: {},
        componentSets: {},
        schemaVersion: 0,
        styles: {},
      };

      // geometryパラメータが指定されている場合は、追加情報を含める
      if (geometry === 'paths') {
        nodeData.document.strokeGeometry = [];
        nodeData.document.fillGeometry = [];
      }

      // plugin_dataが指定されている場合
      if (plugin_data) {
        nodeData.document.pluginData = {};
      }

      nodes[nodeId] = nodeData;
    });

    const mockResponse = {
      name: 'Test Design File',
      lastModified: '2024-01-01T00:00:00Z',
      thumbnailUrl: 'https://example.com/thumbnail.png',
      version: '1234567890',
      nodes,
      // ファイルキーをレスポンスに含める（デバッグ用）
      file_key: fileKey,
    };

    // depthパラメータが指定されている場合はログに記録
    if (depth) {
      console.log(`[MockFigmaServer] Nodes requested with depth: ${String(depth)}`);
    }

    res.json(mockResponse);
  },
};

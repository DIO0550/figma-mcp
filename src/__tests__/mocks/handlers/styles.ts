import type { Request, Response } from 'express';

interface StyleData {
  key: string;
  file_key: string;
  node_id: string;
  style_type: 'FILL' | 'TEXT' | 'EFFECT' | 'GRID';
  thumbnail_url: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  sort_position: string;
}

export const styleHandlers = {
  getStyles: (req: Request, res: Response): void => {
    const { fileKey } = req.params;

    // 様々なスタイルタイプのモックデータ
    const styles: StyleData[] = [
      {
        key: 'style1',
        file_key: fileKey,
        node_id: '20:30',
        style_type: 'FILL',
        thumbnail_url: 'https://example.com/style1.png',
        name: 'Primary Color',
        description: 'Main brand color',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        sort_position: '0',
      },
      {
        key: 'style2',
        file_key: fileKey,
        node_id: '20:31',
        style_type: 'TEXT',
        thumbnail_url: 'https://example.com/style2.png',
        name: 'Heading 1',
        description: 'Main heading style',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        sort_position: '1',
      },
      {
        key: 'style3',
        file_key: fileKey,
        node_id: '20:32',
        style_type: 'EFFECT',
        thumbnail_url: 'https://example.com/style3.png',
        name: 'Drop Shadow',
        description: 'Standard drop shadow effect',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        sort_position: '2',
      },
      {
        key: 'style4',
        file_key: fileKey,
        node_id: '20:33',
        style_type: 'GRID',
        thumbnail_url: 'https://example.com/style4.png',
        name: '8px Grid',
        description: '8 pixel grid system',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        sort_position: '3',
      },
    ];

    const mockResponse = {
      meta: {
        styles,
      },
    };

    res.json(mockResponse);
  },
};

import type { Request, Response } from 'express';

export const componentHandlers = {
  getComponents: (req: Request, res: Response): void => {
    const { fileKey } = req.params;

    // 空のコンポーネントリストを返すケース
    if (fileKey === 'empty-file-key') {
      res.json({
        meta: {
          components: [],
        },
      });
      return;
    }

    // 存在しないファイルのケース
    if (fileKey === 'non-existent-file') {
      res.status(404).json({
        error: true,
        message: 'File not found',
      });
      return;
    }

    // デフォルトのレスポンス
    const mockResponse = {
      meta: {
        components: [
          {
            key: 'component1',
            file_key: fileKey,
            node_id: '10:20',
            thumbnail_url: 'https://example.com/component1.png',
            name: 'Button Component',
            description: 'A reusable button component',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            containing_frame: {
              pageName: 'Components',
              containingStateGroup: null,
            },
          },
          {
            key: 'component2',
            file_key: fileKey,
            node_id: '10:21',
            thumbnail_url: 'https://example.com/component2.png',
            name: 'Card Component',
            description: 'A reusable card component',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            containing_frame: {
              pageName: 'Components',
              containingStateGroup: null,
            },
          },
        ],
      },
    };

    res.json(mockResponse);
  },

  getComponentSets: (_req: Request, res: Response): void => {
    // デフォルトのレスポンス
    const mockResponse = {
      meta: {
        componentSets: [
          {
            key: 'component-set-1',
            name: 'Button Variants',
            description: 'Button component with multiple variants',
          },
          {
            key: 'component-set-2',
            name: 'Card Variants',
            description: 'Card component with multiple variants',
          },
        ],
      },
    };

    res.json(mockResponse);
  },
};

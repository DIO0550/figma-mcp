import type { Request, Response } from 'express';

export const componentHandlers = {
  getComponents: (req: Request, res: Response): void => {
    const { fileKey } = req.params;

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
};

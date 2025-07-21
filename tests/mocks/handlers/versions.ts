import type { Request, Response } from 'express';

export const versionHandlers = {
  getVersions: (req: Request, res: Response): void => {
    const { fileKey } = req.params;
    
    const mockResponse = {
      versions: [
        {
          id: 'version1',
          created_at: '2024-01-01T00:00:00Z',
          label: 'Initial design',
          description: 'First version of the design',
          user: {
            handle: 'user1',
            img_url: 'https://example.com/user1.png',
            id: 'user1',
          },
          thumbnail_url: 'https://example.com/version1.png',
        },
        {
          id: 'version2',
          created_at: '2024-01-02T00:00:00Z',
          label: 'Updated colors',
          description: 'Changed primary colors',
          user: {
            handle: 'user2',
            img_url: 'https://example.com/user2.png',
            id: 'user2',
          },
          thumbnail_url: 'https://example.com/version2.png',
        },
      ],
    };

    res.json(mockResponse);
  },
};
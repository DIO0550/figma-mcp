import type { Request, Response } from 'express';

export const commentHandlers = {
  getComments: (req: Request, res: Response): void => {
    const { fileKey } = req.params;

    // empty-file-keyの場合は空のコメントリストを返す
    if (fileKey === 'empty-file-key') {
      res.json({ comments: [] });
      return;
    }

    const mockResponse = {
      comments: [
        {
          id: 'comment1',
          file_key: fileKey,
          parent_id: null,
          user: {
            handle: 'user1',
            img_url: 'https://example.com/user1.png',
            id: 'user1',
          },
          created_at: '2024-01-01T00:00:00Z',
          resolved_at: null,
          message: 'This needs to be updated',
          client_meta: {
            x: 100,
            y: 200,
            node_id: ['2:3'],
          },
          order_id: '1',
        },
        {
          id: 'comment2',
          file_key: fileKey,
          parent_id: 'comment1',
          user: {
            handle: 'user2',
            img_url: 'https://example.com/user2.png',
            id: 'user2',
          },
          created_at: '2024-01-01T01:00:00Z',
          resolved_at: null,
          message: 'I agree, let me fix it',
          client_meta: null,
          order_id: '2',
        },
      ],
    };

    res.json(mockResponse);
  },
};

import type { Request, Response } from 'express';

export const projectHandlers = {
  getProjectFiles: (req: Request, res: Response): void => {
    const { projectId } = req.params;

    // 存在しないプロジェクトのケース
    if (projectId === 'non-existent-project') {
      res.status(404).json({
        error: true,
        message: 'Project not found',
      });
      return;
    }

    // デフォルトのレスポンス
    const mockResponse = {
      files: [
        {
          key: 'file-key-1',
          name: 'Homepage Design',
          thumbnail_url: 'https://example.com/thumbnail1.png',
          last_modified: '2024-01-01T00:00:00Z',
        },
        {
          key: 'file-key-2',
          name: 'Dashboard Design',
          thumbnail_url: 'https://example.com/thumbnail2.png',
          last_modified: '2024-01-02T00:00:00Z',
        },
        {
          key: 'file-key-3',
          name: 'Mobile App Design',
          thumbnail_url: 'https://example.com/thumbnail3.png',
          last_modified: '2024-01-03T00:00:00Z',
        },
      ],
    };

    res.json(mockResponse);
  },
};

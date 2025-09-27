import type { Request, Response } from 'express';

export const teamHandlers = {
  getTeamProjects: (req: Request, res: Response): void => {
    const { teamId } = req.params;

    // 存在しないチームのケース
    if (teamId === 'non-existent-team') {
      res.status(404).json({
        error: true,
        message: 'Team not found',
      });
      return;
    }

    // デフォルトのレスポンス
    const mockResponse = {
      projects: [
        {
          id: '12345',
          name: 'Design System Project',
        },
        {
          id: '67890',
          name: 'Mobile App Project',
        },
      ],
    };

    res.json(mockResponse);
  },
};

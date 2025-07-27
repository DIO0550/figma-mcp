import type { Request, Response } from 'express';
import { mockFileData } from '../data/files.js';

interface FileParams {
  fileKey: string;
}

export const fileHandlers = {
  getFile: (req: Request<FileParams>, res: Response): Response | void => {
    const { fileKey } = req.params;
    
    // 特定のファイルキーに対するモックレスポンス
    if (fileKey === 'non-existent-file') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'File not found',
      });
    }

    // デフォルトのモックレスポンス
    const mockResponse = fileKey in mockFileData 
      ? mockFileData[fileKey] 
      : mockFileData.default;
    
    // レート制限のシミュレーション（ランダムに発生）
    if (Math.random() < 0.05) { // 5%の確率
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests',
      });
    }

    res.json(mockResponse);
  },
};
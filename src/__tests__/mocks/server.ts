import express from 'express';
import type { Express, Request, Response } from 'express';
import type { Server } from 'http';
import { fileHandlers } from './handlers/files.js';
import { nodeHandlers } from './handlers/nodes.js';
import { componentHandlers } from './handlers/components.js';
import { styleHandlers } from './handlers/styles.js';
import { imageHandlers } from './handlers/images.js';
import { commentHandlers } from './handlers/comments.js';
import { versionHandlers } from './handlers/versions.js';
import { HttpStatus, ErrorMessages, Headers as HeaderNames } from '../../constants/index.js';
import { TestPorts } from '../../constants/__test__/index.js';

export class MockFigmaServer {
  private app: Express;
  private server: Server | null = null;

  constructor(private port: number = TestPorts.FIGMA_API_MOCK) {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());

    // 認証チェックミドルウェア
    this.app.use((req: Request, res: Response, next) => {
      const token = req.headers[HeaderNames.FIGMA_TOKEN.toLowerCase()];
      if (!token) {
        res.status(HttpStatus.UNAUTHORIZED).json({
          error: ErrorMessages.UNAUTHORIZED,
          message: ErrorMessages.MISSING_TOKEN,
        });
        return;
      }
      if (token === 'invalid-token') {
        res.status(HttpStatus.UNAUTHORIZED).json({
          error: ErrorMessages.UNAUTHORIZED,
          message: ErrorMessages.INVALID_TOKEN,
        });
        return;
      }
      next();
    });

    // ロギングミドルウェア
    this.app.use((req: Request, _res: Response, next) => {
      console.log(`[MockFigmaServer] ${req.method} ${req.path}`);
      next();
    });
  }

  private setupRoutes(): void {
    // ファイル関連のルート
    this.app.get('/v1/files/:fileKey', fileHandlers.getFile);
    this.app.get('/v1/files/:fileKey/nodes', nodeHandlers.getNodes);

    // コンポーネント・スタイル
    this.app.get('/v1/files/:fileKey/components', componentHandlers.getComponents);
    this.app.get('/v1/files/:fileKey/styles', styleHandlers.getStyles);

    // 画像エクスポート
    this.app.get('/v1/images/:fileKey', imageHandlers.exportImages);

    // コラボレーション
    this.app.get('/v1/files/:fileKey/comments', commentHandlers.getComments);
    this.app.get('/v1/files/:fileKey/versions', versionHandlers.getVersions);

    // 404 ハンドラー
    this.app.use((req: Request, res: Response) => {
      res.status(HttpStatus.NOT_FOUND).json({
        error: ErrorMessages.NOT_FOUND,
        message: `Route ${req.path} not found`,
      });
    });

    // エラーハンドラー
    this.app.use((err: Error, _req: Request, res: Response, _next: express.NextFunction) => {
      console.error('[MockFigmaServer] Error:', err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_SERVER_ERROR,
        message: err.message,
      });
    });
  }

  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        console.log(`[MockFigmaServer] Started on port ${this.port}`);
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('[MockFigmaServer] Stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

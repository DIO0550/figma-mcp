import type { Request, Response } from 'express';

// テストデータの定数
const TEST_NODE_IDS = {
  BUTTON_COMPONENT: '10:20',
  CARD_COMPONENT: '10:21',
} as const;

const TEST_URLS = {
  BUTTON_THUMBNAIL: 'https://example.com/component1.png',
  CARD_THUMBNAIL: 'https://example.com/component2.png',
} as const;

const TEST_DATES = {
  CREATED_AT: '2024-01-01T00:00:00Z',
  UPDATED_AT: '2024-01-01T00:00:00Z',
} as const;

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
            fileKey: fileKey,
            nodeId: TEST_NODE_IDS.BUTTON_COMPONENT,
            thumbnailUrl: TEST_URLS.BUTTON_THUMBNAIL,
            name: 'Button Component',
            description: 'A reusable button component',
            documentationLinks: [],
            createdAt: TEST_DATES.CREATED_AT,
            updatedAt: TEST_DATES.UPDATED_AT,
            containingFrame: {
              pageName: 'Components',
              containingStateGroup: null,
            },
          },
          {
            key: 'component2',
            fileKey: fileKey,
            nodeId: TEST_NODE_IDS.CARD_COMPONENT,
            thumbnailUrl: TEST_URLS.CARD_THUMBNAIL,
            name: 'Card Component',
            description: 'A reusable card component',
            documentationLinks: [],
            createdAt: TEST_DATES.CREATED_AT,
            updatedAt: TEST_DATES.UPDATED_AT,
            containingFrame: {
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

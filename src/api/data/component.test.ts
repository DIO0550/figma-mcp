import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ComponentData } from './component.js';
import type { FigmaContext } from '../context.js';
import type { GetComponentsResponse } from '../../types/api/responses/component-responses.js';

describe('ComponentData', () => {
  const mockContext: FigmaContext = {
    accessToken: 'test-token',
    baseUrl: 'https://api.figma.com',
    headers: {
      'X-Figma-Token': 'test-token',
    },
  };

  describe('インターフェース', () => {
    it('必要なプロパティを持つ', () => {
      const componentData: ComponentData = {
        key: 'component-key',
        fileKey: 'file-key',
        nodeId: '1:1',
        name: 'Button Component',
        description: 'Primary button component',
        containingFrame: {
          nodeId: '2:2',
          name: 'Button Frame',
          backgroundColor: '#FFFFFF',
          pageName: 'Components',
        },
      };

      expect(componentData.key).toBe('component-key');
      expect(componentData.name).toBe('Button Component');
      expect(componentData.containingFrame.pageName).toBe('Components');
    });
  });

  describe('ComponentData.fromResponse', () => {
    it('Figma APIレスポンスからComponentDataを作成できる', () => {
      const response: GetComponentsResponse = {
        meta: {
          components: [
            {
              key: 'comp-123',
              file_key: 'file-abc',
              node_id: '3:3',
              name: 'Card Component',
              description: 'Card layout component',
              containing_frame: {
                nodeId: '4:4',
                name: 'Card Frame',
                backgroundColor: '#F0F0F0',
                pageName: 'Design System',
              },
            } as any,
          ],
        },
      };

      const components = ComponentData.fromResponse(response);

      expect(components).toHaveLength(1);
      expect(components[0].key).toBe('comp-123');
      expect(components[0].fileKey).toBe('file-abc');
      expect(components[0].nodeId).toBe('3:3');
      expect(components[0].name).toBe('Card Component');
    });

    it('複数のコンポーネントを処理できる', () => {
      const response: GetComponentsResponse = {
        meta: {
          components: [
            {
              key: 'comp-1',
              file_key: 'file-1',
              node_id: '1:1',
              name: 'Component 1',
              description: '',
              containing_frame: {
                nodeId: '0:0',
                name: 'Frame 1',
                backgroundColor: '',
                pageName: 'Page 1',
              },
            } as any,
            {
              key: 'comp-2',
              file_key: 'file-1',
              node_id: '2:2',
              name: 'Component 2',
              description: '',
              containing_frame: {
                nodeId: '0:1',
                name: 'Frame 2',
                backgroundColor: '',
                pageName: 'Page 2',
              },
            } as any,
          ],
        },
      };

      const components = ComponentData.fromResponse(response);

      expect(components).toHaveLength(2);
      expect(components[0].name).toBe('Component 1');
      expect(components[1].name).toBe('Component 2');
    });

    it('空のレスポンスを処理できる', () => {
      const response: GetComponentsResponse = {
        meta: {
          components: [],
        },
      };

      const components = ComponentData.fromResponse(response);

      expect(components).toEqual([]);
    });
  });

  describe('ComponentData.fetchAll', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('指定されたファイルのコンポーネント一覧を取得できる', async () => {
      const mockResponse: GetComponentsResponse = {
        meta: {
          components: [
            {
              key: 'fetch-comp-1',
              file_key: 'test-file',
              node_id: '5:5',
              name: 'Fetched Component',
              description: 'Test component',
              containing_frame: {
                nodeId: '6:6',
                name: 'Container',
                backgroundColor: '#000000',
                pageName: 'Test Page',
              },
            } as any,
          ],
        },
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const components = await ComponentData.fetchAll(mockContext, 'test-file');

      expect(components).toHaveLength(1);
      expect(components[0].key).toBe('fetch-comp-1');
      expect(components[0].name).toBe('Fetched Component');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.figma.com/v1/files/test-file/components',
        expect.objectContaining({
          method: 'GET',
          headers: mockContext.headers,
        })
      );
    });

    it('APIエラーの場合は例外を投げる', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      } as Response);

      await expect(
        ComponentData.fetchAll(mockContext, 'forbidden-file')
      ).rejects.toThrow('Failed to fetch components: 403 Forbidden');
    });
  });

  describe('ComponentData.groupByPage', () => {
    it('コンポーネントをページごとにグループ化できる', () => {
      const components: ComponentData[] = [
        {
          key: 'comp-1',
          fileKey: 'file-1',
          nodeId: '1:1',
          name: 'Button',
          description: '',
          containingFrame: {
            nodeId: '0:0',
            name: 'Buttons',
            backgroundColor: '',
            pageName: 'Components',
          },
        },
        {
          key: 'comp-2',
          fileKey: 'file-1',
          nodeId: '2:2',
          name: 'Card',
          description: '',
          containingFrame: {
            nodeId: '0:1',
            name: 'Cards',
            backgroundColor: '',
            pageName: 'Components',
          },
        },
        {
          key: 'comp-3',
          fileKey: 'file-1',
          nodeId: '3:3',
          name: 'Icon',
          description: '',
          containingFrame: {
            nodeId: '0:2',
            name: 'Icons',
            backgroundColor: '',
            pageName: 'Icons',
          },
        },
      ];

      const grouped = ComponentData.groupByPage(components);

      expect(Object.keys(grouped)).toEqual(['Components', 'Icons']);
      expect(grouped['Components']).toHaveLength(2);
      expect(grouped['Icons']).toHaveLength(1);
      expect(grouped['Components'][0].name).toBe('Button');
      expect(grouped['Components'][1].name).toBe('Card');
      expect(grouped['Icons'][0].name).toBe('Icon');
    });

    it('空の配列を処理できる', () => {
      const grouped = ComponentData.groupByPage([]);

      expect(grouped).toEqual({});
    });
  });

  describe('ComponentData.filterByName', () => {
    const components: ComponentData[] = [
      {
        key: 'comp-1',
        fileKey: 'file-1',
        nodeId: '1:1',
        name: 'Primary Button',
        description: '',
        containingFrame: {
          nodeId: '0:0',
          name: 'Buttons',
          backgroundColor: '',
          pageName: 'Components',
        },
      },
      {
        key: 'comp-2',
        fileKey: 'file-1',
        nodeId: '2:2',
        name: 'Secondary Button',
        description: '',
        containingFrame: {
          nodeId: '0:1',
          name: 'Buttons',
          backgroundColor: '',
          pageName: 'Components',
        },
      },
      {
        key: 'comp-3',
        fileKey: 'file-1',
        nodeId: '3:3',
        name: 'Card',
        description: '',
        containingFrame: {
          nodeId: '0:2',
          name: 'Cards',
          backgroundColor: '',
          pageName: 'Components',
        },
      },
    ];

    it('名前でコンポーネントをフィルタリングできる', () => {
      const filtered = ComponentData.filterByName(components, 'Button');

      expect(filtered).toHaveLength(2);
      expect(filtered[0].name).toBe('Primary Button');
      expect(filtered[1].name).toBe('Secondary Button');
    });

    it('大文字小文字を区別しない', () => {
      const filtered = ComponentData.filterByName(components, 'button');

      expect(filtered).toHaveLength(2);
    });

    it('部分一致で検索できる', () => {
      const filtered = ComponentData.filterByName(components, 'Pri');

      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Primary Button');
    });

    it('一致しない場合は空配列を返す', () => {
      const filtered = ComponentData.filterByName(components, 'NonExistent');

      expect(filtered).toEqual([]);
    });
  });
});
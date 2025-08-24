import { describe, expect, it } from 'vitest';
import { ComponentData } from '../component.js';
import type { FileComponentsApiResponse } from '../../../../types/api/responses/component-responses.js';
import type { Component } from '../../../../types/figma-types.js';

describe('ComponentData.fromResponse', () => {
  it('Figma APIレスポンスからComponentDataを作成できる', () => {
    const response: FileComponentsApiResponse = {
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
          } as unknown as Component,
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
    const response: FileComponentsApiResponse = {
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
          } as unknown as Component,
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
          } as unknown as Component,
        ],
      },
    };

    const components = ComponentData.fromResponse(response);

    expect(components).toHaveLength(2);
    expect(components[0].name).toBe('Component 1');
    expect(components[1].name).toBe('Component 2');
  });

  it('空のレスポンスを処理できる', () => {
    const response: FileComponentsApiResponse = {
      meta: {
        components: [],
      },
    };

    const components = ComponentData.fromResponse(response);

    expect(components).toEqual([]);
  });
});
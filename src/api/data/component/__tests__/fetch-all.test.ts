import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ComponentData } from '../component.js';
import type { FigmaContext } from '../../../context.js';
import type { FileComponentsApiResponse } from '../../../../types/api/responses/component-responses.js';
import type { Component } from '../../../../types/figma-types.js';

describe('ComponentData.fetchAll', () => {
  const mockContext: FigmaContext = {
    accessToken: 'test-token',
    baseUrl: 'https://api.figma.com',
    headers: {
      'X-Figma-Token': 'test-token',
    },
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('指定されたファイルのコンポーネント一覧を取得できる', async () => {
    const mockResponse: FileComponentsApiResponse = {
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
          } as unknown as Component,
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
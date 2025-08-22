import { describe, expect, it } from 'vitest';
import { FileData } from '../file.js';

describe('FileData.getPageNames', () => {
  it('ファイルからページ名のリストを取得できる', () => {
    const fileData: FileData = {
      key: 'test-key',
      name: 'Test File',
      lastModified: '2024-01-01T00:00:00Z',
      version: '123',
      document: {
        id: '0:0',
        name: 'Document',
        type: 'DOCUMENT',
        children: [
          { id: '1:1', name: 'Page 1', type: 'CANVAS', children: [] },
          { id: '2:2', name: 'Page 2', type: 'CANVAS', children: [] },
          { id: '3:3', name: 'Frame', type: 'FRAME', children: [] }, // Not a page
        ],
      },
      components: {},
      schemaVersion: 0,
      styles: {},
      role: 'owner',
      editorType: 'figma',
      linkAccess: 'view',
    };

    const pageNames = FileData.getPageNames(fileData);

    expect(pageNames).toEqual(['Page 1', 'Page 2']);
  });

  it('ページがない場合は空配列を返す', () => {
    const fileData: FileData = {
      key: 'test-key',
      name: 'Test File',
      lastModified: '2024-01-01T00:00:00Z',
      version: '123',
      document: {
        id: '0:0',
        name: 'Document',
        type: 'DOCUMENT',
        children: [],
      },
      components: {},
      schemaVersion: 0,
      styles: {},
      role: 'owner',
      editorType: 'figma',
      linkAccess: 'view',
    };

    const pageNames = FileData.getPageNames(fileData);

    expect(pageNames).toEqual([]);
  });
});

describe('FileData.findNodeById', () => {
  it('指定されたIDのノードを見つけることができる', () => {
    const fileData: FileData = {
      key: 'test-key',
      name: 'Test File',
      lastModified: '2024-01-01T00:00:00Z',
      version: '123',
      document: {
        id: '0:0',
        name: 'Document',
        type: 'DOCUMENT',
        children: [
          {
            id: '1:1',
            name: 'Page 1',
            type: 'CANVAS',
            children: [
              {
                id: '2:2',
                name: 'Target Frame',
                type: 'FRAME',
                children: [],
              },
            ],
          },
        ],
      },
      components: {},
      schemaVersion: 0,
      styles: {},
      role: 'owner',
      editorType: 'figma',
      linkAccess: 'view',
    };

    const node = FileData.findNodeById(fileData, '2:2');

    expect(node).toBeDefined();
    expect(node?.name).toBe('Target Frame');
    expect(node?.type).toBe('FRAME');
  });

  it('存在しないIDの場合はundefinedを返す', () => {
    const fileData: FileData = {
      key: 'test-key',
      name: 'Test File',
      lastModified: '2024-01-01T00:00:00Z',
      version: '123',
      document: {
        id: '0:0',
        name: 'Document',
        type: 'DOCUMENT',
        children: [],
      },
      components: {},
      schemaVersion: 0,
      styles: {},
      role: 'owner',
      editorType: 'figma',
      linkAccess: 'view',
    };

    const node = FileData.findNodeById(fileData, 'non-existent');

    expect(node).toBeUndefined();
  });
});
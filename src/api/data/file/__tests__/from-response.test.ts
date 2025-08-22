import { describe, expect, it } from 'vitest';
import { FileData } from '../file.js';
import type { FigmaFile } from '../../../../types/api/responses/file-responses.js';

describe('FileData.fromResponse', () => {
  it('Figma APIレスポンスからFileDataを作成できる', () => {
    const response: FigmaFile = {
      name: 'Design System',
      lastModified: '2024-01-01T00:00:00Z',
      thumbnailUrl: 'https://figma.com/thumb.png',
      version: '987654321',
      document: { id: '0:0', name: 'Document', type: 'DOCUMENT', children: [] },
      components: {},
      componentSets: {},
      schemaVersion: 0,
      styles: {},
      role: 'owner',
      editorType: 'figma',
      linkAccess: 'view',
    };

    const fileData = FileData.fromResponse('file-key-123', response);

    expect(fileData.key).toBe('file-key-123');
    expect(fileData.name).toBe('Design System');
    expect(fileData.lastModified).toBe('2024-01-01T00:00:00Z');
    expect(fileData.version).toBe('987654321');
    expect(fileData.document).toEqual(response.document);
  });

  it('オプショナルなフィールドがない場合でも処理できる', () => {
    const minimalResponse: FigmaFile = {
      name: 'Minimal File',
      lastModified: '2024-01-01T00:00:00Z',
      thumbnailUrl: '',
      version: '123',
      document: { id: '0:0', name: 'Document', type: 'DOCUMENT', children: [] },
      components: {},
      componentSets: {},
      schemaVersion: 0,
      styles: {},
      role: 'owner',
      editorType: 'figma',
      linkAccess: 'view',
    };

    const fileData = FileData.fromResponse('minimal-key', minimalResponse);

    expect(fileData.key).toBe('minimal-key');
    expect(fileData.name).toBe('Minimal File');
    expect(fileData.thumbnailUrl).toBe('');
  });
});
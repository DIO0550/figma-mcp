import { describe, expect, it } from 'vitest';
import type { FileData } from '../file.js';

describe('FileData インターフェース', () => {
  it('必要なプロパティを持つ', () => {
    const fileData: FileData = {
      key: 'test-file-key',
      name: 'Test File',
      lastModified: '2024-01-01T00:00:00Z',
      thumbnailUrl: 'https://example.com/thumbnail.png',
      version: '123456789',
      document: { id: '0:0', name: 'Document', type: 'DOCUMENT', children: [] },
      components: {},
      schemaVersion: 0,
      styles: {},
      role: 'owner',
      editorType: 'figma',
      linkAccess: 'view',
    };

    expect(fileData.key).toBe('test-file-key');
    expect(fileData.name).toBe('Test File');
    expect(fileData.lastModified).toBe('2024-01-01T00:00:00Z');
  });
});
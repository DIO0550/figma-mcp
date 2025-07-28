export interface MockFileResponse {
  name: string;
  lastModified: string;
  editorType: string;
  thumbnailUrl: string;
  version: string;
  document: {
    id: string;
    name: string;
    type: string;
    children: unknown[];
  };
  components: Record<string, unknown>;
  componentSets: Record<string, unknown>;
  schemaVersion: number;
  styles: Record<string, unknown>;
}

export const mockFileData: Record<string, MockFileResponse> = {
  'test-file-key': {
    name: 'Test Design File',
    lastModified: '2024-01-01T00:00:00Z',
    editorType: 'figma',
    thumbnailUrl: 'https://example.com/thumbnail.png',
    version: '1234567890',
    document: {
      id: '0:0',
      name: 'Document',
      type: 'DOCUMENT',
      children: [
        {
          id: '1:2',
          name: 'Page 1',
          type: 'CANVAS',
          children: [
            {
              id: '2:3',
              name: 'Frame 1',
              type: 'FRAME',
              absoluteBoundingBox: {
                x: 0,
                y: 0,
                width: 375,
                height: 812,
              },
              backgroundColor: {
                r: 1,
                g: 1,
                b: 1,
                a: 1,
              },
              children: [],
            },
          ],
          backgroundColor: {
            r: 0.898,
            g: 0.898,
            b: 0.898,
            a: 1,
          },
        },
      ],
    },
    components: {},
    componentSets: {},
    schemaVersion: 0,
    styles: {},
  },

  default: {
    name: 'Default Mock File',
    lastModified: new Date().toISOString(),
    editorType: 'figma',
    thumbnailUrl: 'https://example.com/default-thumbnail.png',
    version: '0000000000',
    document: {
      id: '0:0',
      name: 'Document',
      type: 'DOCUMENT',
      children: [
        {
          id: '1:1',
          name: 'Page 1',
          type: 'CANVAS',
          children: [],
          backgroundColor: {
            r: 0.898,
            g: 0.898,
            b: 0.898,
            a: 1,
          },
        },
      ],
    },
    components: {},
    componentSets: {},
    schemaVersion: 0,
    styles: {},
  },
};

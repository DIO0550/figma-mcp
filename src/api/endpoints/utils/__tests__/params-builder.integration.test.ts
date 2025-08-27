import { test, expect } from 'vitest';
import { buildUrlParams } from '../params-builder.js';

test('Figma APIのget_file_nodesパラメータが正しく構築される', () => {
  const result = buildUrlParams(
    {
      depth: 2,
      geometry: 'paths',
      version: undefined,
      pluginData: false,
      branchData: true,
    },
    {
      ids: ['1:2', '3:4'],
    }
  );

  expect(result?.get('ids')).toBe('1:2,3:4');
  expect(result?.get('depth')).toBe('2');
  expect(result?.get('geometry')).toBe('paths');
  expect(result?.get('version')).toBeNull();
  expect(result?.get('plugin_data')).toBe('false');
  expect(result?.get('branch_data')).toBe('true');
});

test('export_imagesのscale配列パラメータが正しく構築される', () => {
  const result = buildUrlParams({
    ids: ['1:1', '2:2', '3:3'],
    scale: [1, 2, 3],
    format: 'png',
    svgIncludeId: true,
    svgSimplifyStroke: false,
    contentsOnly: true,
    useAbsoluteBounds: false,
  });

  expect(result?.get('ids')).toBe('1:1,2:2,3:3');
  expect(result?.get('scale')).toBe('1,2,3');
  expect(result?.get('format')).toBe('png');
  expect(result?.get('svg_include_id')).toBe('true');
  expect(result?.get('svg_simplify_stroke')).toBe('false');
  expect(result?.get('contents_only')).toBe('true');
  expect(result?.get('use_absolute_bounds')).toBe('false');
});

test('get_commentsのパラメータが正しく構築される', () => {
  const result = buildUrlParams(
    {
      asOf: '2024-01-01T00:00:00Z',
      pageSize: 100,
    },
    {
      'file-key': 'abc123',
    }
  );

  expect(result?.get('file-key')).toBe('abc123');
  expect(result?.get('as_of')).toBe('2024-01-01T00:00:00Z');
  expect(result?.get('page_size')).toBe('100');
});

test('get_versionsのページネーションパラメータが正しく構築される', () => {
  const result = buildUrlParams({
    pageSize: 50,
    before: 100,
    after: 50,
  });

  expect(result?.get('page_size')).toBe('50');
  expect(result?.get('before')).toBe('100');
  expect(result?.get('after')).toBe('50');
});

test('日本語を含むパラメータが正しくエンコードされる', () => {
  const result = buildUrlParams({
    title: 'テストタイトル',
    description: 'これは説明です',
    tags: ['タグ1', 'タグ2', 'タグ3'],
  });

  expect(result?.get('title')).toBe('テストタイトル');
  expect(result?.get('description')).toBe('これは説明です');
  expect(result?.get('tags')).toBe('タグ1,タグ2,タグ3');

  const queryString = result?.toString();
  expect(queryString).toContain('title=%E3%83%86%E3%82%B9%E3%83%88');
});

test('複雑なFigma URLを構築する際のパラメータが正しく処理される', () => {
  const fileKey = 'xyzABC123';
  const nodeIds = ['1:100', '2:200', '3:300'];

  const result = buildUrlParams(
    {
      depth: 3,
      geometry: 'paths',
      pluginData: true,
      branchData: false,
      version: '123456',
    },
    {
      ids: nodeIds,
    }
  );

  const baseUrl = `https://api.figma.com/v1/files/${fileKey}/nodes`;
  const fullUrl = `${baseUrl}?${result?.toString()}`;

  expect(fullUrl).toContain(fileKey);
  expect(fullUrl).toContain('ids=1%3A100%2C2%3A200%2C3%3A300');
  expect(fullUrl).toContain('depth=3');
  expect(fullUrl).toContain('geometry=paths');
  expect(fullUrl).toContain('plugin_data=true');
  expect(fullUrl).toContain('branch_data=false');
  expect(fullUrl).toContain('version=123456');
});

test('空の値や特殊な値を含む現実的なケースが正しく処理される', () => {
  const result = buildUrlParams({
    nodeId: '0:0',
    depth: 0,
    geometry: undefined,
    pluginData: false,
    branchData: false,
    fontSize: 0,
    opacity: 0.5,
    bounds: [0, 0, 100, 100],
  });

  expect(result?.get('node_id')).toBe('0:0');
  expect(result?.get('depth')).toBe('0');
  expect(result?.get('geometry')).toBeNull();
  expect(result?.get('plugin_data')).toBe('false');
  expect(result?.get('branch_data')).toBe('false');
  expect(result?.get('font_size')).toBe('0');
  expect(result?.get('opacity')).toBe('0.5');
  expect(result?.get('bounds')).toBe('0,0,100,100');
});

test('複数のAPIエンドポイント間でパラメータが一貫して構築される', () => {
  const fileParams = buildUrlParams({
    version: '123',
    depth: 1,
    geometry: 'paths',
    pluginData: true,
  });

  const nodesParams = buildUrlParams(
    {
      version: '123',
      depth: 1,
      geometry: 'paths',
      pluginData: true,
    },
    {
      ids: ['1:1'],
    }
  );

  expect(fileParams?.get('version')).toBe('123');
  expect(nodesParams?.get('version')).toBe('123');
  expect(fileParams?.get('depth')).toBe('1');
  expect(nodesParams?.get('depth')).toBe('1');
  expect(fileParams?.get('plugin_data')).toBe('true');
  expect(nodesParams?.get('plugin_data')).toBe('true');

  expect(nodesParams?.get('ids')).toBe('1:1');
  expect(fileParams?.get('ids')).toBeNull();
});

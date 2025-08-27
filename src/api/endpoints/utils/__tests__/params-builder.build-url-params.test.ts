import { test, expect } from 'vitest';
import { buildUrlParams } from '../params-builder.js';

test('buildUrlParams: optionsもrequiredParamsも渡さない場合はundefinedが返される', () => {
  const result = buildUrlParams(undefined, undefined);
  expect(result).toBeUndefined();
});

test('buildUrlParams: 空のオブジェクトを渡すと空のURLSearchParamsが返される', () => {
  const result = buildUrlParams({}, undefined);
  expect(result).toBeInstanceOf(URLSearchParams);
  expect(result?.toString()).toBe('');
});

test('buildUrlParams: requiredParamsのみを渡すと正しくパラメータが設定される', () => {
  const result = buildUrlParams(undefined, {
    'node-id': '1:2',
    version: 'v1.0',
  });

  expect(result?.get('node-id')).toBe('1:2');
  expect(result?.get('version')).toBe('v1.0');
});

test('buildUrlParams: requiredParamsに配列を渡すとカンマ区切りで結合される', () => {
  const result = buildUrlParams(undefined, {
    ids: ['1', '2', '3'],
  });

  expect(result?.get('ids')).toBe('1,2,3');
});

test('buildUrlParams: camelCaseのキーがsnake_caseに変換される', () => {
  const result = buildUrlParams({
    nodeId: '1:2',
    branchData: true,
    pluginData: false,
  });

  expect(result?.get('node_id')).toBe('1:2');
  expect(result?.get('branch_data')).toBe('true');
  expect(result?.get('plugin_data')).toBe('false');
});

test('buildUrlParams: undefinedの値を持つプロパティはスキップされる', () => {
  const result = buildUrlParams({
    nodeId: '1:2',
    depth: undefined,
    geometry: 'paths',
  });

  expect(result?.get('node_id')).toBe('1:2');
  expect(result?.get('depth')).toBeNull();
  expect(result?.get('geometry')).toBe('paths');
});

test('buildUrlParams: 配列、boolean、数値、文字列の値が正しく変換される', () => {
  const result = buildUrlParams({
    ids: ['a', 'b', 'c'],
    isEnabled: true,
    depth: 2,
    format: 'svg',
  });

  expect(result?.get('ids')).toBe('a,b,c');
  expect(result?.get('is_enabled')).toBe('true');
  expect(result?.get('depth')).toBe('2');
  expect(result?.get('format')).toBe('svg');
});

test('buildUrlParams: requiredParamsとoptionsの両方を渡すと両方のパラメータが設定される', () => {
  const result = buildUrlParams(
    {
      nodeId: '1:2',
      depth: 2,
    },
    {
      'file-key': 'abc123',
      version: 'v1.0',
    }
  );

  expect(result?.get('file-key')).toBe('abc123');
  expect(result?.get('version')).toBe('v1.0');
  expect(result?.get('node_id')).toBe('1:2');
  expect(result?.get('depth')).toBe('2');
});

test('buildUrlParams: 複雑なcamelCaseのキーが正しくsnake_caseに変換される', () => {
  const result = buildUrlParams({
    htmlElementId: 'test',
    apiResponseCode: 200,
    isHttpSecure: true,
    xmlHttpRequest: 'xhr',
  });

  expect(result?.get('html_element_id')).toBe('test');
  expect(result?.get('api_response_code')).toBe('200');
  expect(result?.get('is_http_secure')).toBe('true');
  expect(result?.get('xml_http_request')).toBe('xhr');
});

test('buildUrlParams: null値を持つオブジェクトを渡すと文字列"null"として処理される', () => {
  const optionsWithNull: Record<string, unknown> = {
    nullValue: null,
  };

  const result = buildUrlParams(optionsWithNull);
  expect(result?.get('null_value')).toBe('null');
});

test('buildUrlParams: 空配列は空文字列として設定される', () => {
  const result = buildUrlParams({
    emptyArray: [],
  });

  expect(result?.get('empty_array')).toBe('');
});

test('buildUrlParams: URLSearchParamsの出力が正しいクエリ文字列を生成する', () => {
  const result = buildUrlParams({
    nodeId: '1:2',
    depth: 2,
    geometry: 'paths',
    branchData: true,
  });

  const queryString = result?.toString();
  expect(queryString).toContain('node_id=1%3A2');
  expect(queryString).toContain('depth=2');
  expect(queryString).toContain('geometry=paths');
  expect(queryString).toContain('branch_data=true');
});

test('buildUrlParams: 特殊文字を含む値が正しくエンコードされる', () => {
  const result = buildUrlParams({
    query: 'hello world',
    special: '!@#$%^&*()',
    path: '/path/to/file',
  });

  const queryString = result?.toString();
  expect(queryString).toContain('query=hello+world');
  expect(queryString).toContain('special=%21%40%23%24%25%5E%26*%28%29');
  expect(queryString).toContain('path=%2Fpath%2Fto%2Ffile');
});

test('buildUrlParams: 非常に長い配列を渡しても正しく処理される', () => {
  const largeArray = Array.from({ length: 100 }, (_, i) => `item${i}`);
  const result = buildUrlParams({
    items: largeArray,
  });

  const value = result?.get('items');
  expect(value?.split(',').length).toBe(100);
  expect(value?.startsWith('item0,item1,item2')).toBe(true);
  expect(value?.endsWith('item97,item98,item99')).toBe(true);
});

test('buildUrlParams: 0やfalseの値も正しく処理される', () => {
  const result = buildUrlParams({
    count: 0,
    enabled: false,
    empty: '',
  });

  expect(result?.get('count')).toBe('0');
  expect(result?.get('enabled')).toBe('false');
  expect(result?.get('empty')).toBe('');
});

test('buildUrlParams: ネストしたプロパティ名も正しく変換される', () => {
  const result = buildUrlParams({
    parentChildRelation: 'test',
    multiWordPropertyName: 'value',
    anotherLongPropertyNameHere: 123,
  });

  expect(result?.get('parent_child_relation')).toBe('test');
  expect(result?.get('multi_word_property_name')).toBe('value');
  expect(result?.get('another_long_property_name_here')).toBe('123');
});

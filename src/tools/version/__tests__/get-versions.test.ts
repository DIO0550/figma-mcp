import { test, expect, beforeAll, afterAll } from 'vitest';
import { MockFigmaServer } from '../../../__tests__/mocks/server.js';
import { createFigmaApiClient } from '../../../api/figma-api-client.js';
import type { FigmaApiClient } from '../../../api/figma-api-client.js';
import { TestPorts } from '../../../constants/__test__/index.js';

let mockServer: MockFigmaServer;
let apiClient: FigmaApiClient;

beforeAll(async () => {
  mockServer = new MockFigmaServer(TestPorts.VERSION_TEST);
  await mockServer.start();
  apiClient = createFigmaApiClient('test-token', `http://localhost:${TestPorts.VERSION_TEST}`);
});

afterAll(async () => {
  await mockServer.stop();
});

test('有効なファイルキーでバージョン履歴を取得すると2つのバージョン情報が返される', async () => {
  const fileKey = 'test-file-key';

  const { GetVersionsTool } = await import('../get-versions.js');
  const tool = GetVersionsTool.from(apiClient);
  const result = await GetVersionsTool.execute(tool, { fileKey });

  expect(result.versions).toHaveLength(2);
  expect(result.versions[0]).toMatchObject({
    id: 'version1',
    createdAt: '2024-01-01T00:00:00Z',
    label: 'Initial design',
    description: 'First version of the design',
  });
});

test('無効なトークンでAPIリクエストを送信するとエラーがスローされる', async () => {
  const errorClient = createFigmaApiClient(
    'invalid-token',
    `http://localhost:${TestPorts.VERSION_TEST}`
  );
  const fileKey = 'test-file-key';

  const { GetVersionsTool } = await import('../get-versions.js');
  const tool = GetVersionsTool.from(errorClient);

  await expect(GetVersionsTool.execute(tool, { fileKey })).rejects.toThrow();
});

test.skip('バージョンが存在しないファイルキーで履歴を取得すると空配列を返す', async () => {
  // TODO: MockFigmaServerに空のレスポンスを返すオプションを追加してテストを実装
});

test('バージョン履歴を取得すると新しい順にソートされたバージョンが返される', async () => {
  const fileKey = 'test-file-key';

  const { GetVersionsTool } = await import('../get-versions.js');
  const tool = GetVersionsTool.from(apiClient);
  const result = await GetVersionsTool.execute(tool, { fileKey });

  expect(result.versions).toHaveLength(2);
  expect(result.versions[0].id).toBe('version1');
  expect(result.versions[1].id).toBe('version2');
});

test('各バージョンからラベルと説明の情報が正しく取得される', async () => {
  const fileKey = 'test-file-key';

  const { GetVersionsTool } = await import('../get-versions.js');
  const tool = GetVersionsTool.from(apiClient);
  const result = await GetVersionsTool.execute(tool, { fileKey });

  const version = result.versions[0];
  expect(version.label).toBe('Initial design');
  expect(version.description).toBe('First version of the design');
});

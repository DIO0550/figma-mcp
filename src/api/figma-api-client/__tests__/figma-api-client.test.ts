import { test, expect, beforeAll, afterAll } from 'vitest';
import { FigmaApiClient } from '../index.js';
import { MockFigmaServer } from '../../../__tests__/mocks/server.js';
import { TestPorts } from '../../../constants/__test__/index.js';
import type { FigmaApiClientInterface } from '../index.js';

let mockServer: MockFigmaServer;
let client: FigmaApiClientInterface;

beforeAll(async () => {
  mockServer = new MockFigmaServer(TestPorts.DEFAULT);
  await mockServer.start();
  client = FigmaApiClient.create('test-token', `http://localhost:${TestPorts.DEFAULT}`);
});

afterAll(async () => {
  await mockServer.stop();
});

test('FigmaApiClient.create - 有効なアクセストークンとbaseUrlを指定してクライアントを作成できる', () => {
  const accessToken = 'test-token';
  const baseUrl = 'https://api.test.figma.com';

  const testClient = FigmaApiClient.create(accessToken, baseUrl);

  expect(testClient).toBeDefined();
  expect(testClient.context).toBeDefined();
  expect(testClient.context.accessToken).toBe(accessToken);
  expect(testClient.context.baseUrl).toBe(baseUrl);
});

test('FigmaApiClient.fromEnv - 環境変数からクライアントを作成できる', () => {
  process.env.FIGMA_ACCESS_TOKEN = 'env-token';
  process.env.FIGMA_BASE_URL = 'https://api.env.figma.com';

  const envClient = FigmaApiClient.fromEnv();

  expect(envClient).toBeDefined();
  expect(envClient.context.accessToken).toBe('env-token');
  expect(envClient.context.baseUrl).toBe('https://api.env.figma.com');

  delete process.env.FIGMA_ACCESS_TOKEN;
  delete process.env.FIGMA_BASE_URL;
});

test('FigmaApiClient.getFile - ファイル情報を取得できる', async () => {
  const result = await FigmaApiClient.getFile(client, 'test-file-key');

  expect(result).toBeDefined();
  expect(result.name).toBe('Test Design File');
  expect(result.document).toBeDefined();
});

test('FigmaApiClient.getComponents - コンポーネント情報を取得できる', async () => {
  const result = await FigmaApiClient.getComponents(client, 'test-file-key');

  expect(result).toBeDefined();
  expect(result.meta).toBeDefined();
  expect(result.meta.components).toBeDefined();
  expect(Array.isArray(result.meta.components)).toBe(true);
});

test('FigmaApiClient.getStyles - スタイル情報を取得できる', async () => {
  const result = await FigmaApiClient.getStyles(client, 'test-file-key');

  expect(result).toBeDefined();
  expect(result.meta).toBeDefined();
  expect(result.meta.styles).toBeDefined();
  expect(Array.isArray(result.meta.styles)).toBe(true);
});

test('FigmaApiClient.exportImages - 画像をエクスポートできる', async () => {
  const result = await FigmaApiClient.exportImages(client, 'test-file-key', {
    ids: ['1:2'],
    format: 'png',
  });

  expect(result).toBeDefined();
  expect(result.images).toBeDefined();
});

test('FigmaApiClient.getComments - コメントを取得できる', async () => {
  const result = await FigmaApiClient.getComments(client, 'test-file-key');

  expect(result).toBeDefined();
  expect(result.comments).toBeDefined();
  expect(Array.isArray(result.comments)).toBe(true);
});

test('FigmaApiClient.getVersions - バージョン履歴を取得できる', async () => {
  const result = await FigmaApiClient.getVersions(client, 'test-file-key');

  expect(result).toBeDefined();
  expect(result.versions).toBeDefined();
  expect(Array.isArray(result.versions)).toBe(true);
});

test('FigmaApiClient.getTeamProjects - チームプロジェクトを取得できる', async () => {
  const result = await FigmaApiClient.getTeamProjects(client, 'test-team-id');

  expect(result).toBeDefined();
  expect(result.projects).toBeDefined();
  expect(Array.isArray(result.projects)).toBe(true);
});

test('FigmaApiClient.getProjectFiles - プロジェクトファイルを取得できる', async () => {
  const result = await FigmaApiClient.getProjectFiles(client, 'test-project-id');

  expect(result).toBeDefined();
  expect(result.files).toBeDefined();
  expect(Array.isArray(result.files)).toBe(true);
});

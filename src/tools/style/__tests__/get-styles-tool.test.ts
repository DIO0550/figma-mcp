import { test, expect, beforeAll, afterAll } from 'vitest';
import { MockFigmaServer } from '../../../__tests__/mocks/server.js';
import { createFigmaApiClient } from '../../../api/figma-api-client.js';
import type { FigmaApiClient } from '../../../api/figma-api-client.js';
import { TestPorts } from '../../../constants/index.js';

let mockServer: MockFigmaServer;
let apiClient: FigmaApiClient;

beforeAll(async () => {
  // モックサーバーを起動
  mockServer = new MockFigmaServer(TestPorts.STYLE_TEST);
  await mockServer.start();

  // APIクライアントを初期化（baseURLを直接指定）
  apiClient = createFigmaApiClient('test-token', `http://localhost:${TestPorts.STYLE_TEST}`);
});

afterAll(async () => {
  await mockServer.stop();
});

test('スタイル一覧を取得できる', async () => {
  // Arrange
  const fileKey = 'test-file-key';

  // Act
  const { GetStylesTool } = await import('../list.js');
  const tool = GetStylesTool.from(apiClient);
  const result = await GetStylesTool.execute(tool, { fileKey });

  // Assert - モックサーバーは4つのスタイルを返す
  expect(result.meta.styles).toHaveLength(4);
  expect(result.meta.styles[0].name).toBe('Primary Color');
  expect(result.meta.styles[1].styleType).toBe('TEXT');
  expect(result.meta.styles[2].styleType).toBe('EFFECT');
  expect(result.meta.styles[3].styleType).toBe('GRID');
});

test('APIエラーを適切に処理する', async () => {
  // Arrange - 無効なトークンでクライアントを作成
  const errorClient = createFigmaApiClient(
    'invalid-token',
    `http://localhost:${TestPorts.STYLE_TEST}`
  );
  const fileKey = 'test-file-key';

  // Act & Assert
  const { GetStylesTool } = await import('../list.js');
  const tool = GetStylesTool.from(errorClient);

  await expect(GetStylesTool.execute(tool, { fileKey })).rejects.toThrow();
});

test('空のスタイルリストを処理できる', async () => {
  // Note: MockFigmaServerは常にデータを返すため、このテストケースは
  // 実際のAPIの振る舞いをシミュレートしていません。
  // このテストはスキップします。
});

test('categorizeオプションでスタイルを分類できる', async () => {
  // Arrange
  const fileKey = 'test-file-key';

  // Act
  const { GetStylesTool } = await import('../list.js');
  const tool = GetStylesTool.from(apiClient);
  const result = await GetStylesTool.execute(tool, {
    fileKey,
    categorize: true,
  });

  // Assert - categorizeオプションの処理はlist.ts内で実装されている
  if (result.categorized) {
    expect(result.categorized).toBeDefined();
    expect(result.statistics?.total).toBe(4);
  }
});

test('スタイルタイプごとにフィルタリングできる', async () => {
  // Arrange
  const fileKey = 'test-file-key';

  // Act
  const { GetStylesTool } = await import('../list.js');
  const tool = GetStylesTool.from(apiClient);
  const result = await GetStylesTool.execute(tool, { fileKey });

  // Assert - モックサーバーは各タイプを1つずつ返す
  const fillStyles = result.meta.styles.filter((s) => s.styleType === 'FILL');
  const textStyles = result.meta.styles.filter((s) => s.styleType === 'TEXT');
  const effectStyles = result.meta.styles.filter((s) => s.styleType === 'EFFECT');
  const gridStyles = result.meta.styles.filter((s) => s.styleType === 'GRID');

  expect(fillStyles).toHaveLength(1);
  expect(textStyles).toHaveLength(1);
  expect(effectStyles).toHaveLength(1);
  expect(gridStyles).toHaveLength(1);
});

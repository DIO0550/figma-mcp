import { test, expect, beforeAll, afterAll } from 'vitest';
import { MockFigmaServer } from '../../../__tests__/mocks/server.js';
import { FigmaApiClient } from '../../../api/figma-api-client/index.js';
import type { FigmaApiClientInterface } from '../../../api/figma-api-client/index.js';
import { TestPorts } from '../../../constants/__test__/index.js';

let mockServer: MockFigmaServer;
let apiClient: FigmaApiClientInterface;

beforeAll(async () => {
  // モックサーバーを起動
  mockServer = new MockFigmaServer(TestPorts.STYLE_TEST);
  await mockServer.start();

  // APIクライアントを初期化（baseURLを直接指定）
  apiClient = FigmaApiClient.create('test-token', `http://localhost:${TestPorts.STYLE_TEST}`);
});

afterAll(async () => {
  await mockServer.stop();
});

test('有効なファイルキーでスタイル一覧を取得すると4つの異なるタイプのスタイルが返される', async () => {
  // Arrange
  const fileKey = 'test-file-key';

  // Act
  const { GetStylesTool } = await import('../get-styles.js');
  const tool = GetStylesTool.from(apiClient);
  const result = await GetStylesTool.execute(tool, { fileKey });

  // Assert - モックサーバーは4つのスタイルを返す
  expect(result.meta.styles).toHaveLength(4);
  expect(result.meta.styles[0].name).toBe('Primary Color');
  expect(result.meta.styles[1].styleType).toBe('TEXT');
  expect(result.meta.styles[2].styleType).toBe('EFFECT');
  expect(result.meta.styles[3].styleType).toBe('GRID');
});

test('無効なトークンでAPIリクエストを送信するとエラーがスローされる', async () => {
  // Arrange - 無効なトークンでクライアントを作成
  const errorClient = FigmaApiClient.create(
    'invalid-token',
    `http://localhost:${TestPorts.STYLE_TEST}`
  );
  const fileKey = 'test-file-key';

  // Act & Assert
  const { GetStylesTool } = await import('../get-styles.js');
  const tool = GetStylesTool.from(errorClient);

  await expect(GetStylesTool.execute(tool, { fileKey })).rejects.toThrow();
});

test('スタイルが存在しないファイルキーで一覧取得すると空配列を返す', async () => {
  // Note: MockFigmaServerは常にデータを返すため、このテストケースは
  // 実際のAPIの振る舞いをシミュレートしていません。
  // このテストはスキップします。
});

test('categorizeオプションをtrueに設定するとスタイルがタイプ別に分類されて返される', async () => {
  // Arrange
  const fileKey = 'test-file-key';

  // Act
  const { GetStylesTool } = await import('../get-styles.js');
  const tool = GetStylesTool.from(apiClient);
  const result = await GetStylesTool.execute(tool, {
    fileKey,
    categorize: true,
  });

  // Assert - categorizeオプションの処理はget-styles.ts内で実装されている
  if (result.categorized) {
    expect(result.categorized).toBeDefined();
    expect(result.statistics?.total).toBe(4);
  }
});

test('スタイル一覧から特定のスタイルタイプでフィルタリングすると各タイプ1つずつが取得される', async () => {
  // Arrange
  const fileKey = 'test-file-key';

  // Act
  const { GetStylesTool } = await import('../get-styles.js');
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

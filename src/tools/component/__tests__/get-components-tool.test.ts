import { test, expect, beforeAll, afterAll } from 'vitest';
import { FigmaApiClient } from '../../../api/figma-api-client.js';
import { MockFigmaServer } from '../../../__tests__/mocks/server.js';
import { GetComponentsTool } from '../get-components.js';

let mockServer: MockFigmaServer;
let apiClient: FigmaApiClient;
let tool: GetComponentsTool;

beforeAll(async () => {
  // モックサーバーを起動
  mockServer = new MockFigmaServer(3005);
  await mockServer.start();

  // 実際のAPIクライアントを作成（モックサーバーに接続）
  apiClient = FigmaApiClient.create('test-token', 'http://localhost:3005');

  // ツールインスタンスを作成
  tool = GetComponentsTool.from(apiClient);
});

afterAll(async () => {
  await mockServer.stop();
});

test('コンポーネント一覧を取得できる', async () => {
  // Arrange
  const fileKey = 'test-file-key';

  // Act
  const result = await GetComponentsTool.execute(tool, { fileKey });

  // Assert
  expect(result).toBeDefined();
  expect(result.meta).toBeDefined();
  expect(result.meta.components).toBeDefined();
  expect(Array.isArray(result.meta.components)).toBe(true);
  expect(result.meta.components.length).toBeGreaterThan(0);

  const firstComponent = result.meta.components[0];
  expect(firstComponent.key).toBeDefined();
  expect(firstComponent.name).toBeDefined();
  expect(firstComponent.fileKey).toBe(fileKey);
});

test('空のコンポーネントリストを処理できる', async () => {
  // Arrange
  const fileKey = 'empty-file-key';

  // Act
  const result = await GetComponentsTool.execute(tool, { fileKey });

  // Assert
  expect(result).toBeDefined();
  expect(result.meta).toBeDefined();
  expect(result.meta.components).toBeDefined();
  expect(Array.isArray(result.meta.components)).toBe(true);
  expect(result.meta.components).toHaveLength(0);
});

test('analyzeMetadataオプションでメタデータ分析を含む', async () => {
  // Arrange
  const fileKey = 'test-file-key';

  // Act
  const result = await GetComponentsTool.execute(tool, {
    fileKey,
    analyzeMetadata: true,
  });

  // Assert
  expect(result).toBeDefined();
  expect(result.analysis).toBeDefined();
  expect(result.analysis?.totalComponents).toBeGreaterThan(0);
  expect(result.analysis?.categories).toBeDefined();
  expect(result.analysis?.namingPatterns).toBeDefined();
  expect(result.analysis?.pagesDistribution).toBeDefined();
  expect(result.analysis?.descriptionCoverage).toBeDefined();
  expect(result.analysis?.descriptionCoverage).toBeGreaterThanOrEqual(0);
  expect(result.analysis?.descriptionCoverage).toBeLessThanOrEqual(1);
});

test('organizeVariantsオプションでバリアント情報を整理する', async () => {
  // Arrange
  const fileKey = 'test-file-key';

  // Act
  const result = await GetComponentsTool.execute(tool, {
    fileKey,
    organizeVariants: true,
  });

  // Assert
  expect(result).toBeDefined();
  expect(result.variantSets).toBeDefined();

  // バリアントセットが存在する場合の検証
  const variantSetKeys = Object.keys(result.variantSets || {});
  if (variantSetKeys.length > 0) {
    const firstSetKey = variantSetKeys[0];
    const firstSet = result.variantSets![firstSetKey];
    expect(firstSet.name).toBeDefined();
    expect(firstSet.variants).toBeDefined();
    expect(Array.isArray(firstSet.variants)).toBe(true);
    expect(firstSet.properties).toBeDefined();
  }
});

test('複数のオプションを同時に使用できる', async () => {
  // Arrange
  const fileKey = 'test-file-key';

  // Act
  const result = await GetComponentsTool.execute(tool, {
    fileKey,
    analyzeMetadata: true,
    organizeVariants: true,
  });

  // Assert
  expect(result).toBeDefined();
  expect(result.analysis).toBeDefined();
  expect(result.variantSets).toBeDefined();
  expect(result.meta).toBeDefined();
  expect(result.meta.components).toBeDefined();
});

test('存在しないファイルでエラーが返される', async () => {
  // Arrange
  const fileKey = 'non-existent-file';

  // Act & Assert
  await expect(GetComponentsTool.execute(tool, { fileKey })).rejects.toThrow();
});

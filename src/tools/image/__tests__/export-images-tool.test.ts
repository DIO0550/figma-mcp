import { test, expect, beforeAll, afterAll } from 'vitest';
import { FigmaApiClient } from '../../../api/figma-api-client.js';
import { MockFigmaServer } from '../../../__tests__/mocks/server.js';
import { ExportImagesTool } from '../export.js';

let mockServer: MockFigmaServer;
let apiClient: FigmaApiClient;
let exportImagesTool: ExportImagesTool;

beforeAll(async () => {
  // モックサーバーを起動
  mockServer = new MockFigmaServer(3004);
  await mockServer.start();

  // 実際のAPIクライアントを作成（モックサーバーに接続）
  apiClient = FigmaApiClient.create('test-token', 'http://localhost:3004');

  // ツールインスタンスを作成
  exportImagesTool = ExportImagesTool.from(apiClient);
});

afterAll(async () => {
  await mockServer.stop();
});

test('指定したノードIDで画像をエクスポートするとURLのマップが返される', async () => {
  // Arrange
  const fileKey = 'test-file-key';
  const ids = ['1:2', '3:4'];
  const format = 'png';
  const scale = 2;

  // Act
  const result = await ExportImagesTool.execute(exportImagesTool, {
    fileKey,
    ids,
    format,
    scale,
  });

  // Assert
  expect(result).toBeDefined();
  expect(result.images).toBeDefined();
  expect(Object.keys(result.images)).toHaveLength(2);
  expect(result.images['1:2']).toContain('.png');
  expect(result.images['3:4']).toContain('.png');
});

test('フォーマットを指定しない場合はデフォルトでPNG形式でエクスポートされる', async () => {
  // Arrange
  const fileKey = 'test-file-key';
  const ids = ['1:2'];

  // Act
  const result = await ExportImagesTool.execute(exportImagesTool, { fileKey, ids });

  // Assert
  expect(result).toBeDefined();
  expect(result.images).toBeDefined();
  expect(result.images['1:2']).toContain('.png');
});

test('指定したファイルキーとノードIDでformat=svgを指定するとSVGでエクスポートされる', async () => {
  // Arrange
  const fileKey = 'test-file-key';
  const ids = ['1:2', '3:4'];
  const format = 'svg';

  // Act
  const result = await ExportImagesTool.execute(exportImagesTool, { fileKey, ids, format });

  // Assert
  expect(result).toBeDefined();
  expect(result.images).toBeDefined();
  expect(result.images['1:2']).toContain('.svg');
  expect(result.images['3:4']).toContain('.svg');
});

test('指定したファイルキーとノードIDでscale=3を指定すると3倍解像度でエクスポートされる', async () => {
  // Arrange
  const fileKey = 'test-file-key';
  const ids = ['1:2'];
  const scale = 3;

  // Act
  const result = await ExportImagesTool.execute(exportImagesTool, { fileKey, ids, scale });

  // Assert
  expect(result).toBeDefined();
  expect(result.images).toBeDefined();
  expect(result.images['1:2']).toContain('scale=3');
});

test('複数のオプションを同時に指定するとすべての設定が適用された画像がエクスポートされる', async () => {
  // Arrange
  const fileKey = 'test-file-key';
  const options = {
    ids: ['1:2', '3:4', '5:6'],
    format: 'jpg' as const,
    scale: 2,
    contentsOnly: true,
    useAbsoluteBounds: true,
  };

  // Act
  const result = await ExportImagesTool.execute(exportImagesTool, { fileKey, ...options });

  // Assert
  expect(result).toBeDefined();
  expect(result.images).toBeDefined();
  expect(Object.keys(result.images)).toHaveLength(3);
  expect(result.images['1:2']).toContain('.jpg');
  expect(result.images['3:4']).toContain('.jpg');
  expect(result.images['5:6']).toContain('.jpg');
});

test('存在しないノードIDを指定するとエラー情報が含まれた結果が返される', async () => {
  // Arrange
  const fileKey = 'test-file-key';
  const ids = ['non-existent-node'];

  // Act
  const result = await ExportImagesTool.execute(exportImagesTool, { fileKey, ids });

  // Assert
  expect(result).toBeDefined();
  expect(result.err).toBeDefined();
});

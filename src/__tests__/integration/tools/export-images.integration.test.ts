import { describe, test, expect, beforeAll, afterAll, vi } from 'vitest';
import {
  setupTestEnvironment,
  teardownTestEnvironment,
  type TestContext,
} from '../../helpers/setup.js';
import type { MCPTestClient } from '../../helpers/mcp-client.js';

// モックサーバーを使用するために環境変数を設定
vi.stubEnv('FIGMA_API_BASE_URL', 'http://localhost:3001');

describe('export_images Tool Integration', () => {
  let context: TestContext;
  let client!: MCPTestClient;

  beforeAll(async () => {
    context = await setupTestEnvironment();
    client = context.mcpClient;
  });

  afterAll(async () => {
    await teardownTestEnvironment(context);
  });

  test('画像を正常にエクスポートできる', async () => {
    const result = await client.callTool('export_images', {
      fileKey: 'test-file-key',
      ids: ['2:3'],
    });

    expect(result).toHaveProperty('content');
    expect(result.content).toHaveLength(1);
    expect(result.content[0]).toHaveProperty('type', 'text');

    const content = JSON.parse(result.content[0].text) as { images: Record<string, string> };
    expect(content).toHaveProperty('images');
    expect(content.images).toHaveProperty('2:3');
    expect(content.images['2:3']).toMatch(
      /^https:\/\/example\.com\/export\/test-file-key\/2:3\.png/
    );
  });

  test('複数のノードを一度にエクスポートできる', async () => {
    const result = await client.callTool('export_images', {
      fileKey: 'test-file-key',
      ids: ['2:3', '2:4', '2:5'],
    });

    const content = JSON.parse(result.content[0].text) as { images: Record<string, string> };
    expect(content.images).toHaveProperty('2:3');
    expect(content.images).toHaveProperty('2:4');
    expect(content.images).toHaveProperty('2:5');
    expect(Object.keys(content.images)).toHaveLength(3);
  });

  test('フォーマットを指定できる', async () => {
    const result = await client.callTool('export_images', {
      fileKey: 'test-file-key',
      ids: ['2:3'],
      format: 'svg',
    });

    const content = JSON.parse(result.content[0].text) as { images: Record<string, string> };
    expect(content.images['2:3']).toMatch(/\.svg\?/);
  });

  test('スケールを指定できる', async () => {
    const result = await client.callTool('export_images', {
      fileKey: 'test-file-key',
      ids: ['2:3'],
      scale: 2,
    });

    const content = JSON.parse(result.content[0].text) as { images: Record<string, string> };
    expect(content.images).toHaveProperty('2:3');
    // モックサーバーではスケールの効果はシミュレートしていないが、
    // エラーなく処理されることを確認
  });

  test('必須パラメータが不足している場合エラーが返される', async () => {
    const result = await client.callTool('export_images', {
      fileKey: 'test-file-key',
      // idsが不足
    });
    expect(result).toHaveProperty('isError', true);
    expect(result.content[0].text).toContain('Error');
  });
});

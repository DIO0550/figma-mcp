import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import {
  setupTestEnvironment,
  teardownTestEnvironment,
  type TestContext,
} from '../../helpers/setup.js';
import type { MCPTestClient } from '../../helpers/mcp-client.js';
import { TestData } from '../../../constants/index.js';

describe('get_components Tool Integration', () => {
  let context: TestContext;
  let client!: MCPTestClient;

  beforeAll(async () => {
    context = await setupTestEnvironment();
    client = context.mcpClient;
  });

  afterAll(async () => {
    await teardownTestEnvironment(context);
  });

  test('コンポーネント一覧を正常に取得できる', async () => {
    const result = await client.callTool('get_components', {
      fileKey: TestData.FILE_KEY,
    });

    expect(result).toHaveProperty('content');
    expect(result.content).toHaveLength(1);
    expect(result.content[0]).toHaveProperty('type', 'text');

    const content = JSON.parse(result.content[0].text) as {
      meta: { components: Array<Record<string, unknown>> };
    };
    expect(content).toHaveProperty('meta');
    expect(content.meta).toHaveProperty('components');
    expect(Array.isArray(content.meta.components)).toBe(true);
    expect(content.meta.components).toHaveLength(2);

    const component = content.meta.components[0];
    expect(component).toHaveProperty('key');
    expect(component).toHaveProperty('name', 'Button Component');
    expect(component).toHaveProperty('description');
    expect(component).toHaveProperty('fileKey', TestData.FILE_KEY);
  });

  test('空のコンポーネントリストが正常に処理される', async () => {
    const result = await client.callTool('get_components', {
      fileKey: TestData.EMPTY_FILE_KEY,
    });

    expect(result).toHaveProperty('content');
    const content = JSON.parse(result.content[0].text) as { meta: { components: unknown } };
    expect(content.meta.components).toBeDefined();
  });

  test('必須パラメータが不足している場合エラーが返される', async () => {
    const result = await client.callTool('get_components', {});
    expect(result).toHaveProperty('isError', true);
    expect(result.content[0].text).toContain('Error');
  });
});

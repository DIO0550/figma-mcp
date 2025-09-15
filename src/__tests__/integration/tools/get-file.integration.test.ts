import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import {
  setupTestEnvironment,
  teardownTestEnvironment,
  type TestContext,
} from '../../helpers/setup.js';
import type { MCPTestClient } from '../../helpers/mcp-client.js';
import { TestData } from '../../../constants/__test__/index.js';

describe('get_file Tool Integration', () => {
  let context: TestContext;
  let client!: MCPTestClient;

  beforeAll(async () => {
    context = await setupTestEnvironment();
    client = context.mcpClient;
  });

  afterAll(async () => {
    await teardownTestEnvironment(context);
  });

  test('ファイル情報を正常に取得できる', async () => {
    const result = await client.callTool('get_file', {
      file_key: TestData.FILE_KEY,
    });

    expect(result).toHaveProperty('content');
    expect(result.content).toHaveLength(1);
    expect(result.content[0]).toHaveProperty('type', 'text');

    const content = JSON.parse(result.content[0].text) as Record<string, unknown>;
    expect(content).toHaveProperty('name', 'Test Design File');
    expect(content).toHaveProperty('lastModified');
    // documentはサマリーに含まれない可能性があるため、基本的なプロパティのみをチェック
    expect(content).toHaveProperty('editorType');
    expect(content).toHaveProperty('version');
  });

  test('存在しないファイルで適切なエラーが返される', async () => {
    const result = await client.callTool('get_file', {
      file_key: TestData.NON_EXISTENT_FILE_KEY,
    });
    expect(result).toHaveProperty('isError', true);
    expect(result.content[0].text).toContain('Error');
  });

  test('必須パラメータが不足している場合エラーが返される', async () => {
    const result = await client.callTool('get_file', {});

    expect(result).toHaveProperty('isError', true);
    expect(result.content[0].text).toContain('Error');
  });

  test('versionパラメータを指定できる', async () => {
    const result = await client.callTool('get_file', {
      file_key: TestData.FILE_KEY,
      version: '1234567890',
    });

    expect(result).toHaveProperty('content');
    expect(result.content).toHaveLength(1);
    // パラメータが正しく渡されていることを確認
    // モックサーバーではversionパラメータの効果はシミュレートしていない
    expect(result.isError).toBeFalsy();
  });

  test('geometryパラメータを指定できる', async () => {
    const result = await client.callTool('get_file', {
      file_key: TestData.FILE_KEY,
      geometry: 'paths',
    });

    expect(result).toHaveProperty('content');
    // モックサーバーではgeometryパラメータの効果はシミュレートしていないが、
    // エラーなく処理されることを確認
  });

  test('大きなファイルでもタイムアウトしない', async () => {
    // デフォルトのタイムアウト時間内に応答が返ることを確認
    const startTime = Date.now();

    const result = await client.callTool('get_file', {
      file_key: TestData.FILE_KEY,
    });

    const elapsed = Date.now() - startTime;
    expect(elapsed).toBeLessThan(5000); // 5秒以内
    expect(result).toHaveProperty('content');
  });
});

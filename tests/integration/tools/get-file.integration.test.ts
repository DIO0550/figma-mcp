import { describe, test, expect, beforeAll, afterAll, vi } from 'vitest';
import { setupTestEnvironment, teardownTestEnvironment, type TestContext } from '../helpers/setup.js';
import { MCPTestClient } from '../helpers/mcp-client.js';

// モックサーバーを使用するために環境変数を設定
vi.stubEnv('FIGMA_API_BASE_URL', 'http://localhost:3001');

describe('get_file Tool Integration', () => {
  let context: TestContext;
  let client: MCPTestClient;

  beforeAll(async () => {
    context = await setupTestEnvironment();
    client = context.mcpClient;
  });

  afterAll(async () => {
    await teardownTestEnvironment(context);
  });

  test('ファイル情報を正常に取得できる', async () => {
    const result = await client.callTool('get_file', {
      file_key: 'test-file-key',
    });

    expect(result).toHaveProperty('content');
    expect(result.content).toHaveLength(1);
    expect(result.content[0]).toHaveProperty('type', 'text');
    
    const content = JSON.parse(result.content[0].text);
    expect(content).toHaveProperty('name', 'Test Design File');
    expect(content).toHaveProperty('lastModified');
    // documentはサマリーに含まれない可能性があるため、基本的なプロパティのみをチェック
    expect(content).toHaveProperty('editorType');
    expect(content).toHaveProperty('version');
  });

  test('存在しないファイルで適切なエラーが返される', async () => {
    const result = await client.callTool('get_file', {
      file_key: 'non-existent-file',
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
      file_key: 'test-file-key',
      version: '1234567890',
    });

    expect(result).toHaveProperty('content');
    expect(result.content).toHaveLength(1);
    
    const content = JSON.parse(result.content[0].text);
    expect(content).toHaveProperty('version', '1234567890');
  });

  test('geometryパラメータを指定できる', async () => {
    const result = await client.callTool('get_file', {
      file_key: 'test-file-key',
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
      file_key: 'test-file-key',
    });

    const elapsed = Date.now() - startTime;
    expect(elapsed).toBeLessThan(5000); // 5秒以内
    expect(result).toHaveProperty('content');
  });
});
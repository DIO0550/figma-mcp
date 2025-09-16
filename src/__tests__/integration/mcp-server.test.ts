import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import {
  setupTestEnvironment,
  teardownTestEnvironment,
  type TestContext,
} from '../helpers/setup.js';
import { MCPTestClient } from '../helpers/mcp-client.js';
import { join } from 'path';
import { TestPorts } from '../../constants/__test__/index.js';

describe('MCP Server Integration', () => {
  let context: TestContext;
  let client: MCPTestClient;

  beforeAll(async () => {
    context = await setupTestEnvironment();
    client = context.mcpClient;
  });

  afterAll(async () => {
    await teardownTestEnvironment(context);
  });

  describe('Server Initialization', () => {
    test('サーバーが正常に起動する', async () => {
      // サーバーが起動して初期化が完了していることを確認
      // 初期化が成功していれば、ツールリストを取得できる
      const tools = await client.listTools();
      expect(tools).toBeDefined();
      expect(tools).toHaveProperty('tools');
    });

    test('MCPプロトコルバージョンをサポートしている', async () => {
      // 再度初期化を試みて、プロトコルバージョンが受け入れられることを確認
      const client2 = new MCPTestClient(join(process.cwd(), 'dist', 'index.js'), {
        FIGMA_ACCESS_TOKEN: 'test-token',
      });

      await client2.connect();
      const initResult = await client2.initialize('0.1.0');
      expect(initResult).toBeDefined();
      expect(initResult).toHaveProperty('protocolVersion');
      client2.disconnect();
    });
  });

  describe('Tool Registration', () => {
    test('利用可能なツール一覧を取得できる', async () => {
      const tools = await client.listTools();

      expect(tools).toHaveProperty('tools');
      expect(Array.isArray(tools.tools)).toBe(true);

      // 期待されるツールが登録されていることを確認
      const toolNames = tools.tools.map((tool) => tool.name);
      const expectedTools = [
        'get_file',
        'get_file_nodes',
        'get_components',
        'get_styles',
        'export_images',
        'get_comments',
        'get_versions',
        'parse_figma_url',
      ];

      expectedTools.forEach((toolName) => {
        expect(toolNames).toContain(toolName);
      });
    });

    test('各ツールが正しいスキーマを持っている', async () => {
      const tools = await client.listTools();

      tools.tools.forEach((tool) => {
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('inputSchema');

        // inputSchemaが有効なJSONスキーマであることを確認
        const schema = tool.inputSchema;
        expect(schema).toHaveProperty('type');
        expect(schema).toHaveProperty('properties');

        expect(schema).toHaveProperty('required');
      });
    });
  });

  describe('Tool Execution', () => {
    test('get_fileツールが正常に実行できる', async () => {
      // モックサーバーが起動していることを前提
      const result = await client.callTool('get_file', {
        file_key: 'test-file-key',
      });

      expect(result).toHaveProperty('content');
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
    });

    test('無効なツール名でエラーが返される', async () => {
      const result = await client.callTool('invalid_tool', {});
      expect(result).toHaveProperty('isError', true);
      expect(result.content[0].text).toContain('Unknown tool');
    });

    test('必須パラメータが不足している場合エラーが返される', async () => {
      const result = await client.callTool('get_file', {}); // file_keyが不足
      expect(result).toHaveProperty('isError', true);
      expect(result.content[0].text).toContain('Error');
    });
  });

  describe('Error Handling', () => {
    test('Figma APIエラーが適切にハンドリングされる', async () => {
      // 存在しないファイルキーでテスト
      const result = await client.callTool('get_file', {
        file_key: 'non-existent-file',
      });
      expect(result).toHaveProperty('isError', true);
      expect(result.content[0].text).toContain('Error');
    });

    test('認証エラーが適切にハンドリングされる', async () => {
      // 別のクライアントを無効なトークンで作成
      const serverPath = join(process.cwd(), 'dist', 'index.js');
      const invalidClient = new MCPTestClient(serverPath, {
        FIGMA_ACCESS_TOKEN: 'invalid-token',
        FIGMA_API_BASE_URL: `http://localhost:${TestPorts.DEFAULT}`,
      });

      await invalidClient.connect();
      await invalidClient.initialize();

      const result = await invalidClient.callTool('get_file', {
        file_key: 'test-file-key',
      });
      expect(result).toHaveProperty('isError', true);
      expect(result.content[0].text).toContain('Error');

      invalidClient.disconnect();
    });
  });
});

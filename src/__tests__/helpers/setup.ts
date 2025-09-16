import { MockFigmaServer } from '../mocks/server.js';
import { MCPTestClient } from './mcp-client.js';
import { join } from 'path';
import { TestPorts } from '../../constants/__test__/index.js';

export interface TestContext {
  mockServer: MockFigmaServer;
  mcpClient: MCPTestClient;
}

// Re-export MCPTestClient to avoid ESLint import issues
export { MCPTestClient } from './mcp-client.js';

export async function setupTestEnvironment(): Promise<TestContext> {
  // モックサーバーを起動
  const mockServer = new MockFigmaServer(TestPorts.DEFAULT);
  await mockServer.start();

  // MCPクライアントを作成
  const serverPath = join(process.cwd(), 'dist', 'index.js');
  const mcpClient = new MCPTestClient(serverPath, {
    FIGMA_ACCESS_TOKEN: 'test-token',
    FIGMA_API_BASE_URL: `http://localhost:${TestPorts.DEFAULT}`,
  });

  // サーバーに接続
  await mcpClient.connect();

  // MCPプロトコルを初期化
  await mcpClient.initialize();

  return { mockServer, mcpClient };
}

export async function teardownTestEnvironment(context: TestContext): Promise<void> {
  // クライアントを切断
  if (context.mcpClient) {
    context.mcpClient.disconnect();
  }

  // モックサーバーを停止
  if (context.mockServer) {
    await context.mockServer.stop();
  }
}

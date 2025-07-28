import { spawn, type ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

interface MCPMessage {
  jsonrpc: '2.0';
  id?: number;
  method?: string;
  params?: Record<string, unknown>;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

interface MCPToolsListResponse {
  tools: MCPTool[];
}

interface MCPToolCallResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError?: boolean;
}

interface MCPInitializeResponse {
  protocolVersion: string;
  capabilities: Record<string, unknown>;
  serverInfo?: {
    name: string;
    version: string;
  };
}

export class MCPTestClient extends EventEmitter {
  private process!: ChildProcess;
  private messageBuffer: string = '';
  private pendingRequests: Map<
    number,
    {
      resolve: (value: unknown) => void;
      reject: (error: Error) => void;
    }
  > = new Map();
  private requestId: number = 1;

  constructor(
    private serverPath: string,
    private env: Record<string, string> = {}
  ) {
    super();
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.process = spawn('node', [this.serverPath], {
        env: {
          ...process.env,
          ...this.env,
        },
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      this.process.stdout?.on('data', (data: Buffer) => {
        this.handleData(data.toString());
      });

      this.process.stderr?.on('data', (data: Buffer) => {
        console.error('Server error:', data.toString());
      });

      this.process.on('error', (error) => {
        reject(error);
      });

      this.process.on('exit', (code) => {
        this.emit('exit', code);
      });

      // サーバーが起動するまで少し待つ
      setTimeout(() => resolve(), 100);
    });
  }

  disconnect(): void {
    if (this.process && !this.process.killed) {
      this.process.kill();
    }
  }

  private handleData(data: string): void {
    this.messageBuffer += data;
    const lines = this.messageBuffer.split('\n');

    // 最後の不完全な行を保持
    this.messageBuffer = lines.pop() || '';

    for (const line of lines) {
      if (line.trim()) {
        try {
          const message = JSON.parse(line) as MCPMessage;
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse message:', line, error);
        }
      }
    }
  }

  private handleMessage(message: MCPMessage): void {
    if (message.id !== undefined && this.pendingRequests.has(message.id)) {
      // リクエストへのレスポンス
      const { resolve, reject } = this.pendingRequests.get(message.id)!;
      this.pendingRequests.delete(message.id);

      if (message.error) {
        reject(new Error(message.error.message));
      } else {
        resolve(message.result);
      }
    } else if (message.method) {
      // 通知メッセージ
      this.emit('notification', message);
    }
  }

  async request<TResult = unknown, TParams = Record<string, unknown>>(
    method: string,
    params?: TParams
  ): Promise<TResult> {
    const id = this.requestId++;
    const request: MCPMessage = {
      jsonrpc: '2.0',
      id,
      method,
      params: params as Record<string, unknown>,
    };

    return new Promise<TResult>((resolve, reject) => {
      this.pendingRequests.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
      });

      // リクエストを送信
      this.process.stdin?.write(JSON.stringify(request) + '\n');

      // タイムアウト設定
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 5000);
    });
  }

  async initialize(protocolVersion: string = '0.1.0'): Promise<MCPInitializeResponse> {
    return this.request<MCPInitializeResponse>('initialize', {
      protocolVersion,
      capabilities: {},
      clientInfo: {
        name: 'mcp-test-client',
        version: '1.0.0',
      },
    });
  }

  async listTools(): Promise<MCPToolsListResponse> {
    return this.request<MCPToolsListResponse>('tools/list');
  }

  async callTool(name: string, args: Record<string, unknown> = {}): Promise<MCPToolCallResponse> {
    return this.request<MCPToolCallResponse>('tools/call', {
      name,
      arguments: args,
    });
  }
}

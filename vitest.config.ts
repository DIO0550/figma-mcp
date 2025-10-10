import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    fileParallelism: false, // ファイル単位の並列実行を無効化
    env: {
      LOG_LEVEL: 'ERROR', // テスト環境ではログノイズを削減
    },
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.config.ts',
        '**/*.d.ts',
        'src/index.ts', // MCPサーバーのエントリポイントは除外
        'src/__tests__/mocks/**/*', // モックサーバーは除外
      ],
    },
    include: ['src/**/*.test.ts'],
    testTimeout: 30000, // 統合テスト用に30秒のタイムアウト
    hookTimeout: 30000, // フック用のタイムアウト
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
});

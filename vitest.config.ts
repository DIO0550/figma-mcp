import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.config.ts',
        '**/*.d.ts',
        'src/index.ts', // MCPサーバーのエントリポイントは除外
      ],
    },
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
});
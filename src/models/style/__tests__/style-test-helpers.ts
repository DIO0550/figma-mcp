import type { Style } from '../style.js';

/**
 * テスト用のモックStyleを作成するヘルパー関数
 */
export function createMockStyle(
  key: string,
  name: string,
  styleType: 'FILL' | 'TEXT' | 'EFFECT' | 'GRID' = 'FILL'
): Style {
  return {
    key,
    fileKey: 'test-file-key',
    nodeId: `node-${key}`,
    styleType,
    name,
    description: `Description for ${name}`,
  };
}
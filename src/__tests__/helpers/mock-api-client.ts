import { vi } from 'vitest';
import type { FigmaApiClient } from '../../api/figma-api-client.js';

/**
 * テスト用のFigmaApiClientモックを作成
 */
export function createMockApiClient(overrides?: Partial<FigmaApiClient>): FigmaApiClient {
  return {
    files: { getFile: vi.fn() },
    nodes: { getNodes: vi.fn() },
    components: { getComponents: vi.fn() },
    styles: { getStyles: vi.fn() },
    images: { exportImages: vi.fn() },
    comments: { getComments: vi.fn(), postComment: vi.fn() },
    versions: { getVersions: vi.fn() },
    teams: { getTeamProjects: vi.fn() },
    getComponents: vi.fn(),
    getStyles: vi.fn(),
    exportImages: vi.fn(),
    getComments: vi.fn(),
    getVersions: vi.fn(),
    reinitialize: vi.fn(),
    ...overrides,
  } as unknown as FigmaApiClient;
}
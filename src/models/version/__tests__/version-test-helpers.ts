import type { Version } from '../version.js';
import type { FigmaUser } from '../../../types/figma-types.js';

/**
 * テスト用のモックVersionを作成するヘルパー関数
 */
export function createMockVersion(
  id: string,
  createdAt: string,
  label = '',
  description = '',
  userId = 'user-1'
): Version {
  const user: FigmaUser = {
    id: userId,
    handle: `user-${userId}`,
    imgUrl: `https://example.com/avatar/${userId}.png`,
    email: `${userId}@example.com`,
  };

  return {
    id,
    createdAt,
    label,
    description,
    user,
    thumbnailUrl: `https://example.com/thumbnail/${id}.png`,
    pagesChanged: [],
    componentsChanged: 0,
    stylesChanged: 0,
  };
}

/**
 * 複数のモックVersionを作成
 */
export function createMockVersions(count: number): Version[] {
  const versions: Version[] = [];
  const baseDate = new Date('2024-01-01');

  for (let i = 0; i < count; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    
    versions.push(
      createMockVersion(
        `version-${i + 1}`,
        date.toISOString(),
        i % 2 === 0 ? `Label ${i + 1}` : '',
        `Description for version ${i + 1}`,
        `user-${(i % 3) + 1}` // 3人のユーザーをローテーション
      )
    );
  }

  return versions;
}
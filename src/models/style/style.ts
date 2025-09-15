import type { StyleApiStatistics } from '../../api/endpoints/styles/index.js';

/**
 * Figmaのスタイル型定義
 */
export interface Style {
  key: string;
  fileKey: string;
  nodeId: string;
  styleType: 'FILL' | 'TEXT' | 'EFFECT' | 'GRID';
  name: string;
  description: string;
  remote?: boolean;
  sortPosition?: string;
}

/**
 * スタイル分類の結果
 */
export interface CategorizedStyles {
  categorized: Record<string, Record<string, string[]>>;
  statistics: StyleApiStatistics;
}

/**
 * Styleの操作関数群
 */
function categorize(styles: Style[]): CategorizedStyles {
  const categorized: Record<string, Record<string, string[]>> = {};
  const byType: Record<string, number> = {};
  let hierarchicalCount = 0;

  styles.forEach((style) => {
    const styleType = style.styleType;

    // タイプ別のカウント
    byType[styleType] = (byType[styleType] || 0) + 1;

    // カテゴリ分類
    if (!categorized[styleType]) {
      categorized[styleType] = {};
    }

    // 階層的な名前からカテゴリを抽出
    const nameParts = style.name.split('/');
    if (nameParts.length >= 2) {
      hierarchicalCount++;
      // 最後の要素を除いてカテゴリパスを作成
      const categoryPath = nameParts.slice(0, -1).join('/');

      if (!categorized[styleType][categoryPath]) {
        categorized[styleType][categoryPath] = [];
      }

      categorized[styleType][categoryPath].push(style.key);
    } else {
      // 階層的でないスタイルは "Other" カテゴリへ
      if (!categorized[styleType]['Other']) {
        categorized[styleType]['Other'] = [];
      }
      categorized[styleType]['Other'].push(style.key);
    }
  });

  const statistics: StyleApiStatistics = {
    total: styles.length,
    byType,
    namingConsistency: styles.length > 0 ? hierarchicalCount / styles.length : 0,
  };

  return { categorized, statistics };
}

function filterByType(styles: Style[], styleType: string): Style[] {
  return styles.filter((style) => style.styleType === styleType);
}

function getHierarchical(styles: Style[]): Style[] {
  return styles.filter((style) => style.name.includes('/'));
}

function getFlat(styles: Style[]): Style[] {
  return styles.filter((style) => !style.name.includes('/'));
}

function calculateStatistics(styles: Style[]): StyleApiStatistics {
  const byType: Record<string, number> = {};
  let hierarchicalCount = 0;

  styles.forEach((style) => {
    byType[style.styleType] = (byType[style.styleType] || 0) + 1;
    if (style.name.includes('/')) {
      hierarchicalCount++;
    }
  });

  return {
    total: styles.length,
    byType,
    namingConsistency: styles.length > 0 ? hierarchicalCount / styles.length : 0,
  };
}

function isHierarchical(style: Style): boolean {
  return style.name.includes('/');
}

function getCategoryPath(style: Style): string | null {
  const nameParts = style.name.split('/');
  if (nameParts.length >= 2) {
    return nameParts.slice(0, -1).join('/');
  }
  return null;
}

function getBaseName(style: Style): string {
  const nameParts = style.name.split('/');
  return nameParts[nameParts.length - 1];
}

export const Style = {
  categorize,
  filterByType,
  getHierarchical,
  getFlat,
  calculateStatistics,
  isHierarchical,
  getCategoryPath,
  getBaseName,
} as const;

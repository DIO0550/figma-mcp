import type { StyleStatistics } from '../../types/api/responses/style-responses.js';

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
  statistics: StyleStatistics;
}

/**
 * Styleのコンパニオンオブジェクト（名前空間）
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Style {
  /**
   * スタイルの配列を分類する
   */
  export function categorize(styles: Style[]): CategorizedStyles {
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

    const statistics: StyleStatistics = {
      total: styles.length,
      byType,
      namingConsistency: styles.length > 0 ? hierarchicalCount / styles.length : 0,
    };

    return { categorized, statistics };
  }

  /**
   * スタイルタイプでフィルタリング
   */
  export function filterByType(styles: Style[], styleType: string): Style[] {
    return styles.filter((style) => style.styleType === styleType);
  }

  /**
   * 階層的な名前を持つスタイルのみ取得
   */
  export function getHierarchical(styles: Style[]): Style[] {
    return styles.filter((style) => style.name.includes('/'));
  }

  /**
   * 階層的でないスタイルのみ取得
   */
  export function getFlat(styles: Style[]): Style[] {
    return styles.filter((style) => !style.name.includes('/'));
  }

  /**
   * スタイルの統計情報を計算
   */
  export function calculateStatistics(styles: Style[]): StyleStatistics {
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

  /**
   * スタイルが階層的な名前を持つかチェック
   */
  export function isHierarchical(style: Style): boolean {
    return style.name.includes('/');
  }

  /**
   * スタイルのカテゴリパスを取得
   */
  export function getCategoryPath(style: Style): string | null {
    const nameParts = style.name.split('/');
    if (nameParts.length >= 2) {
      return nameParts.slice(0, -1).join('/');
    }
    return null;
  }

  /**
   * スタイルの名前（カテゴリを除く）を取得
   */
  export function getBaseName(style: Style): string {
    const nameParts = style.name.split('/');
    return nameParts[nameParts.length - 1];
  }
}

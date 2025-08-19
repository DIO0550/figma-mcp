/**
 * Figmaのバージョン情報を表す型とそのコンパニオンオブジェクト
 */

import type { FigmaUser } from '../../types/figma-types.js';

/**
 * Figmaファイルのバージョン情報
 */
export interface Version {
  /** バージョンID */
  id: string;
  /** 作成日時（ISO 8601形式） */
  createdAt: string;
  /** バージョンラベル */
  label: string;
  /** バージョンの説明 */
  description: string;
  /** バージョンを作成したユーザー */
  user: FigmaUser;
  /** サムネイル画像のURL */
  thumbnailUrl?: string;
  /** 変更されたページのID一覧 */
  pagesChanged?: string[];
  /** 変更されたコンポーネント数 */
  componentsChanged?: number;
  /** 変更されたスタイル数 */
  stylesChanged?: number;
}

/**
 * バージョン比較結果
 */
export interface VersionComparison {
  from: string;
  to: string;
  changes: {
    pagesAdded: string[];
    pagesRemoved: string[];
    pagesModified: string[];
    componentsAdded: number;
    componentsRemoved: number;
    componentsModified: number;
    stylesAdded: number;
    stylesRemoved: number;
    stylesModified: number;
  };
}

/**
 * バージョン分析結果
 */
export interface VersionAnalysis {
  totalVersions: number;
  mostActiveUser: string | null;
  versionsByUser: Record<string, number>;
  /** バージョン間の平均時間（ミリ秒） */
  averageTimeBetweenVersions: number;
  /** 大きな変更があったバージョン */
  majorChanges: Version[];
}

/**
 * Versionのコンパニオンオブジェクト
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Version {
  /**
   * 指定期間内のバージョンをフィルタリング
   */
  export function filterByDateRange(
    versions: Version[],
    startDate?: Date,
    endDate?: Date
  ): Version[] {
    return versions.filter((version) => {
      const versionDate = new Date(version.createdAt);
      if (startDate && versionDate < startDate) return false;
      if (endDate && versionDate > endDate) return false;
      return true;
    });
  }

  /**
   * 特定のユーザーが作成したバージョンをフィルタリング
   */
  export function filterByUser(versions: Version[], userId: string): Version[] {
    return versions.filter((version) => version.user.id === userId);
  }

  /**
   * ラベル付きバージョンのみを取得
   */
  export function getLabeled(versions: Version[]): Version[] {
    return versions.filter((version) => version.label && version.label.trim() !== '');
  }

  /**
   * 最新のバージョンを取得
   */
  export function getLatest(versions: Version[]): Version | null {
    if (versions.length === 0) return null;
    
    return versions.reduce((latest, version) => {
      const latestDate = new Date(latest.createdAt);
      const versionDate = new Date(version.createdAt);
      return versionDate > latestDate ? version : latest;
    });
  }

  /**
   * バージョンを日付順にソート（新しい順）
   */
  export function sortByDate(versions: Version[], ascending = false): Version[] {
    return [...versions].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    });
  }

  /**
   * バージョンを分析
   */
  export function analyze(versions: Version[]): VersionAnalysis {
    if (versions.length === 0) {
      return {
        totalVersions: 0,
        mostActiveUser: null,
        versionsByUser: {},
        averageTimeBetweenVersions: 0,
        majorChanges: [],
      };
    }

    const versionsByUser: Record<string, number> = {};
    versions.forEach((version) => {
      const userId = version.user.id;
      versionsByUser[userId] = (versionsByUser[userId] || 0) + 1;
    });
    const mostActiveUser = Object.entries(versionsByUser).reduce((max, [userId, count]) => {
      return count > (max[1] || 0) ? [userId, count] : max;
    }, ['', 0] as [string, number])[0];

    // バージョン間の平均時間を計算
    let averageTimeBetweenVersions = 0;
    if (versions.length > 1) {
      const sortedVersions = sortByDate(versions, true);
      let totalTime = 0;
      for (let i = 1; i < sortedVersions.length; i++) {
        const prevDate = new Date(sortedVersions[i - 1].createdAt);
        const currDate = new Date(sortedVersions[i].createdAt);
        totalTime += currDate.getTime() - prevDate.getTime();
      }
      averageTimeBetweenVersions = totalTime / (sortedVersions.length - 1);
    }

    // 大きな変更があったバージョンを特定
    // 閾値10は暫定値で、実際の使用パターンに基づいて調整が必要
    // TODO: 閾値を設定可能にすることを検討
    const majorChanges = versions.filter((version) => {
      const componentChanges = version.componentsChanged || 0;
      const styleChanges = version.stylesChanged || 0;
      return componentChanges >= 10 || styleChanges >= 10;
    });

    return {
      totalVersions: versions.length,
      mostActiveUser,
      versionsByUser,
      averageTimeBetweenVersions,
      majorChanges,
    };
  }

  /**
   * 2つのバージョン間の変更を比較（モック実装）
   * 
   * 注意: Figma APIはバージョン間の詳細な差分情報を直接提供しないため、
   * 実際の比較には各バージョンのファイル全体を取得して差分計算が必要。
   * 現在は簡易的な比較ロジックのみ実装。
   * 
   * @todo 実際のファイル差分計算機能の実装
   */
  export function compare(fromVersion: Version, toVersion: Version): VersionComparison {
    
    const fromPages = fromVersion.pagesChanged || [];
    const toPages = toVersion.pagesChanged || [];
    
    const pagesAdded = toPages.filter(page => !fromPages.includes(page));
    const pagesRemoved = fromPages.filter(page => !toPages.includes(page));
    const pagesModified = toPages.filter(page => fromPages.includes(page));
    
    return {
      from: fromVersion.id,
      to: toVersion.id,
      changes: {
        pagesAdded,
        pagesRemoved,
        pagesModified,
        componentsAdded: Math.max(0, (toVersion.componentsChanged || 0) - (fromVersion.componentsChanged || 0)),
        componentsRemoved: 0, // APIの制約により削除数は計算不可
        componentsModified: Math.min(fromVersion.componentsChanged || 0, toVersion.componentsChanged || 0),
        stylesAdded: Math.max(0, (toVersion.stylesChanged || 0) - (fromVersion.stylesChanged || 0)),
        stylesRemoved: 0, // APIの制約により削除数は計算不可
        stylesModified: Math.min(fromVersion.stylesChanged || 0, toVersion.stylesChanged || 0),
      },
    };
  }

  /**
   * バージョンIDを検証
   */
  export function isValidVersionId(versionId: string): boolean {
    // Figmaのバージョン IDは数値文字列
    return /^\d+$/.test(versionId);
  }

  /**
   * バージョンの説明を生成
   */
  export function generateSummary(version: Version): string {
    const parts: string[] = [];
    
    if (version.label) {
      parts.push(`Label: ${version.label}`);
    }
    
    if (version.componentsChanged && version.componentsChanged > 0) {
      parts.push(`${version.componentsChanged} component(s) changed`);
    }
    
    if (version.stylesChanged && version.stylesChanged > 0) {
      parts.push(`${version.stylesChanged} style(s) changed`);
    }
    
    if (version.pagesChanged && version.pagesChanged.length > 0) {
      parts.push(`${version.pagesChanged.length} page(s) affected`);
    }
    
    if (parts.length === 0) {
      return 'No significant changes';
    }
    
    return parts.join(', ');
  }
}
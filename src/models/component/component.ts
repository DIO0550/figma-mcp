import type { Component as FigmaComponent } from '../../types/figma-types.js';
import type { ComponentApiAnalysis, VariantApiSet } from '../../api/endpoints/components/index.js';

/**
 * Componentモデルのコンパニオンオブジェクト
 */
export const Component = {
  /**
   * コンポーネントのメタデータを解析する
   */
  analyze(components: FigmaComponent[]): ComponentApiAnalysis {
    const categories: Record<string, number> = {};
    const namingPatterns: Record<string, number> = {};
    const pagesDistribution: Record<string, number> = {};
    let descriptionsCount = 0;

    components.forEach((component) => {
      // カテゴリ分析（名前の最初の部分）
      const nameParts = component.name.split('/');
      if (nameParts.length > 0) {
        const category = nameParts[0];
        categories[category] = (categories[category] || 0) + 1;
      }

      // 命名パターン分析
      if (component.name.includes('/')) {
        namingPatterns['hierarchical'] = (namingPatterns['hierarchical'] || 0) + 1;
      } else if (component.name.includes('-')) {
        namingPatterns['kebab-case'] = (namingPatterns['kebab-case'] || 0) + 1;
      } else if (component.name.includes('_')) {
        namingPatterns['snake_case'] = (namingPatterns['snake_case'] || 0) + 1;
      } else {
        namingPatterns['simple'] = (namingPatterns['simple'] || 0) + 1;
      }

      // ページ分布
      if (component.containingFrame?.pageName) {
        const pageName = component.containingFrame.pageName;
        pagesDistribution[pageName] = (pagesDistribution[pageName] || 0) + 1;
      }

      // 説明のカバレッジ
      if (component.description && component.description.trim().length > 0) {
        descriptionsCount++;
      }
    });

    return {
      totalComponents: components.length,
      categories,
      namingPatterns,
      pagesDistribution,
      descriptionCoverage: components.length > 0 ? descriptionsCount / components.length : 0,
    };
  },

  /**
   * バリアント情報を整理する
   *
   * @param components - 整理対象のコンポーネント配列
   * @returns バリアントセットのマップ（キー: セットID）
   *
   * @remarks
   * この実装は簡易的なもので、コンポーネント名からバリアントプロパティを推測します。
   * Figma APIの実際のvariant propertiesを使用する場合は、より精緻な実装が必要です。
   *
   * 現在の仕様:
   * - componentSetIdが存在するコンポーネントはバリアントとして扱う
   * - コンポーネント名の最初の部分（'/'の前）をセット名として使用
   * - プロパティの抽出は未実装（将来の拡張ポイント）
   * - 単独コンポーネントは仮想セットIDで個別に管理
   *
   * @example
   * ```typescript
   * const components = [
   *   { key: '1', name: 'Button/Primary', componentSetId: 'set1' },
   *   { key: '2', name: 'Button/Secondary', componentSetId: 'set1' },
   *   { key: '3', name: 'Icon', componentSetId: null },
   * ];
   * const sets = Component.organizeVariants(components);
   * // {
   * //   'set1': { name: 'Button', variants: ['1', '2'], properties: {} },
   * //   'single-3': { name: 'Icon', variants: ['3'], properties: {} }
   * // }
   * ```
   */
  organizeVariants(components: FigmaComponent[]): Record<string, VariantApiSet> {
    const variantSets: Record<string, VariantApiSet> = {};

    // コンポーネントセットごとにグループ化
    components.forEach((component) => {
      const setId = component.componentSetId;
      if (setId) {
        if (!variantSets[setId]) {
          variantSets[setId] = {
            name: component.name.split('/')[0] || component.name,
            variants: [],
            properties: {},
          };
        }

        variantSets[setId].variants.push(component.key);

        // プロパティの抽出（仮実装）
        // 実際のFigma APIではvariant propertiesが提供される
        // ここでは名前からプロパティを推測
        const nameParts = component.name.split('/');
        if (nameParts.length > 1) {
          // 例: Button/Primary/Large -> properties: {type: 'Primary', size: 'Large'}
          // この実装は簡略化されたもの
        }
      }
    });

    // 単独のコンポーネント（バリアントなし）も含める
    components.forEach((component) => {
      const setId = component.componentSetId;
      if (!setId) {
        // 単独コンポーネント用の仮想セットID
        const virtualSetId = `single-${component.key}`;
        variantSets[virtualSetId] = {
          name: component.name,
          variants: [component.key],
          properties: {},
        };
      }
    });

    return variantSets;
  },
} as const;

import type { FigmaApiClient } from '../../api/figma-api-client.js';
import type { ComponentTool } from './types.js';
import type {
  GetComponentsResponse,
  ComponentAnalysis,
  VariantSet,
} from '../../types/api/responses/component-responses.js';
import type { Component } from '../../types/figma-types.js';
import { GetComponentsArgsSchema, type GetComponentsArgs } from './get-components-args.js';
import { JsonSchema } from '../types.js';

export const createGetComponentsTool = (apiClient: FigmaApiClient): ComponentTool => {
  return {
    name: 'get_components',
    description: 'Get components from a Figma file with optional metadata analysis',
    inputSchema: JsonSchema.from(GetComponentsArgsSchema),
    execute: async (args: GetComponentsArgs): Promise<GetComponentsResponse> => {
      const response = await apiClient.getComponents(args.fileKey);
      const result = { ...response };

      if (args.analyzeMetadata && response.meta.components.length > 0) {
        result.analysis = analyzeComponents(response.meta.components);
      }

      if (args.organizeVariants && response.meta.components.length > 0) {
        result.variantSets = organizeVariants(response.meta.components);
      }

      return result;
    },
  };
};

// コンポーネントのメタデータを解析する関数
function analyzeComponents(components: Component[]): ComponentAnalysis {
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
}

// バリアント情報を整理する関数
function organizeVariants(components: Component[]): Record<string, VariantSet> {
  const variantSets: Record<string, VariantSet> = {};

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
}

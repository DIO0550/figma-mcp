import type { FigmaApiClient } from '../../api/figma-api-client.js';
import type { GetStylesArgs } from './types.js';
import type { GetStylesResponse, StyleStatistics } from '../../types/api/responses/style-responses.js';
import type { Style } from '../../types/figma-types.js';

export interface StyleTool {
  name: string;
  description: string;
  execute: (args: GetStylesArgs) => Promise<GetStylesResponse>;
}

export const createGetStylesTool = (apiClient: FigmaApiClient): StyleTool => {
  return {
    name: 'get_styles',
    description: 'Get styles from a Figma file with optional categorization',
    execute: async (args: GetStylesArgs): Promise<GetStylesResponse> => {
      const response = await apiClient.getStyles(args.fileKey);
      
      if (args.categorize && response.meta.styles.length > 0) {
        const { categorized, statistics } = categorizeStyles(response.meta.styles);
        return {
          ...response,
          categorized,
          statistics,
        };
      }
      
      return response;
    },
  };
};

// スタイルを分類する関数
function categorizeStyles(styles: Style[]): { categorized: Record<string, Record<string, string[]>>; statistics: StyleStatistics } {
  const categorized: Record<string, Record<string, string[]>> = {};
  const byType: Record<string, number> = {};
  let hierarchicalCount = 0;
  
  styles.forEach(style => {
    const styleType = style.style_type;
    
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
  
  const statistics = {
    total: styles.length,
    by_type: byType,
    naming_consistency: styles.length > 0 ? hierarchicalCount / styles.length : 0,
  };
  
  return { categorized, statistics };
}
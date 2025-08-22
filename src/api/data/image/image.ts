import type { FigmaContext } from '../../context.js';
import type { ExportImageResponse } from '../../../types/api/responses/image-responses.js';

/**
 * 画像エクスポートのフォーマット
 */
export type ImageFormat = 'PNG' | 'JPG' | 'SVG' | 'PDF';

/**
 * 画像エクスポートのオプション
 */
export interface ImageExportOptions {
  /** エクスポートするノードID */
  readonly nodeIds: string[];
  /** 画像フォーマット */
  readonly format?: ImageFormat;
  /** スケール（0.01〜4） */
  readonly scale?: number;
}

/**
 * 画像エクスポートのデータ構造
 */
export interface ImageExport {
  /** エクスポートしたノードID */
  readonly nodeIds: string[];
  /** 画像フォーマット */
  readonly format: ImageFormat;
  /** スケール */
  readonly scale: number;
  /** ノードIDと画像URLのマップ */
  readonly urls: Record<string, string>;
}

/**
 * ImageExportのコンパニオンオブジェクト
 * 画像エクスポートの取得と操作のための純粋関数を提供
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ImageExport {
  /**
   * オプションからImageExportを作成
   */
  export function fromOptions(options: ImageExportOptions): ImageExport {
    return {
      nodeIds: options.nodeIds,
      format: options.format || 'PNG',
      scale: options.scale || 1,
      urls: {},
    };
  }

  /**
   * 画像をエクスポート
   */
  export async function fetch(
    context: FigmaContext,
    fileKey: string,
    options: ImageExportOptions
  ): Promise<ImageExport> {
    const params = new URLSearchParams();
    params.append('ids', options.nodeIds.join(','));
    params.append('format', options.format || 'PNG');
    if (options.scale) {
      params.append('scale', options.scale.toString());
    }

    const url = `${context.baseUrl}/v1/images/${fileKey}?${params.toString()}`;
    
    const response = await globalThis.fetch(url, {
      method: 'GET',
      headers: context.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch images: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as ExportImageResponse;

    return {
      nodeIds: options.nodeIds,
      format: options.format || 'PNG',
      scale: options.scale || 1,
      urls: data.images || {},
    };
  }

  /**
   * 複数の画像エクスポートを並列で実行
   */
  export async function fetchBatch(
    context: FigmaContext,
    fileKey: string,
    optionsList: ImageExportOptions[]
  ): Promise<ImageExport[]> {
    if (optionsList.length === 0) {
      return [];
    }

    const promises = optionsList.map(options =>
      fetch(context, fileKey, options)
    );

    return await Promise.all(promises);
  }
}
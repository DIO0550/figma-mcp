import type { FigmaContext } from '../../context.js';

/**
 * 画像エクスポートのフォーマット
 */
export type ImageFormat = 'PNG' | 'JPG' | 'SVG' | 'PDF';

/**
 * 画像エクスポートのデータ構造
 */
export interface ImageExport {
  /** エクスポート対象のノードID */
  readonly nodeId: string;
  /** エクスポート形式 */
  readonly format: ImageFormat;
  /** 拡大倍率（1-4） */
  readonly scale: number;
  /** 生成された画像のURL（取得後に設定） */
  readonly url?: string;
}

/**
 * ImageExportのコンパニオンオブジェクト
 * 画像エクスポートの作成と操作のための純粋関数を提供
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ImageExport {
  /**
   * オプションからImageExportを作成
   */
  export function fromOptions(
    nodeId: string,
    options?: {
      format?: ImageFormat;
      scale?: number;
    }
  ): ImageExport {
    return {
      nodeId,
      format: options?.format || 'PNG',
      scale: options?.scale || 1,
    };
  }

  /**
   * 複数のノードIDから同じ設定でImageExportを作成
   */
  export function fromNodeIds(
    nodeIds: string[],
    options?: {
      format?: ImageFormat;
      scale?: number;
    }
  ): ImageExport[] {
    return nodeIds.map((nodeId) => fromOptions(nodeId, options));
  }

  /**
   * 画像をエクスポート
   */
  export async function fetch(
    context: FigmaContext,
    fileKey: string,
    exports: ImageExport[]
  ): Promise<ImageExport[]> {
    if (exports.length === 0) {
      return [];
    }

    // 同じ形式とスケールでグループ化
    const groups = new Map<string, ImageExport[]>();
    for (const exp of exports) {
      const key = `${exp.format}-${exp.scale}`;
      const group = groups.get(key) || [];
      group.push(exp);
      groups.set(key, group);
    }
    const grouped = Array.from(groups.values());

    const results: ImageExport[] = [];
    for (const group of grouped) {
      const params = new URLSearchParams();
      params.append('ids', group.map((e) => e.nodeId).join(','));
      params.append('format', group[0].format.toLowerCase());
      params.append('scale', group[0].scale.toString());

      const url = `${context.baseUrl}/v1/images/${fileKey}?${params.toString()}`;

      const response = await globalThis.fetch(url, {
        method: 'GET',
        headers: context.headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to export images: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as { images: Record<string, string> };

      // URLを結果に追加
      for (const exp of group) {
        results.push({
          ...exp,
          url: data.images[exp.nodeId],
        });
      }
    }

    return results;
  }

  /**
   * 複数の形式でエクスポート
   */
  export async function fetchMultipleFormats(
    context: FigmaContext,
    fileKey: string,
    nodeId: string,
    formats: ImageFormat[]
  ): Promise<ImageExport[]> {
    const exports = formats.map((format) => fromOptions(nodeId, { format }));
    return fetch(context, fileKey, exports);
  }

  /**
   * 複数のスケールでエクスポート
   */
  export async function fetchMultipleScales(
    context: FigmaContext,
    fileKey: string,
    nodeId: string,
    scales: number[],
    format?: ImageFormat
  ): Promise<ImageExport[]> {
    const exports = scales.map((scale) => fromOptions(nodeId, { format, scale }));
    return fetch(context, fileKey, exports);
  }

  /**
   * エクスポート結果からURLを抽出
   */
  export function extractUrls(exports: ImageExport[]): string[] {
    return exports
      .filter((exp) => exp.url !== undefined)
      .map((exp) => exp.url as string);
  }

  /**
   * エクスポート結果をノードIDでマップ化
   */
  export function toUrlMap(exports: ImageExport[]): Record<string, string> {
    const map: Record<string, string> = {};
    for (const exp of exports) {
      if (exp.url) {
        map[exp.nodeId] = exp.url;
      }
    }
    return map;
  }


  /**
   * エクスポート設定の検証
   */
  export function validate(exp: ImageExport): string[] {
    const errors: string[] = [];

    if (!exp.nodeId) {
      errors.push('Node ID is required');
    }

    const validFormats: ImageFormat[] = ['PNG', 'JPG', 'SVG', 'PDF'];
    if (!validFormats.includes(exp.format)) {
      errors.push(`Invalid format: ${exp.format}. Must be one of: ${validFormats.join(', ')}`);
    }

    if (exp.scale < 0.01 || exp.scale > 4) {
      errors.push(`Invalid scale: ${exp.scale}. Must be between 0.01 and 4`);
    }

    return errors;
  }

  /**
   * バッチでのエクスポート（大量のノードを扱う場合）
   */
  export async function fetchInBatches(
    context: FigmaContext,
    fileKey: string,
    exports: ImageExport[],
    batchSize = 50
  ): Promise<ImageExport[]> {
    const results: ImageExport[] = [];
    
    for (let i = 0; i < exports.length; i += batchSize) {
      const batch = exports.slice(i, i + batchSize);
      const batchResults = await fetch(context, fileKey, batch);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Retinaディスプレイ用のエクスポート設定を生成
   */
  export function createRetinaExports(
    nodeId: string,
    format: ImageFormat = 'PNG'
  ): ImageExport[] {
    return [
      fromOptions(nodeId, { format, scale: 1 }),  // 1x
      fromOptions(nodeId, { format, scale: 2 }),  // 2x (Retina)
      fromOptions(nodeId, { format, scale: 3 }),  // 3x (Super Retina)
    ];
  }
}
import type { FigmaContext } from '../../context.js';
import type { ImageApiResponse } from '../../endpoints/images/index.js';

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
 * ImageExportの操作関数群
 */
function fromOptions(options: ImageExportOptions): ImageExport {
  return {
    nodeIds: options.nodeIds,
    format: options.format || 'PNG',
    scale: options.scale || 1,
    urls: {},
  };
}

async function fetch(
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

  const data = (await response.json()) as ImageApiResponse;

  return {
    nodeIds: options.nodeIds,
    format: options.format || 'PNG',
    scale: options.scale || 1,
    urls: data.images || {},
  };
}

async function fetchBatch(
  context: FigmaContext,
  fileKey: string,
  optionsList: ImageExportOptions[]
): Promise<ImageExport[]> {
  if (optionsList.length === 0) {
    return [];
  }

  const promises = optionsList.map((options) => fetch(context, fileKey, options));

  return await Promise.all(promises);
}

export const ImageExport = {
  fromOptions,
  fetch,
  fetchBatch,
} as const;

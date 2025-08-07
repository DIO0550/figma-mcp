/**
 * FigmaInfo型とFigma URLパース用のコンパニオンオブジェクト
 */

import { QueryParams } from '../constants/query-params.js';
import { ErrorMessages } from '../constants/error-messages.js';

/**
 * サポートされているFigma URLのタイプ
 */
const FigmaUrlType = {
  FILE: 'file',
  DESIGN: 'design',
} as const;

type FigmaUrlType = (typeof FigmaUrlType)[keyof typeof FigmaUrlType];

/**
 * サポートされているURLタイプの配列
 */
const SUPPORTED_FIGMA_URL_TYPES: readonly FigmaUrlType[] = [
  FigmaUrlType.FILE,
  FigmaUrlType.DESIGN,
] as const;

/**
 * Figmaドメイン
 */
const FIGMA_DOMAIN = 'figma.com';

/**
 * Figma URLエラーメッセージ
 */
const FigmaUrlError = {
  NOT_FIGMA_URL: 'Not a Figma URL',
  UNSUPPORTED_PATTERN: 'Unsupported Figma URL pattern',
} as const;

export interface FigmaInfo {
  /** FigmaファイルID */
  fileId?: string;
  /** Figmaファイル名（オプション） */
  fileName?: string;
  /** FigmaノードID（オプション） */
  nodeId?: string;
}

/**
 * FigmaInfoのファクトリーメソッドを持つコンパニオンオブジェクト
 */
export const FigmaInfo = {
  /**
   * Figma URLからFigmaInfoを生成する
   * @param url パースするFigma URL
   * @returns FigmaInfoオブジェクト
   * @throws URLが無効またはFigma URLでない場合はエラー
   */
  fromUrl: (url: string): FigmaInfo => {
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url);
    } catch {
      throw new Error(ErrorMessages.INVALID_URL);
    }

    // Figmaドメインのチェック
    const hostname = parsedUrl.hostname.toLowerCase();
    if (!hostname.includes(FIGMA_DOMAIN)) {
      throw new Error(FigmaUrlError.NOT_FIGMA_URL);
    }

    // パスの解析
    const pathSegments = parsedUrl.pathname.split('/').filter((segment) => segment);

    if (pathSegments.length < 2) {
      throw new Error(FigmaUrlError.UNSUPPORTED_PATTERN);
    }

    const [type, fileId, ...rest] = pathSegments;

    // サポートされているタイプかチェック
    if (!SUPPORTED_FIGMA_URL_TYPES.includes(type as FigmaUrlType)) {
      throw new Error(FigmaUrlError.UNSUPPORTED_PATTERN);
    }

    // ファイル名の取得（オプション）
    const fileName = rest.length > 0 ? decodeURIComponent(rest.join('/')) : undefined;

    // node-idの取得（オプション）
    const nodeId = parsedUrl.searchParams.get(QueryParams.NODE_ID) || undefined;

    return {
      fileId,
      fileName,
      nodeId,
    };
  },

  /**
   * オブジェクトからFigmaInfoを生成する
   * @param obj Figma情報を含むオブジェクト
   * @returns FigmaInfoオブジェクト、fileIdがない場合はundefined
   */
  fromObject: (obj: { fileId?: string; fileName?: string; nodeId?: string }): FigmaInfo | undefined => {
    if (!obj.fileId) {
      return undefined;
    }
    return {
      fileId: obj.fileId,
      fileName: obj.fileName,
      nodeId: obj.nodeId,
    };
  },

  /**
   * 指定されたパラメータでFigmaInfoを生成する
   * @param fileId FigmaファイルID
   * @param fileName オプションのファイル名
   * @param nodeId オプションのノードID
   * @returns FigmaInfoオブジェクト
   */
  create: (fileId: string, fileName?: string, nodeId?: string): FigmaInfo => {
    return {
      fileId,
      fileName,
      nodeId,
    };
  },
};
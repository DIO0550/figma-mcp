import { QueryParams } from '../../constants/query-params.js';
import { ErrorMessages } from '../../constants/error-messages.js';

/**
 * サポートされているFigma URLタイプ
 */
const SUPPORTED_URL_TYPES = ['file', 'design'] as const;
type UrlType = (typeof SUPPORTED_URL_TYPES)[number];

/**
 * Figmaドメイン
 */
const FIGMA_DOMAIN = 'figma.com';

/**
 * エラーメッセージ
 */
const FigmaUrlError = {
  NOT_FIGMA_URL: 'Not a Figma URL',
  UNSUPPORTED_PATTERN: 'Unsupported Figma URL pattern',
  INVALID_FILE_ID: 'Invalid file ID',
} as const;

/**
 * パースされたFigma URLの情報
 */
export interface ParsedFigmaUrl {
  readonly fileId: string;
  readonly fileName?: string;
  readonly nodeId?: string;
}

/**
 * ファイルIDのバリデート（内部使用）
 */
const isValidFileId = (fileId: string): boolean => {
  // Figma file IDは英数字とハイフン、アンダースコアで構成される
  return /^[a-zA-Z0-9_-]+$/.test(fileId);
};

/**
 * ParsedFigmaUrlコンパニオンオブジェクト
 * Figma URLのパース機能を提供
 */
export const ParsedFigmaUrl = {
  /**
   * Figma URLをパースする
   * @param url パースするFigma URL
   * @returns パースされたFigma URL情報
   * @throws URLが無効またはFigma URLでない場合はエラー
   */
  parse: (url: string): ParsedFigmaUrl => {
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
    if (!SUPPORTED_URL_TYPES.includes(type as UrlType)) {
      throw new Error(FigmaUrlError.UNSUPPORTED_PATTERN);
    }

    // ファイルIDのバリデート
    if (!isValidFileId(fileId)) {
      throw new Error(FigmaUrlError.INVALID_FILE_ID);
    }

    // ファイル名の取得（オプション）
    const fileName = rest.length > 0 ? decodeURIComponent(rest.join('/')) : undefined;

    // node-idの取得（オプション）
    const nodeId = parsedUrl.searchParams.get(QueryParams.NODE_ID) || undefined;

    return Object.freeze({
      fileId,
      fileName,
      nodeId,
    });
  },
};

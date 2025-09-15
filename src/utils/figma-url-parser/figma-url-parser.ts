import { QueryParams } from '../../constants/query-params.js';
import { ErrorMessages, FigmaErrorMessages } from '../../constants/index.js';

/**
 * サポートされているFigma URLタイプ
 */
const SUPPORTED_URL_TYPES = ['file', 'design'] as const;

/**
 * Figmaドメイン
 */
const FIGMA_DOMAIN = 'figma.com';

/**
 * パースされたFigma URLの情報
 */
export interface ParsedFigmaUrl {
  readonly fileId: string;
  readonly fileName?: string;
  readonly nodeId?: string;
}

/**
 * ファイルIDの正規表現パターン
 * Figma file IDは英数字とハイフン、アンダースコアで構成される
 */
const FILE_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

/**
 * ファイルIDのバリデート（内部使用）
 * 参考: Figma APIドキュメントでは、file keyは22文字の英数字+記号の組み合わせ
 * https://www.figma.com/developers/api#files
 */
const isValidFileId = (fileId: string): boolean => {
  return FILE_ID_PATTERN.test(fileId);
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

    // Figmaドメインのチェック（厳密なドメイン検証）
    const hostname = parsedUrl.hostname.toLowerCase();
    if (hostname !== FIGMA_DOMAIN && hostname !== `www.${FIGMA_DOMAIN}`) {
      throw new Error(FigmaErrorMessages.NOT_FIGMA_URL);
    }

    // パスの解析
    const pathSegments = parsedUrl.pathname.split('/').filter((segment) => segment);

    if (pathSegments.length < 2) {
      throw new Error(FigmaErrorMessages.UNSUPPORTED_FIGMA_URL_PATTERN);
    }

    const [type, fileId, ...rest] = pathSegments;

    // サポートされているタイプかチェック
    if (!SUPPORTED_URL_TYPES.includes(type as (typeof SUPPORTED_URL_TYPES)[number])) {
      throw new Error(FigmaErrorMessages.UNSUPPORTED_FIGMA_URL_PATTERN);
    }

    // ファイルIDのバリデート
    if (!isValidFileId(fileId)) {
      throw new Error(FigmaErrorMessages.INVALID_FIGMA_FILE_ID);
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

import { QueryParams } from '../constants/query-params.js';
import { ErrorMessages } from '../constants/error-messages.js';

export interface ParsedFigmaUrl {
  fileId: string;
  fileName?: string;
  nodeId?: string;
}

export function parseFigmaUrl(url: string): ParsedFigmaUrl {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error(ErrorMessages.INVALID_URL);
  }

  // Figmaドメインのチェック
  const hostname = parsedUrl.hostname.toLowerCase();
  if (!hostname.includes('figma.com')) {
    throw new Error('Not a Figma URL');
  }

  // パスの解析
  const pathSegments = parsedUrl.pathname.split('/').filter((segment) => segment);

  if (pathSegments.length < 2) {
    throw new Error('Unsupported Figma URL pattern');
  }

  const [type, fileId, ...rest] = pathSegments;

  // file または design タイプのみサポート
  if (type !== 'file' && type !== 'design') {
    throw new Error('Unsupported Figma URL pattern');
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
}

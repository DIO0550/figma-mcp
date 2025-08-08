/**
 * Figma APIアクセスのためのコンテキスト情報
 * アクセストークン、ベースURL、HTTPヘッダーを管理
 */
export interface FigmaContext {
  /** Figma Personal Access Token */
  readonly accessToken: string;
  /** Figma API のベースURL */
  readonly baseUrl: string;
  /** HTTPリクエストヘッダー */
  readonly headers: Record<string, string>;
}

/**
 * FigmaContextのコンパニオンオブジェクト
 * インスタンス生成と操作のための純粋関数を提供
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace FigmaContext {
  const DEFAULT_BASE_URL = 'https://api.figma.com';

  /**
   * アクセストークンからコンテキストを作成
   */
  export function from(
    accessToken: string,
    options?: {
      baseUrl?: string;
      headers?: Record<string, string>;
    }
  ): FigmaContext {
    return {
      accessToken,
      baseUrl: options?.baseUrl || DEFAULT_BASE_URL,
      headers: {
        'X-Figma-Token': accessToken,
        ...(options?.headers || {}),
      },
    };
  }

  /**
   * 環境変数からコンテキストを作成
   */
  export function fromEnv(options?: {
    tokenKey?: string;
    baseUrlKey?: string;
  }): FigmaContext {
    const tokenKey = options?.tokenKey || 'FIGMA_ACCESS_TOKEN';
    const baseUrlKey = options?.baseUrlKey || 'FIGMA_BASE_URL';

    const accessToken = process.env[tokenKey];
    if (!accessToken) {
      throw new Error(`${tokenKey} environment variable is required`);
    }

    const baseUrl = process.env[baseUrlKey] || DEFAULT_BASE_URL;

    return from(accessToken, { baseUrl });
  }

  /**
   * ベースURLを変更した新しいコンテキストを返す
   */
  export function withBaseUrl(
    context: FigmaContext,
    baseUrl: string
  ): FigmaContext {
    // 末尾のスラッシュを削除
    const normalizedUrl = baseUrl.replace(/\/$/, '');
    
    return {
      ...context,
      baseUrl: normalizedUrl,
    };
  }

  /**
   * ヘッダーを追加・更新した新しいコンテキストを返す
   */
  export function withHeaders(
    context: FigmaContext,
    headers: Record<string, string>
  ): FigmaContext {
    return {
      ...context,
      headers: {
        ...context.headers,
        ...headers,
      },
    };
  }

  /**
   * コンテキストの妥当性を検証
   */
  export function validate(context: FigmaContext): boolean {
    // アクセストークンの検証
    if (!context.accessToken || context.accessToken.trim() === '') {
      return false;
    }

    // ベースURLの検証
    try {
      new URL(context.baseUrl);
    } catch {
      return false;
    }

    // 必須ヘッダーの検証
    if (!context.headers['X-Figma-Token']) {
      return false;
    }

    return true;
  }
}
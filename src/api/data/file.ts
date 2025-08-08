import type { FigmaContext } from '../context.js';
import type { FigmaFile } from '../../types/api/responses/file-responses.js';
import type { Document, Node, Component, Style } from '../../types/figma-types.js';

/**
 * Figmaファイルのデータ構造
 * ファイル情報、ドキュメント構造、コンポーネント、スタイルを含む
 */
export interface FileData {
  /** ファイルの一意識別子 */
  readonly key: string;
  /** ファイル名 */
  readonly name: string;
  /** 最終更新日時 */
  readonly lastModified: string;
  /** サムネイルURL（オプション） */
  readonly thumbnailUrl?: string;
  /** ファイルバージョン */
  readonly version: string;
  /** ドキュメント構造 */
  readonly document: Document;
  /** コンポーネント定義 */
  readonly components: Record<string, Component>;
  /** スキーマバージョン */
  readonly schemaVersion: number;
  /** スタイル定義 */
  readonly styles: Record<string, Style>;
  /** ユーザーの権限 */
  readonly role: string;
  /** エディタータイプ */
  readonly editorType: string;
  /** リンクアクセス権限 */
  readonly linkAccess: string;
}

/**
 * FileDataのコンパニオンオブジェクト
 * ファイルデータの取得と操作のための純粋関数を提供
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace FileData {
  /**
   * Figma APIレスポンスからFileDataを作成
   */
  export function fromResponse(key: string, response: FigmaFile): FileData {
    return {
      key,
      name: response.name,
      lastModified: response.lastModified,
      thumbnailUrl: response.thumbnailUrl,
      version: response.version,
      document: response.document,
      components: response.components,
      schemaVersion: response.schemaVersion,
      styles: response.styles,
      role: response.role,
      editorType: response.editorType,
      linkAccess: response.linkAccess,
    };
  }

  /**
   * ファイル情報を取得
   */
  export async function fetch(
    context: FigmaContext,
    fileKey: string,
    options?: {
      version?: string;
      geometry?: 'paths';
    }
  ): Promise<FileData> {
    const params = new URLSearchParams();
    if (options?.version) {
      params.append('version', options.version);
    }
    if (options?.geometry) {
      params.append('geometry', options.geometry);
    }

    const url = `${context.baseUrl}/v1/files/${fileKey}${params.toString() ? '?' + params.toString() : ''}`;
    
    const response = await globalThis.fetch(url, {
      method: 'GET',
      headers: context.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as FigmaFile;
    return fromResponse(fileKey, data);
  }

  /**
   * 特定ノードの詳細情報を取得
   */
  export async function fetchNodes(
    context: FigmaContext,
    fileKey: string,
    nodeIds: string[],
    options?: {
      depth?: number;
      geometry?: 'paths';
    }
  ): Promise<{
    name: string;
    nodes: Record<string, {
      document: Node;
      components: Record<string, Component>;
      schemaVersion: number;
      styles: Record<string, Style>;
    }>;
  }> {
    const params = new URLSearchParams();
    params.append('ids', nodeIds.join(','));
    if (options?.depth) {
      params.append('depth', options.depth.toString());
    }
    if (options?.geometry) {
      params.append('geometry', options.geometry);
    }

    const url = `${context.baseUrl}/v1/files/${fileKey}/nodes?${params.toString()}`;
    
    const response = await globalThis.fetch(url, {
      method: 'GET',
      headers: context.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch nodes: ${response.status} ${response.statusText}`);
    }

    return await response.json() as {
      name: string;
      nodes: Record<string, {
        document: Node;
        components: Record<string, Component>;
        schemaVersion: number;
        styles: Record<string, Style>;
      }>;
    };
  }

  /**
   * ファイル内のページ名を取得
   */
  export function getPageNames(fileData: FileData): string[] {
    if (!fileData.document || !fileData.document.children) {
      return [];
    }

    return fileData.document.children
      .filter((node) => node.type === 'CANVAS')
      .map((node) => node.name);
  }

  /**
   * 指定されたIDのノードを検索
   */
  export function findNodeById(fileData: FileData, nodeId: string): Node | undefined {
    function searchNode(node: Node): Node | undefined {
      if (node.id === nodeId) {
        return node;
      }

      if (node.children) {
        for (const child of node.children) {
          const found = searchNode(child);
          if (found) {
            return found;
          }
        }
      }

      return undefined;
    }

    return searchNode(fileData.document);
  }
}
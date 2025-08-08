import type { FigmaContext } from '../context.js';
import type { GetComponentsResponse } from '../../types/api/responses/component-responses.js';

/**
 * APIレスポンスのコンポーネント型
 */
interface ApiComponent {
  key: string;
  file_key: string;
  node_id: string;
  name: string;
  description?: string;
  containing_frame: {
    nodeId: string;
    name: string;
    backgroundColor?: string;
    pageName: string;
  };
}

/**
 * コンポーネントのコンテナフレーム情報
 */
export interface ContainingFrame {
  /** ノードID */
  readonly nodeId: string;
  /** フレーム名 */
  readonly name: string;
  /** 背景色 */
  readonly backgroundColor: string;
  /** ページ名 */
  readonly pageName: string;
}

/**
 * Figmaコンポーネントのデータ構造
 */
export interface ComponentData {
  /** コンポーネントのキー */
  readonly key: string;
  /** ファイルキー */
  readonly fileKey: string;
  /** ノードID */
  readonly nodeId: string;
  /** コンポーネント名 */
  readonly name: string;
  /** 説明 */
  readonly description: string;
  /** コンテナフレーム情報 */
  readonly containingFrame: ContainingFrame;
}

/**
 * ComponentDataのコンパニオンオブジェクト
 * コンポーネントデータの取得と操作のための純粋関数を提供
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ComponentData {
  /**
   * Figma APIレスポンスからComponentDataの配列を作成
   */
  export function fromResponse(response: GetComponentsResponse): ComponentData[] {
    if (!response.meta?.components) {
      return [];
    }

    // componentsはComponent[]型として定義されているが、実際はApiComponent[]
    const apiComponents = response.meta.components as unknown as ApiComponent[];
    return apiComponents.map((comp) => ({
      key: comp.key,
      fileKey: comp.file_key,
      nodeId: comp.node_id,
      name: comp.name,
      description: comp.description || '',
      containingFrame: {
        nodeId: comp.containing_frame.nodeId,
        name: comp.containing_frame.name,
        backgroundColor: comp.containing_frame.backgroundColor || '',
        pageName: comp.containing_frame.pageName,
      },
    }));
  }

  /**
   * ファイルのコンポーネント一覧を取得
   */
  export async function fetchAll(
    context: FigmaContext,
    fileKey: string
  ): Promise<ComponentData[]> {
    const url = `${context.baseUrl}/v1/files/${fileKey}/components`;
    
    const response = await globalThis.fetch(url, {
      method: 'GET',
      headers: context.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch components: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as GetComponentsResponse;
    return fromResponse(data);
  }

  /**
   * コンポーネントをページごとにグループ化
   */
  export function groupByPage(
    components: ComponentData[]
  ): Record<string, ComponentData[]> {
    const grouped: Record<string, ComponentData[]> = {};

    for (const component of components) {
      const pageName = component.containingFrame.pageName;
      if (!grouped[pageName]) {
        grouped[pageName] = [];
      }
      grouped[pageName].push(component);
    }

    return grouped;
  }

  /**
   * 名前でコンポーネントをフィルタリング
   */
  export function filterByName(
    components: ComponentData[],
    searchTerm: string
  ): ComponentData[] {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return components.filter(comp => 
      comp.name.toLowerCase().includes(lowerSearchTerm)
    );
  }
}
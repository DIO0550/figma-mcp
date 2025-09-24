import type { FigmaContext } from '../../context/index.js';
import type { FileComponentsApiResponse } from '../../../api/endpoints/components/index.js';

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
 * ComponentDataの操作関数群
 */
function fromResponse(response: FileComponentsApiResponse): ComponentData[] {
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

async function fetchAll(context: FigmaContext, fileKey: string): Promise<ComponentData[]> {
  const url = `${context.baseUrl}/v1/files/${fileKey}/components`;

  const response = await globalThis.fetch(url, {
    method: 'GET',
    headers: context.headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch components: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as FileComponentsApiResponse;
  return fromResponse(data);
}

function groupByPage(components: ComponentData[]): Record<string, ComponentData[]> {
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

function filterByName(components: ComponentData[], searchTerm: string): ComponentData[] {
  const lowerSearchTerm = searchTerm.toLowerCase();
  return components.filter((comp) => comp.name.toLowerCase().includes(lowerSearchTerm));
}

export const ComponentData = {
  fromResponse,
  fetchAll,
  groupByPage,
  filterByName,
} as const;

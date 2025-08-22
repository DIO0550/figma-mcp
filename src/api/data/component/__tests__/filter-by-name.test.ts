import { describe, expect, it } from 'vitest';
import { ComponentData } from '../component.js';

describe('ComponentData.filterByName', () => {
  const components: ComponentData[] = [
    {
      key: 'comp-1',
      fileKey: 'file-1',
      nodeId: '1:1',
      name: 'Primary Button',
      description: '',
      containingFrame: {
        nodeId: '0:0',
        name: 'Buttons',
        backgroundColor: '',
        pageName: 'Components',
      },
    },
    {
      key: 'comp-2',
      fileKey: 'file-1',
      nodeId: '2:2',
      name: 'Secondary Button',
      description: '',
      containingFrame: {
        nodeId: '0:1',
        name: 'Buttons',
        backgroundColor: '',
        pageName: 'Components',
      },
    },
    {
      key: 'comp-3',
      fileKey: 'file-1',
      nodeId: '3:3',
      name: 'Card',
      description: '',
      containingFrame: {
        nodeId: '0:2',
        name: 'Cards',
        backgroundColor: '',
        pageName: 'Components',
      },
    },
  ];

  it('名前でコンポーネントをフィルタリングできる', () => {
    const filtered = ComponentData.filterByName(components, 'Button');

    expect(filtered).toHaveLength(2);
    expect(filtered[0].name).toBe('Primary Button');
    expect(filtered[1].name).toBe('Secondary Button');
  });

  it('大文字小文字を区別しない', () => {
    const filtered = ComponentData.filterByName(components, 'button');

    expect(filtered).toHaveLength(2);
  });

  it('部分一致で検索できる', () => {
    const filtered = ComponentData.filterByName(components, 'Pri');

    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('Primary Button');
  });

  it('一致しない場合は空配列を返す', () => {
    const filtered = ComponentData.filterByName(components, 'NonExistent');

    expect(filtered).toEqual([]);
  });
});
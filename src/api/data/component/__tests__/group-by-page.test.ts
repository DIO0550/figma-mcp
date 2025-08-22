import { describe, expect, it } from 'vitest';
import { ComponentData } from '../component.js';

describe('ComponentData.groupByPage', () => {
  it('コンポーネントをページごとにグループ化できる', () => {
    const components: ComponentData[] = [
      {
        key: 'comp-1',
        fileKey: 'file-1',
        nodeId: '1:1',
        name: 'Button',
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
        name: 'Card',
        description: '',
        containingFrame: {
          nodeId: '0:1',
          name: 'Cards',
          backgroundColor: '',
          pageName: 'Components',
        },
      },
      {
        key: 'comp-3',
        fileKey: 'file-1',
        nodeId: '3:3',
        name: 'Icon',
        description: '',
        containingFrame: {
          nodeId: '0:2',
          name: 'Icons',
          backgroundColor: '',
          pageName: 'Icons',
        },
      },
    ];

    const grouped = ComponentData.groupByPage(components);

    expect(Object.keys(grouped)).toEqual(['Components', 'Icons']);
    expect(grouped['Components']).toHaveLength(2);
    expect(grouped['Icons']).toHaveLength(1);
    expect(grouped['Components'][0].name).toBe('Button');
    expect(grouped['Components'][1].name).toBe('Card');
    expect(grouped['Icons'][0].name).toBe('Icon');
  });

  it('空の配列を処理できる', () => {
    const grouped = ComponentData.groupByPage([]);

    expect(grouped).toEqual({});
  });
});
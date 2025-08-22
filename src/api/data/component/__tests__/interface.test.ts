import { describe, expect, it } from 'vitest';
import type { ComponentData } from '../component.js';

describe('ComponentData インターフェース', () => {
  it('必要なプロパティを持つ', () => {
    const componentData: ComponentData = {
      key: 'component-key',
      fileKey: 'file-key',
      nodeId: '1:1',
      name: 'Button Component',
      description: 'Primary button component',
      containingFrame: {
        nodeId: '2:2',
        name: 'Button Frame',
        backgroundColor: '#FFFFFF',
        pageName: 'Components',
      },
    };

    expect(componentData.key).toBe('component-key');
    expect(componentData.name).toBe('Button Component');
    expect(componentData.containingFrame.pageName).toBe('Components');
  });
});
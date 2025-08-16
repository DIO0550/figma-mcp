import { test, expect } from 'vitest';
import { Component } from '../component.js';
import type { Component as FigmaComponent } from '../../../types/figma-types.js';

// テストヘルパー関数
function createMockComponent(
  name: string,
  options: {
    key?: string;
    componentSetId?: string | null;
  } = {}
): FigmaComponent {
  const key = options.key || `comp-${name.toLowerCase().replace(/\W+/g, '-')}`;
  return {
    key,
    name,
    description: '',
    componentSetId: options.componentSetId === null ? undefined : options.componentSetId,
    documentationLinks: [],
    fileKey: 'file-key',
    nodeId: `node-${key}`,
    containingFrame: undefined,
  };
}

test('Component.organizeVariants: 空のコンポーネント配列で空のオブジェクトを返す', () => {
    const result = Component.organizeVariants([]);
    expect(result).toEqual({});
  });

test('Component.organizeVariants: バリアントセットを正しくグループ化する', () => {
    const components = [
      createMockComponent('Button/Primary', { 
        key: 'comp-1',
        componentSetId: 'set-1'
      }),
      createMockComponent('Button/Secondary', { 
        key: 'comp-2',
        componentSetId: 'set-1'
      }),
      createMockComponent('Button/Disabled', { 
        key: 'comp-3',
        componentSetId: 'set-1'
      }),
    ];

    const result = Component.organizeVariants(components);

    expect(result['set-1']).toBeDefined();
    expect(result['set-1'].name).toBe('Button');
    expect(result['set-1'].variants).toHaveLength(3);
    expect(result['set-1'].variants).toContain('comp-1');
    expect(result['set-1'].variants).toContain('comp-2');
    expect(result['set-1'].variants).toContain('comp-3');
    expect(result['set-1'].properties).toEqual({});
  });

test('Component.organizeVariants: 単独コンポーネントに仮想セットIDを割り当てる', () => {
    const components = [
      createMockComponent('SingleButton', { key: 'comp-1' }),
    ];

    const result = Component.organizeVariants(components);

    expect(result['single-comp-1']).toBeDefined();
    expect(result['single-comp-1'].name).toBe('SingleButton');
    expect(result['single-comp-1'].variants).toHaveLength(1);
    expect(result['single-comp-1'].variants).toContain('comp-1');
  });

test('Component.organizeVariants: 複数のバリアントセットと単独コンポーネントを混在させる', () => {
    const components = [
      createMockComponent('Button/Primary', { 
        key: 'comp-1',
        componentSetId: 'set-1'
      }),
      createMockComponent('Button/Secondary', { 
        key: 'comp-2',
        componentSetId: 'set-1'
      }),
      createMockComponent('Icon/Arrow', { 
        key: 'comp-3',
        componentSetId: 'set-2'
      }),
      createMockComponent('Icon/Close', { 
        key: 'comp-4',
        componentSetId: 'set-2'
      }),
      createMockComponent('Logo', { key: 'comp-5' }),
      createMockComponent('Header', { key: 'comp-6' }),
    ];

    const result = Component.organizeVariants(components);

    // バリアントセット
    expect(result['set-1']).toBeDefined();
    expect(result['set-1'].variants).toHaveLength(2);
    expect(result['set-2']).toBeDefined();
    expect(result['set-2'].variants).toHaveLength(2);
    
    // 単独コンポーネント
    expect(result['single-comp-5']).toBeDefined();
    expect(result['single-comp-5'].name).toBe('Logo');
    expect(result['single-comp-6']).toBeDefined();
    expect(result['single-comp-6'].name).toBe('Header');
  });

test.each([
    {
      name: '名前にスラッシュがない場合',
      componentName: 'SimpleButton',
      expectedName: 'SimpleButton',
    },
    {
      name: '名前にスラッシュがある場合',
      componentName: 'Button/Primary',
      expectedName: 'Button',
    },
  ])('Component.organizeVariants: バリアント名を正しく取得する: $name', ({ componentName, expectedName }) => {
    const components = [
      createMockComponent(componentName, { 
        key: 'comp-1',
        componentSetId: 'set-1'
      }),
    ];

    const result = Component.organizeVariants(components);
    expect(result['set-1'].name).toBe(expectedName);
  });
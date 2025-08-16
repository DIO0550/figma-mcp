import { test, expect } from 'vitest';
import { Component } from '../component.js';
import type { Component as FigmaComponent } from '../../../types/figma-types.js';

// テストヘルパー関数
function createMockComponent(
  name: string,
  options: {
    pageName?: string;
    description?: string | null;
  } = {}
): FigmaComponent {
  const key = `comp-${name.toLowerCase().replace(/\W+/g, '-')}`;
  return {
    key,
    name,
    description: options.description === null ? '' : (options.description || ''),
    componentSetId: undefined,
    documentationLinks: [],
    fileKey: 'file-key',
    nodeId: `node-${key}`,
    containingFrame: options.pageName 
      ? { pageId: 'page-1', pageName: options.pageName } 
      : undefined,
  };
}

test('Component.analyze: 空のコンポーネント配列で初期値を返す', () => {
    const result = Component.analyze([]);

    expect(result).toEqual({
      totalComponents: 0,
      categories: {},
      namingPatterns: {},
      pagesDistribution: {},
      descriptionCoverage: 0,
    });
  });

test('Component.analyze: 単一コンポーネントを正しく分析する', () => {
    const components = [
      createMockComponent('Button', {
        description: 'Primary button component',
        pageName: 'Components',
      }),
    ];

    const result = Component.analyze(components);

    expect(result.totalComponents).toBe(1);
    expect(result.categories).toEqual({ Button: 1 });
    expect(result.namingPatterns).toEqual({ simple: 1 });
    expect(result.pagesDistribution).toEqual({ Components: 1 });
    expect(result.descriptionCoverage).toBe(1);
  });

test('Component.analyze: 階層的な名前のカテゴリを正しく抽出する', () => {
    const components = [
      createMockComponent('Button/Primary'),
      createMockComponent('Button/Secondary'),
      createMockComponent('Icon/Arrow'),
      createMockComponent('Icon/Close'),
      createMockComponent('Card/Default'),
    ];

    const result = Component.analyze(components);

    expect(result.categories).toEqual({
      Button: 2,
      Icon: 2,
      Card: 1,
    });
  });

test.each([
    {
      name: '階層的パターン',
      components: [
        createMockComponent('Button/Primary'),
        createMockComponent('Card/Header/Title'),
      ],
      expected: { hierarchical: 2 },
    },
    {
      name: 'kebab-caseパターン',
      components: [
        createMockComponent('icon-arrow'),
        createMockComponent('nav-menu'),
      ],
      expected: { 'kebab-case': 2 },
    },
    {
      name: 'snake_caseパターン',
      components: [
        createMockComponent('user_avatar'),
      ],
      expected: { snake_case: 1 },
    },
    {
      name: '混合パターン',
      components: [
        createMockComponent('Button/Primary'),
        createMockComponent('icon-arrow'),
        createMockComponent('user_avatar'),
        createMockComponent('Logo'),
      ],
      expected: {
        hierarchical: 1,
        'kebab-case': 1,
        snake_case: 1,
        simple: 1,
      },
    },
  ])('Component.analyze: 命名パターンを識別する: $name', ({ components, expected }) => {
    const result = Component.analyze(components);
    expect(result.namingPatterns).toEqual(expected);
  });

test('Component.analyze: ページごとの分布を正しく集計する', () => {
    const components = [
      createMockComponent('Component1', { pageName: 'Page1' }),
      createMockComponent('Component2', { pageName: 'Page1' }),
      createMockComponent('Component3', { pageName: 'Page2' }),
      createMockComponent('Component4', { pageName: 'Page2' }),
      createMockComponent('Component5', { pageName: 'Page2' }),
      createMockComponent('Component6', { pageName: 'Page3' }),
    ];

    const result = Component.analyze(components);

    expect(result.pagesDistribution).toEqual({
      Page1: 2,
      Page2: 3,
      Page3: 1,
    });
  });

test.each([
    {
      name: 'すべて説明あり',
      components: [
        createMockComponent('C1', { description: 'Has description' }),
        createMockComponent('C2', { description: 'Another description' }),
      ],
      expectedCoverage: 1,
    },
    {
      name: '一部説明あり',
      components: [
        createMockComponent('C1', { description: 'Has description' }),
        createMockComponent('C2', { description: '' }),
        createMockComponent('C3', { description: 'Another description' }),
        createMockComponent('C4', { description: null }),
        createMockComponent('C5', { description: '   ' }), // 空白文字のみ
      ],
      expectedCoverage: 0.4,
    },
    {
      name: 'すべて説明なし',
      components: [
        createMockComponent('C1', { description: '' }),
        createMockComponent('C2', { description: null }),
      ],
      expectedCoverage: 0,
    },
  ])('Component.analyze: descriptionカバレッジを計算する: $name', ({ components, expectedCoverage }) => {
    const result = Component.analyze(components);
    expect(result.descriptionCoverage).toBe(expectedCoverage);
  });

test('Component.analyze: containingFrameがない場合でもエラーにならない', () => {
    const components = [createMockComponent('Component1')];
    const result = Component.analyze(components);

    expect(result.pagesDistribution).toEqual({});
  });
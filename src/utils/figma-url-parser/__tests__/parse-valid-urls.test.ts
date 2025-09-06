import { test, expect } from 'vitest';
import { ParsedFigmaUrl } from '../figma-url-parser.js';

/**
 * 正常系URLのパーステスト
 * test.each()を使用してパラメータ化
 */

// 正常系URLのテストケース
const validUrlCases: Array<[string, string, string | undefined, string | undefined]> = [
  // [URL, 期待されるfileId, 期待されるfileName, 期待されるnodeId]
  ['https://www.figma.com/file/ABC123xyz/My-Design-File', 'ABC123xyz', 'My-Design-File', undefined],
  ['https://figma.com/file/ABC123xyz/My-Design-File', 'ABC123xyz', 'My-Design-File', undefined],
  ['https://www.figma.com/design/XYZ789abc/My-Design', 'XYZ789abc', 'My-Design', undefined],
  ['https://www.figma.com/file/ABC123xyz', 'ABC123xyz', undefined, undefined],
  [
    'https://www.figma.com/file/ABC123xyz/My-Design?node-id=1234-5678',
    'ABC123xyz',
    'My-Design',
    '1234-5678',
  ],
  [
    'https://www.figma.com/design/XYZ789abc/My-Design-File?node-id=9876-5432',
    'XYZ789abc',
    'My-Design-File',
    '9876-5432',
  ],
  [
    'https://www.figma.com/file/ABC123xyz/My%20Design%20File',
    'ABC123xyz',
    'My Design File',
    undefined,
  ],
  [
    'https://www.figma.com/file/ABC123xyz/My-Design-File?node-id=1234-5678&t=abcdef&scaling=min-zoom',
    'ABC123xyz',
    'My-Design-File',
    '1234-5678',
  ],
  ['http://www.figma.com/file/ABC123xyz/My-Design-File', 'ABC123xyz', 'My-Design-File', undefined],
  ['https://www.FIGMA.COM/file/ABC123xyz/My-Design-File', 'ABC123xyz', 'My-Design-File', undefined],
  [
    'https://www.figma.com/file/ABC123xyz/My-Design-File/',
    'ABC123xyz',
    'My-Design-File',
    undefined,
  ],
  ['https://www.figma.com/file/ABC123xyz/My/Design/File', 'ABC123xyz', 'My/Design/File', undefined],
  ['https://www.figma.com/file/a1B2c3D4e5/Design', 'a1B2c3D4e5', 'Design', undefined],
  ['https://www.figma.com/file/ABC_123-xyz/Design', 'ABC_123-xyz', 'Design', undefined],
];

test.each(validUrlCases)(
  'ParsedFigmaUrl.parse - URL "%s" を解析すると、fileId=%s, fileName=%s, nodeId=%s が抽出される',
  (url, expectedFileId, expectedFileName, expectedNodeId) => {
    // Act
    const result = ParsedFigmaUrl.parse(url);

    // Assert
    expect(result.fileId).toBe(expectedFileId);
    expect(result.fileName).toBe(expectedFileName);
    expect(result.nodeId).toBe(expectedNodeId);

    // 結果がfrozenであることを確認
    expect(Object.isFrozen(result)).toBe(true);
  }
);

test('ParsedFigmaUrl.parse - 極端に長いファイル名も正しく解析される', () => {
  // Arrange
  const longFileName = 'A'.repeat(1000);
  const url = `https://www.figma.com/file/ABC123xyz/${longFileName}`;

  // Act
  const result = ParsedFigmaUrl.parse(url);

  // Assert
  expect(result.fileId).toBe('ABC123xyz');
  expect(result.fileName).toBe(longFileName);
  expect(result.nodeId).toBeUndefined();
});

test('ParsedFigmaUrl.parse - 特殊文字を含むファイル名も正しくデコードされる', () => {
  // Arrange
  const url = 'https://www.figma.com/file/ABC123xyz/Design%20%26%20Development%20%232';

  // Act
  const result = ParsedFigmaUrl.parse(url);

  // Assert
  expect(result.fileId).toBe('ABC123xyz');
  expect(result.fileName).toBe('Design & Development #2');
  expect(result.nodeId).toBeUndefined();
});

test('ParsedFigmaUrl.parse - 日本語を含むファイル名も正しくデコードされる', () => {
  // Arrange
  const url =
    'https://www.figma.com/file/ABC123xyz/%E3%83%87%E3%82%B6%E3%82%A4%E3%83%B3%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB';

  // Act
  const result = ParsedFigmaUrl.parse(url);

  // Assert
  expect(result.fileId).toBe('ABC123xyz');
  expect(result.fileName).toBe('デザインファイル');
  expect(result.nodeId).toBeUndefined();
});

test('ParsedFigmaUrl.parse - 複数のスラッシュとダッシュを含むファイル名も正しく解析される', () => {
  // Arrange
  const url = 'https://www.figma.com/file/ABC123xyz/2024/01/15/design-system-v2';

  // Act
  const result = ParsedFigmaUrl.parse(url);

  // Assert
  expect(result.fileId).toBe('ABC123xyz');
  expect(result.fileName).toBe('2024/01/15/design-system-v2');
  expect(result.nodeId).toBeUndefined();
});

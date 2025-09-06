import { test, expect } from 'vitest';
import { ParsedFigmaUrl } from '../figma-url-parser.js';

/**
 * エッジケースのテスト
 * 境界値や特殊なケースをテスト
 */

test('ParsedFigmaUrl.parse - 最小長のfileID（1文字）も正しく解析される', () => {
  // Arrange
  const url = 'https://www.figma.com/file/a/Design';

  // Act
  const result = ParsedFigmaUrl.parse(url);

  // Assert
  expect(result.fileId).toBe('a');
  expect(result.fileName).toBe('Design');
  expect(result.nodeId).toBeUndefined();
});

test('ParsedFigmaUrl.parse - 非常に長いfileIDも正しく解析される', () => {
  // Arrange
  const longFileId = 'A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8S9t0U1v2W3x4Y5z6'.repeat(10);
  const url = `https://www.figma.com/file/${longFileId}/Design`;

  // Act
  const result = ParsedFigmaUrl.parse(url);

  // Assert
  expect(result.fileId).toBe(longFileId);
  expect(result.fileName).toBe('Design');
});

test('ParsedFigmaUrl.parse - 複数の連続スラッシュを含むパスも正しく解析される', () => {
  // Arrange
  const url = 'https://www.figma.com/file/ABC123xyz///My///Design///File';

  // Act
  const result = ParsedFigmaUrl.parse(url);

  // Assert
  expect(result.fileId).toBe('ABC123xyz');
  // 空のセグメントはfilterで除外されるため、連続スラッシュは単一スラッシュとして扱われる
  expect(result.fileName).toBe('My/Design/File');
});

test('ParsedFigmaUrl.parse - トレイリングスラッシュが複数ある場合も正しく解析される', () => {
  // Arrange
  const url = 'https://www.figma.com/file/ABC123xyz/Design///';

  // Act
  const result = ParsedFigmaUrl.parse(url);

  // Assert
  expect(result.fileId).toBe('ABC123xyz');
  expect(result.fileName).toBe('Design');
});

test('ParsedFigmaUrl.parse - クエリパラメータにnode-idが複数ある場合、最初の値が使用される', () => {
  // Arrange
  const url = 'https://www.figma.com/file/ABC123xyz/Design?node-id=1-1&node-id=2-2';

  // Act
  const result = ParsedFigmaUrl.parse(url);

  // Assert
  expect(result.fileId).toBe('ABC123xyz');
  expect(result.fileName).toBe('Design');
  expect(result.nodeId).toBe('1-1'); // 最初のnode-idが使用される
});

test('ParsedFigmaUrl.parse - node-idが空文字列の場合はundefinedになる', () => {
  // Arrange
  const url = 'https://www.figma.com/file/ABC123xyz/Design?node-id=';

  // Act
  const result = ParsedFigmaUrl.parse(url);

  // Assert
  expect(result.fileId).toBe('ABC123xyz');
  expect(result.fileName).toBe('Design');
  expect(result.nodeId).toBeUndefined();
});

test('ParsedFigmaUrl.parse - node-idにスペースが含まれる場合も正しく取得される', () => {
  // Arrange
  const url = 'https://www.figma.com/file/ABC123xyz/Design?node-id=1234%205678';

  // Act
  const result = ParsedFigmaUrl.parse(url);

  // Assert
  expect(result.fileId).toBe('ABC123xyz');
  expect(result.fileName).toBe('Design');
  expect(result.nodeId).toBe('1234 5678'); // URLデコードされる
});

test('ParsedFigmaUrl.parse - ハッシュフラグメントが含まれる場合も正しく解析される', () => {
  // Arrange
  const url = 'https://www.figma.com/file/ABC123xyz/Design#some-anchor';

  // Act
  const result = ParsedFigmaUrl.parse(url);

  // Assert
  expect(result.fileId).toBe('ABC123xyz');
  expect(result.fileName).toBe('Design');
  expect(result.nodeId).toBeUndefined();
  // ハッシュフラグメントは無視される
});

test('ParsedFigmaUrl.parse - ポート番号が含まれるURLも正しく解析される', () => {
  // Arrange
  const url = 'https://www.figma.com:443/file/ABC123xyz/Design';

  // Act
  const result = ParsedFigmaUrl.parse(url);

  // Assert
  expect(result.fileId).toBe('ABC123xyz');
  expect(result.fileName).toBe('Design');
});

test('ParsedFigmaUrl.parse - fileIDにアンダースコアとハイフンが混在しても正しく解析される', () => {
  // Arrange
  const url = 'https://www.figma.com/file/ABC_123-xyz_456-789/Design';

  // Act
  const result = ParsedFigmaUrl.parse(url);

  // Assert
  expect(result.fileId).toBe('ABC_123-xyz_456-789');
  expect(result.fileName).toBe('Design');
});

test('ParsedFigmaUrl.parse - ファイル名がドットで始まる場合も正しく解析される', () => {
  // Arrange
  const url = 'https://www.figma.com/file/ABC123xyz/.hidden-design-file';

  // Act
  const result = ParsedFigmaUrl.parse(url);

  // Assert
  expect(result.fileId).toBe('ABC123xyz');
  expect(result.fileName).toBe('.hidden-design-file');
});

test('ParsedFigmaUrl.parse - ファイル名に@記号が含まれる場合も正しく解析される', () => {
  // Arrange
  const url = 'https://www.figma.com/file/ABC123xyz/design@2x';

  // Act
  const result = ParsedFigmaUrl.parse(url);

  // Assert
  expect(result.fileId).toBe('ABC123xyz');
  expect(result.fileName).toBe('design@2x');
});

test('ParsedFigmaUrl.parse - 結果オブジェクトは常にfrozenである', () => {
  // Arrange
  const url = 'https://www.figma.com/file/ABC123xyz/Design';

  // Act
  const result = ParsedFigmaUrl.parse(url);

  // Assert
  expect(Object.isFrozen(result)).toBe(true);

  // オブジェクトの変更を試みる
  const mutableResult = result as { fileId: string; fileName?: string; nodeId?: string };
  expect(() => {
    mutableResult.fileId = 'MODIFIED';
  }).toThrow();
});

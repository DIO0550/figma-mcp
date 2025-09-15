import { test, expect } from 'vitest';
import { ParsedFigmaUrl } from '../figma-url-parser.js';
import { ErrorMessages, FigmaErrorMessages } from '../../../constants/index.js';

/**
 * 異常系URLのパーステスト
 * エラーケースを網羅的にテスト
 */

// エラーメッセージは統一されたErrorMessagesから取得

// エラーケースのテストデータ
const errorCases: Array<[string, string, string]> = [
  // [URL, 期待されるエラーメッセージ, テスト説明]
  ['not-a-url', ErrorMessages.INVALID_URL, '無効なURL形式'],
  ['https://example.com/file/ABC123xyz', FigmaErrorMessages.NOT_FIGMA_URL, 'Figma以外のドメイン'],
  ['https://www.design.com/file/ABC123xyz', FigmaErrorMessages.NOT_FIGMA_URL, 'figmaを含まないドメイン'],
  [
    'https://www.figma.com/proto/ABC123xyz/Prototype',
    FigmaErrorMessages.UNSUPPORTED_FIGMA_URL_PATTERN,
    'protoタイプ（非対応）',
  ],
  ['https://www.figma.com/', FigmaErrorMessages.UNSUPPORTED_FIGMA_URL_PATTERN, '空のパス'],
  ['https://www.figma.com/file', FigmaErrorMessages.UNSUPPORTED_FIGMA_URL_PATTERN, 'fileIDなし'],
  [
    'https://www.figma.com/board/ABC123xyz/My-Board',
    FigmaErrorMessages.UNSUPPORTED_FIGMA_URL_PATTERN,
    'boardタイプ（非対応）',
  ],
  [
    'https://www.figma.com/file/@@@/Invalid',
    FigmaErrorMessages.INVALID_FIGMA_FILE_ID,
    '特殊文字のみのfileID',
  ],
  [
    'https://www.figma.com/file/ABC@123!xyz/Design',
    FigmaErrorMessages.INVALID_FIGMA_FILE_ID,
    '不正な文字を含むfileID',
  ],
  [
    'https://www.figma.com/files/ABC123xyz/Design',
    FigmaErrorMessages.UNSUPPORTED_FIGMA_URL_PATTERN,
    'filesタイプ（誤り）',
  ],
  ['//www.figma.com/file/ABC123xyz', ErrorMessages.INVALID_URL, 'プロトコルなし'],
  [
    'https://www.figma.com/file/日本語/Design',
    FigmaErrorMessages.INVALID_FIGMA_FILE_ID,
    '日本語のfileID',
  ],
  [
    'https://www.figma.com/file/ABC 123/Design',
    FigmaErrorMessages.INVALID_FIGMA_FILE_ID,
    'スペースを含むfileID',
  ],
];

test.each(errorCases)(
  'ParsedFigmaUrl.parse - %s（%s）を解析すると、"%s" エラーが発生する',
  (url, expectedError, description) => {
    // Act & Assert
    expect(() => ParsedFigmaUrl.parse(url), `${description}のケースでエラーが発生すべき`).toThrow(
      expectedError
    );
  }
);

test('ParsedFigmaUrl.parse - nullを渡すとINVALID_URLエラーが発生する', () => {
  // Act & Assert
  expect(() => ParsedFigmaUrl.parse(null as unknown as string)).toThrow(ErrorMessages.INVALID_URL);
});

test('ParsedFigmaUrl.parse - undefinedを渡すとINVALID_URLエラーが発生する', () => {
  // Act & Assert
  expect(() => ParsedFigmaUrl.parse(undefined as unknown as string)).toThrow(
    ErrorMessages.INVALID_URL
  );
});

test('ParsedFigmaUrl.parse - 空文字列を渡すとINVALID_URLエラーが発生する', () => {
  // Act & Assert
  expect(() => ParsedFigmaUrl.parse('')).toThrow(ErrorMessages.INVALID_URL);
});

test('ParsedFigmaUrl.parse - 数値を渡すとINVALID_URLエラーが発生する', () => {
  // Act & Assert
  expect(() => ParsedFigmaUrl.parse(12345 as unknown as string)).toThrow(ErrorMessages.INVALID_URL);
});

test('ParsedFigmaUrl.parse - オブジェクトを渡すとINVALID_URLエラーが発生する', () => {
  // Act & Assert
  expect(() => ParsedFigmaUrl.parse({} as unknown as string)).toThrow(ErrorMessages.INVALID_URL);
});

test('ParsedFigmaUrl.parse - 配列を渡すとINVALID_URLエラーが発生する', () => {
  // Act & Assert
  expect(() => ParsedFigmaUrl.parse([] as unknown as string)).toThrow(ErrorMessages.INVALID_URL);
});

test('ParsedFigmaUrl.parse - サブドメインがfigmaでない場合はNOT_FIGMA_URLエラーが発生する', () => {
  // Arrange
  const url = 'https://design.company.com/file/ABC123xyz/Design';

  // Act & Assert
  expect(() => ParsedFigmaUrl.parse(url)).toThrow(FigmaErrorMessages.NOT_FIGMA_URL);
});

test('ParsedFigmaUrl.parse - localhostの場合はNOT_FIGMA_URLエラーが発生する', () => {
  // Arrange
  const url = 'http://localhost:3000/file/ABC123xyz/Design';

  // Act & Assert
  expect(() => ParsedFigmaUrl.parse(url)).toThrow(FigmaErrorMessages.NOT_FIGMA_URL);
});

test('ParsedFigmaUrl.parse - ドットで始まるfileIDの場合はINVALID_FILE_IDエラーが発生する', () => {
  // Arrange
  const url = 'https://www.figma.com/file/.ABC123xyz/Design';

  // Act & Assert
  expect(() => ParsedFigmaUrl.parse(url)).toThrow(FigmaErrorMessages.INVALID_FIGMA_FILE_ID);
});

// 注意: 以下のケースは実装の仕様により、期待と異なる動作をする可能性があります
test('ParsedFigmaUrl.parse - 空のfileIDパス（//）の場合、filterで除外されてDesignがfileIDになる', () => {
  // Arrange
  const url = 'https://www.figma.com/file//Design';

  // Act
  const result = ParsedFigmaUrl.parse(url);

  // Assert - 'Design'がfileIDとして扱われる
  expect(result.fileId).toBe('Design');
  expect(result.fileName).toBeUndefined();
});

test('ParsedFigmaUrl.parse - figmaを含む別ドメイン（not-figma.com）はNOT_FIGMA_URLエラーが発生する', () => {
  // Arrange
  const url = 'https://not-figma.com/file/ABC123xyz/Design';

  // Act & Assert
  expect(() => ParsedFigmaUrl.parse(url)).toThrow(FigmaErrorMessages.NOT_FIGMA_URL);
});

test('ParsedFigmaUrl.parse - FTPプロトコルでもfigmaドメインなら受け入れられる', () => {
  // Arrange
  const url = 'ftp://www.figma.com/file/ABC123xyz/Design';

  // Act
  const result = ParsedFigmaUrl.parse(url);

  // Assert - プロトコルは関係なく、ドメインのみチェックされる
  expect(result.fileId).toBe('ABC123xyz');
  expect(result.fileName).toBe('Design');
});

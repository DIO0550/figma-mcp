import { test, expect } from 'vitest';
import { createFigmaError, parseFigmaErrorResponse, isRateLimitError } from './errors';
import type { RateLimitInfo } from './rate-limit/index';
import { HttpStatus, FigmaErrorNames, ErrorMessages } from '../constants';

/**
 * モックResponseオブジェクトを作成するヘルパー関数。
 * @param options レスポンスのステータスやJSONの内容などモックに必要な値
 * @returns Figma APIレスポンスを模したResponseオブジェクト
 */
function createMockResponse(options: {
  status: number;
  statusText: string;
  jsonData?: unknown;
  shouldThrow?: boolean;
}): Response {
  return {
    status: options.status,
    statusText: options.statusText,
    json: options.shouldThrow
      ? (): Promise<unknown> => {
          throw new Error('Invalid JSON');
        }
      : (): Promise<unknown> => Promise.resolve(options.jsonData ?? {}),
    ok: options.status >= 200 && options.status < 300,
    headers: new Headers(),
    redirected: false,
    type: 'basic',
    url: 'https://api.figma.com/test',
    clone: function (): Response {
      return this;
    },
    body: null,
    bodyUsed: false,
    arrayBuffer: (): Promise<ArrayBuffer> => Promise.resolve(new ArrayBuffer(0)),
    blob: (): Promise<Blob> => Promise.resolve(new Blob([])),
    formData: (): Promise<FormData> => Promise.resolve({} as FormData),
    text: (): Promise<string> => Promise.resolve(''),
  } as Response;
}

// createFigmaError のテスト
test('createFigmaError - エラーメッセージとステータスコードを指定すると、FigmaErrorインスタンスが正しく作成される', () => {
  // Arrange
  const errorMessage = 'API Error';
  const statusCode = HttpStatus.BAD_REQUEST;

  // Act
  const error = createFigmaError(errorMessage, statusCode);

  // Assert
  expect(error).toBeInstanceOf(Error);
  expect(error.name).toBe(FigmaErrorNames.FIGMA_ERROR);
  expect(error.message).toBe(errorMessage);
  expect(error.status).toBe(statusCode);
  expect(error.rateLimitInfo).toBeUndefined();
});

test('createFigmaError - レート制限情報を含む場合、rateLimitInfoプロパティが設定される', () => {
  // Arrange
  const rateLimitInfo: RateLimitInfo = {
    remaining: 10,
    reset: new Date('2024-01-01T00:00:00Z'),
  };
  const errorMessage = 'Rate limit exceeded';
  const statusCode = HttpStatus.TOO_MANY_REQUESTS;

  // Act
  const error = createFigmaError(errorMessage, statusCode, rateLimitInfo);

  // Assert
  expect(error.status).toBe(statusCode);
  expect(error.rateLimitInfo).toEqual(rateLimitInfo);
});

test('createFigmaError - 空文字のエラーメッセージでもFigmaErrorインスタンスが作成される', () => {
  // Arrange
  const errorMessage = '';
  const statusCode = HttpStatus.BAD_REQUEST;

  // Act
  const error = createFigmaError(errorMessage, statusCode);

  // Assert
  expect(error.message).toBe('');
  expect(error.status).toBe(statusCode);
});

test('createFigmaError - ステータスコード0でもFigmaErrorインスタンスが作成される', () => {
  // Arrange
  const errorMessage = 'Error';
  const statusCode = 0;

  // Act
  const error = createFigmaError(errorMessage, statusCode);

  // Assert
  expect(error.status).toBe(0);
});

test('createFigmaError - 負のステータスコードでもFigmaErrorインスタンスが作成される', () => {
  // Arrange
  const errorMessage = 'Error';
  const statusCode = -1;

  // Act
  const error = createFigmaError(errorMessage, statusCode);

  // Assert
  expect(error.status).toBe(-1);
});

// parseFigmaErrorResponse のテスト
test('parseFigmaErrorResponse - JSONレスポンスからerrフィールドを抽出すると、エラーメッセージが返される', async () => {
  // Arrange
  const mockResponse = createMockResponse({
    status: HttpStatus.NOT_FOUND,
    statusText: ErrorMessages.NOT_FOUND,
    jsonData: { err: 'File not found' },
  });

  // Act
  const message = await parseFigmaErrorResponse(mockResponse);

  // Assert
  expect(message).toBe('File not found');
});

test('parseFigmaErrorResponse - errフィールドがない場合、HTTPステータスが返される', async () => {
  // Arrange
  const mockResponse = createMockResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    statusText: ErrorMessages.INTERNAL_SERVER_ERROR,
    jsonData: { message: 'Something went wrong' },
  });

  // Act
  const message = await parseFigmaErrorResponse(mockResponse);

  // Assert
  expect(message).toBe(
    `HTTP ${HttpStatus.INTERNAL_SERVER_ERROR}: ${ErrorMessages.INTERNAL_SERVER_ERROR}`
  );
});

test('parseFigmaErrorResponse - JSON解析に失敗した場合、HTTPステータスが返される', async () => {
  // Arrange
  const mockResponse = createMockResponse({
    status: HttpStatus.BAD_GATEWAY,
    statusText: ErrorMessages.BAD_GATEWAY,
    shouldThrow: true,
  });

  // Act
  const message = await parseFigmaErrorResponse(mockResponse);

  // Assert
  expect(message).toBe(`HTTP ${HttpStatus.BAD_GATEWAY}: ${ErrorMessages.BAD_GATEWAY}`);
});

test('parseFigmaErrorResponse - errフィールドが空文字の場合、HTTPステータスが返される', async () => {
  // Arrange
  const mockResponse = createMockResponse({
    status: HttpStatus.BAD_REQUEST,
    statusText: 'Bad Request',
    jsonData: { err: '' },
  });

  // Act
  const message = await parseFigmaErrorResponse(mockResponse);

  // Assert
  expect(message).toBe('HTTP 400: Bad Request');
});

test('parseFigmaErrorResponse - errフィールドがnullの場合、HTTPステータスが返される', async () => {
  // Arrange
  const mockResponse = createMockResponse({
    status: HttpStatus.BAD_REQUEST,
    statusText: 'Bad Request',
    jsonData: { err: null },
  });

  // Act
  const message = await parseFigmaErrorResponse(mockResponse);

  // Assert
  expect(message).toBe('HTTP 400: Bad Request');
});

test('parseFigmaErrorResponse - レスポンスボディが空の場合、HTTPステータスが返される', async () => {
  // Arrange
  const mockResponse = createMockResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    statusText: 'Internal Server Error',
    jsonData: null,
  });

  // Act
  const message = await parseFigmaErrorResponse(mockResponse);

  // Assert
  expect(message).toBe('HTTP 500: Internal Server Error');
});

// isRateLimitError のテスト
test('isRateLimitError - ステータス429のエラーは、レート制限エラーと判定される', () => {
  // Arrange
  const error = createFigmaError('Rate limit', HttpStatus.TOO_MANY_REQUESTS);

  // Act & Assert
  expect(isRateLimitError(error)).toBe(true);
});

test('isRateLimitError - ステータス429以外のエラーは、レート制限エラーと判定されない', () => {
  // Arrange
  const error = createFigmaError('Not found', HttpStatus.NOT_FOUND);

  // Act & Assert
  expect(isRateLimitError(error)).toBe(false);
});

test('isRateLimitError - 通常のErrorオブジェクトは、レート制限エラーと判定されない', () => {
  // Arrange
  const error = new Error('Normal error');

  // Act & Assert
  expect(isRateLimitError(error)).toBe(false);
});

test('isRateLimitError - nullは、レート制限エラーと判定されない', () => {
  // Act & Assert
  expect(isRateLimitError(null)).toBe(false);
});

test('isRateLimitError - undefinedは、レート制限エラーと判定されない', () => {
  // Act & Assert
  expect(isRateLimitError(undefined)).toBe(false);
});

test('isRateLimitError - 空オブジェクトは、レート制限エラーと判定されない', () => {
  // Act & Assert
  expect(isRateLimitError({})).toBe(false);
});

test('isRateLimitError - statusプロパティが文字列の場合、レート制限エラーと判定されない', () => {
  // Arrange
  const errorWithStringStatus = Object.assign(new Error('Error'), { status: '429' });

  // Act & Assert
  expect(isRateLimitError(errorWithStringStatus)).toBe(false);
});

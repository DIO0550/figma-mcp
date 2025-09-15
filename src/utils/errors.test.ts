import { describe, test, expect } from 'vitest';
import { createFigmaError, parseFigmaErrorResponse, isRateLimitError } from './errors';
import type { RateLimitInfo } from './rate-limit/index';
import { HttpStatus, FigmaErrorNames, ErrorMessages } from '../constants';

describe('createFigmaError', () => {
  test('エラーメッセージとステータスコードを持つFigmaErrorを作成できる', () => {
    const error = createFigmaError('API Error', HttpStatus.BAD_REQUEST);

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe(FigmaErrorNames.FIGMA_ERROR);
    expect(error.message).toBe('API Error');
    expect(error.status).toBe(HttpStatus.BAD_REQUEST);
    expect(error.rateLimitInfo).toBeUndefined();
  });

  test('レート制限情報を含むFigmaErrorを作成できる', () => {
    const rateLimitInfo: RateLimitInfo = {
      remaining: 10,
      reset: new Date('2024-01-01T00:00:00Z'),
    };
    const error = createFigmaError(
      'Rate limit exceeded',
      HttpStatus.TOO_MANY_REQUESTS,
      rateLimitInfo
    );

    expect(error.status).toBe(HttpStatus.TOO_MANY_REQUESTS);
    expect(error.rateLimitInfo).toEqual(rateLimitInfo);
  });
});

describe('parseFigmaErrorResponse', () => {
  test('JSONレスポンスからエラーメッセージを抽出できる', async () => {
    const mockResponse = {
      json: () => Promise.resolve({ err: 'File not found' }),
      status: HttpStatus.NOT_FOUND,
      statusText: ErrorMessages.NOT_FOUND,
    } as Response;

    const message = await parseFigmaErrorResponse(mockResponse);
    expect(message).toBe('File not found');
  });

  test('JSONにerrフィールドがない場合はHTTPステータスを返す', async () => {
    const mockResponse = {
      json: () => Promise.resolve({ message: 'Something went wrong' }),
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      statusText: ErrorMessages.INTERNAL_SERVER_ERROR,
    } as Response;

    const message = await parseFigmaErrorResponse(mockResponse);
    expect(message).toBe(
      `HTTP ${HttpStatus.INTERNAL_SERVER_ERROR}: ${ErrorMessages.INTERNAL_SERVER_ERROR}`
    );
  });

  test('JSON解析に失敗した場合はHTTPステータスを返す', async () => {
    const mockResponse = {
      json: () => {
        throw new Error('Invalid JSON');
      },
      status: HttpStatus.BAD_GATEWAY,
      statusText: ErrorMessages.BAD_GATEWAY,
    } as unknown as Response;

    const message = await parseFigmaErrorResponse(mockResponse);
    expect(message).toBe(`HTTP ${HttpStatus.BAD_GATEWAY}: ${ErrorMessages.BAD_GATEWAY}`);
  });
});

describe('isRateLimitError', () => {
  test('ステータス429のエラーはレート制限エラーと判定される', () => {
    const error = createFigmaError('Rate limit', HttpStatus.TOO_MANY_REQUESTS);
    expect(isRateLimitError(error)).toBe(true);
  });

  test('ステータス429以外のエラーはレート制限エラーと判定されない', () => {
    const error = createFigmaError('Not found', HttpStatus.NOT_FOUND);
    expect(isRateLimitError(error)).toBe(false);
  });

  test('通常のErrorオブジェクトはレート制限エラーと判定されない', () => {
    const error = new Error('Normal error');
    expect(isRateLimitError(error)).toBe(false);
  });

  test('nullやundefinedはレート制限エラーと判定されない', () => {
    expect(isRateLimitError(null)).toBe(false);
    expect(isRateLimitError(undefined)).toBe(false);
  });
});

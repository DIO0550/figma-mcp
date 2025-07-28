import { describe, test, expect } from 'vitest';
import { createFigmaError, parseFigmaErrorResponse, isRateLimitError } from './errors';
import type { RateLimitInfo } from '../types';

describe('createFigmaError', () => {
  test('エラーメッセージとステータスコードを持つFigmaErrorを作成できる', () => {
    const error = createFigmaError('API Error', 400);

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('FigmaError');
    expect(error.message).toBe('API Error');
    expect(error.status).toBe(400);
    expect(error.rateLimitInfo).toBeUndefined();
  });

  test('レート制限情報を含むFigmaErrorを作成できる', () => {
    const rateLimitInfo: RateLimitInfo = {
      remaining: 10,
      reset: new Date('2024-01-01T00:00:00Z'),
    };
    const error = createFigmaError('Rate limit exceeded', 429, rateLimitInfo);

    expect(error.status).toBe(429);
    expect(error.rateLimitInfo).toEqual(rateLimitInfo);
  });
});

describe('parseFigmaErrorResponse', () => {
  test('JSONレスポンスからエラーメッセージを抽出できる', async () => {
    const mockResponse = {
      json: () => Promise.resolve({ err: 'File not found' }),
      status: 404,
      statusText: 'Not Found',
    } as Response;

    const message = await parseFigmaErrorResponse(mockResponse);
    expect(message).toBe('File not found');
  });

  test('JSONにerrフィールドがない場合はHTTPステータスを返す', async () => {
    const mockResponse = {
      json: () => Promise.resolve({ message: 'Something went wrong' }),
      status: 500,
      statusText: 'Internal Server Error',
    } as Response;

    const message = await parseFigmaErrorResponse(mockResponse);
    expect(message).toBe('HTTP 500: Internal Server Error');
  });

  test('JSON解析に失敗した場合はHTTPステータスを返す', async () => {
    const mockResponse = {
      json: () => {
        throw new Error('Invalid JSON');
      },
      status: 502,
      statusText: 'Bad Gateway',
    } as unknown as Response;

    const message = await parseFigmaErrorResponse(mockResponse);
    expect(message).toBe('HTTP 502: Bad Gateway');
  });
});

describe('isRateLimitError', () => {
  test('ステータス429のエラーはレート制限エラーと判定される', () => {
    const error = createFigmaError('Rate limit', 429);
    expect(isRateLimitError(error)).toBe(true);
  });

  test('ステータス429以外のエラーはレート制限エラーと判定されない', () => {
    const error = createFigmaError('Not found', 404);
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

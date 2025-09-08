import { describe, test, expect } from 'vitest';
import { shouldRetry } from '../rate-limit.js';
import { HttpStatus } from '../../../constants/index.js';

describe('shouldRetry', () => {
  test.each([
    { status: HttpStatus.TOO_MANY_REQUESTS, expected: true, description: 'レート制限エラー(429)' },
    {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      expected: true,
      description: 'サーバーエラー(500)',
    },
    { status: HttpStatus.BAD_GATEWAY, expected: true, description: 'Bad Gateway(502)' },
    {
      status: HttpStatus.SERVICE_UNAVAILABLE,
      expected: true,
      description: 'Service Unavailable(503)',
    },
    { status: HttpStatus.BAD_REQUEST, expected: false, description: 'Bad Request(400)' },
    { status: HttpStatus.NOT_FOUND, expected: false, description: 'Not Found(404)' },
  ])('$descriptionの場合は$expectedを返す', ({ status, expected }) => {
    const error = Object.assign(new Error(), { status });

    const result = shouldRetry(error);

    expect(result).toBe(expected);
  });

  test('statusプロパティがないエラーの場合はfalseを返す', () => {
    const error = new Error('Normal error');

    const result = shouldRetry(error);

    expect(result).toBe(false);
  });

  test('エラーでない値の場合はfalseを返す', () => {
    expect(shouldRetry(null)).toBe(false);
    expect(shouldRetry(undefined)).toBe(false);
    expect(shouldRetry('string')).toBe(false);
  });
});

import { describe, test, expect } from 'vitest';
import { RateLimitInfo, parseRateLimitHeaders } from '../rate-limit.js';
import { Headers as HeaderNames } from '../../../constants/index.js';

describe('RateLimitInfo.parseHeaders', () => {
  test('レート制限ヘッダーがある場合はRateLimitInfoを返す', () => {
    const headers = new Headers({
      [HeaderNames.RATE_LIMIT_REMAINING]: '100',
      [HeaderNames.RATE_LIMIT_RESET]: '1704067200', // 2024-01-01T00:00:00Z
    });

    const result = RateLimitInfo.parseHeaders(headers);

    expect(result).toEqual({
      remaining: 100,
      reset: new Date('2024-01-01T00:00:00Z'),
    });
  });

  test('レート制限ヘッダーがない場合はundefinedを返す', () => {
    const headers = new Headers();

    const result = RateLimitInfo.parseHeaders(headers);

    expect(result).toBeUndefined();
  });

  test('一部のヘッダーのみがある場合はundefinedを返す', () => {
    const headers = new Headers({
      [HeaderNames.RATE_LIMIT_REMAINING]: '100',
    });

    const result = RateLimitInfo.parseHeaders(headers);

    expect(result).toBeUndefined();
  });
});

describe('parseRateLimitHeaders (backward compatibility)', () => {
  test('後方互換性：レート制限ヘッダーがある場合はRateLimitInfoを返す', () => {
    const headers = new Headers({
      [HeaderNames.RATE_LIMIT_REMAINING]: '100',
      [HeaderNames.RATE_LIMIT_RESET]: '1704067200', // 2024-01-01T00:00:00Z
    });

    const result = parseRateLimitHeaders(headers);

    expect(result).toEqual({
      remaining: 100,
      reset: new Date('2024-01-01T00:00:00Z'),
    });
  });

  test('後方互換性：新しいAPIと同じ結果を返す', () => {
    const headers = new Headers({
      [HeaderNames.RATE_LIMIT_REMAINING]: '50',
      [HeaderNames.RATE_LIMIT_RESET]: '1704070800', // 2024-01-01T01:00:00Z
    });

    const oldApiResult = parseRateLimitHeaders(headers);
    const newApiResult = RateLimitInfo.parseHeaders(headers);

    expect(oldApiResult).toEqual(newApiResult);
  });
});

import { describe, test, expect } from 'vitest';
import { getRetryAfter } from '../retry.js';
import { Headers as HeaderNames, Limits } from '../../../constants/index.js';

describe('getRetryAfter', () => {
  test('Retry-Afterヘッダーがある場合は数値を返す', () => {
    const headers = new Headers({
      [HeaderNames.RETRY_AFTER]: '60',
    });

    const result = getRetryAfter(headers);

    expect(result).toBe(Limits.DEFAULT_RETRY_AFTER_SECONDS);
  });

  test('Retry-Afterヘッダーがない場合はundefinedを返す', () => {
    const headers = new Headers();

    const result = getRetryAfter(headers);

    expect(result).toBeUndefined();
  });
});

import { describe, test, expect, vi } from 'vitest';
import { withRetry } from '../retry.js';
import { HttpStatus } from '../../../constants/index.js';

describe('withRetry', () => {
  test('成功する関数は1回だけ実行される', async () => {
    const mockFn = vi.fn().mockResolvedValue('success');

    const result = await withRetry(mockFn);

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test('リトライ可能なエラーは指定回数まで再実行される', async () => {
    const error = Object.assign(new Error('Server Error'), {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    });
    const mockFn = vi
      .fn()
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce('success');

    const result = await withRetry(mockFn, 3, 10);

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  test('リトライ不可能なエラーは即座に投げられる', async () => {
    const error = Object.assign(new Error('Not Found'), { status: HttpStatus.NOT_FOUND });
    const mockFn = vi.fn().mockRejectedValue(error);

    await expect(withRetry(mockFn)).rejects.toThrow('Not Found');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test('最大リトライ回数を超えたら最後のエラーを投げる', async () => {
    const error = Object.assign(new Error('Server Error'), {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    });
    const mockFn = vi.fn().mockRejectedValue(error);

    await expect(withRetry(mockFn, 3, 10)).rejects.toThrow('Server Error');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  test('エクスポネンシャルバックオフで遅延が増加する', async () => {
    const error = Object.assign(new Error('Server Error'), {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    });
    const mockFn = vi
      .fn()
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce('success');

    const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

    await withRetry(mockFn, 3, 100);

    // 1回目のリトライ: 100ms
    // 2回目のリトライ: 200ms
    expect(setTimeoutSpy).toHaveBeenNthCalledWith(1, expect.any(Function), 100);
    expect(setTimeoutSpy).toHaveBeenNthCalledWith(2, expect.any(Function), 200);

    setTimeoutSpy.mockRestore();
  });
});

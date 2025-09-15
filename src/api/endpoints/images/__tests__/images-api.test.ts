import { describe, test, expect, vi, beforeEach } from 'vitest';
import { imagesApi, type ImageApiResponse, type ImageApiOptions } from '../index';
import type { HttpClient } from '../../../client';
import type { DeepSnakeCase } from '../../../../utils/case-converter/index.js';
import { TestData } from '../../../../constants/__test__/index.js';

describe('imagesApi', () => {
  let mockHttpClient: HttpClient;

  beforeEach(() => {
    mockHttpClient = {
      get: vi.fn().mockImplementation(() => Promise.resolve()),
      post: vi.fn().mockImplementation(() => Promise.resolve()),
    };
    vi.clearAllMocks();
  });

  test('画像をエクスポートできる', async () => {
    const mockResponse: ImageApiResponse = {
      err: undefined,
      images: {
        '1:1': 'https://example.com/image1.png',
        '2:2': 'https://example.com/image2.png',
      },
    };

    vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

    const options: DeepSnakeCase<ImageApiOptions> = {
      ids: ['1:1', '2:2'],
    };

    const result = await imagesApi(mockHttpClient, TestData.FILE_KEY, options);

    expect(mockHttpClient.get).toHaveBeenCalledWith(
      '/v1/images/test-file-key',
      expect.any(URLSearchParams)
    );

    const calledParams = vi.mocked(mockHttpClient.get).mock.calls[0][1];
    expect(calledParams?.toString()).toContain('ids=1%3A1%2C2%3A2');
    expect(result).toEqual(mockResponse);
  });

  test('単一の画像をエクスポートできる', async () => {
    const mockResponse: ImageApiResponse = {
      err: undefined,
      images: {
        '1:1': 'https://example.com/image.png',
      },
    };

    vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

    const options: DeepSnakeCase<ImageApiOptions> = {
      ids: ['1:1'],
    };

    const result = await imagesApi(mockHttpClient, TestData.FILE_KEY, options);

    expect(result.images).toHaveProperty('1:1');
  });

  test('スケールオプションを指定してエクスポートできる', async () => {
    const mockResponse: ImageApiResponse = {
      err: undefined,
      images: { '1:1': 'https://example.com/image.png' },
    };

    vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

    const options: DeepSnakeCase<ImageApiOptions> = {
      ids: ['1:1'],
      scale: 2,
    };

    await imagesApi(mockHttpClient, TestData.FILE_KEY, options);

    const calledParams = vi.mocked(mockHttpClient.get).mock.calls[0][1];
    expect(calledParams?.toString()).toContain('scale=2');
  });

  test('フォーマットオプションを指定してエクスポートできる', async () => {
    const mockResponse: ImageApiResponse = {
      err: undefined,
      images: { '1:1': 'https://example.com/image.svg' },
    };

    vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

    const options: DeepSnakeCase<ImageApiOptions> = {
      ids: ['1:1'],
      format: 'svg',
    };

    await imagesApi(mockHttpClient, TestData.FILE_KEY, options);

    const calledParams = vi.mocked(mockHttpClient.get).mock.calls[0][1];
    expect(calledParams?.toString()).toContain('format=svg');
  });

  test('SVGオプションを指定してエクスポートできる', async () => {
    const mockResponse: ImageApiResponse = {
      err: undefined,
      images: { '1:1': 'https://example.com/image.svg' },
    };

    vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

    const options: DeepSnakeCase<ImageApiOptions> = {
      ids: ['1:1'],
      format: 'svg',
      svg_include_id: true,
      svg_simplify_stroke: false,
    };

    await imagesApi(mockHttpClient, TestData.FILE_KEY, options);

    const calledParams = vi.mocked(mockHttpClient.get).mock.calls[0][1];
    expect(calledParams?.toString()).toContain('svg_include_id=true');
    expect(calledParams?.toString()).toContain('svg_simplify_stroke=false');
  });

  test('use_absolute_boundsオプションを指定してエクスポートできる', async () => {
    const mockResponse: ImageApiResponse = {
      err: undefined,
      images: { '1:1': 'https://example.com/image.png' },
    };

    vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

    const options: DeepSnakeCase<ImageApiOptions> = {
      ids: ['1:1'],
      use_absolute_bounds: true,
    };

    await imagesApi(mockHttpClient, TestData.FILE_KEY, options);

    const calledParams = vi.mocked(mockHttpClient.get).mock.calls[0][1];
    expect(calledParams?.toString()).toContain('use_absolute_bounds=true');
  });

  test('バージョンオプションを指定してエクスポートできる', async () => {
    const mockResponse: ImageApiResponse = {
      err: undefined,
      images: { '1:1': 'https://example.com/image.png' },
    };

    vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

    const options: DeepSnakeCase<ImageApiOptions> = {
      ids: ['1:1'],
      version: '123456',
    };

    await imagesApi(mockHttpClient, TestData.FILE_KEY, options);

    const calledParams = vi.mocked(mockHttpClient.get).mock.calls[0][1];
    expect(calledParams?.toString()).toContain('version=123456');
  });

  test('すべてのオプションを組み合わせてエクスポートできる', async () => {
    const mockResponse: ImageApiResponse = {
      err: undefined,
      images: { '1:1': 'https://example.com/image.png' },
    };

    vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

    const options: DeepSnakeCase<ImageApiOptions> = {
      ids: ['1:1', '2:2'],
      scale: 3,
      format: 'pdf',
      use_absolute_bounds: false,
      version: '789',
    };

    await imagesApi(mockHttpClient, TestData.FILE_KEY, options);

    const calledParams = vi.mocked(mockHttpClient.get).mock.calls[0][1];
    const paramString = calledParams?.toString() ?? '';

    expect(paramString).toContain('ids=1%3A1%2C2%3A2');
    expect(paramString).toContain('scale=3');
    expect(paramString).toContain('format=pdf');
    expect(paramString).toContain('use_absolute_bounds=false');
    expect(paramString).toContain('version=789');
  });

  test('エラーレスポンスを正しく処理できる', async () => {
    const mockResponse: ImageApiResponse = {
      err: 'Invalid node ID',
      images: {},
    };

    vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

    const options: DeepSnakeCase<ImageApiOptions> = {
      ids: ['invalid'],
    };

    const result = await imagesApi(mockHttpClient, TestData.FILE_KEY, options);

    expect(result.err).toBe('Invalid node ID');
    expect(Object.keys(result.images)).toHaveLength(0);
  });

  test('HTTPクライアントがエラーをスローした場合、エラーが伝播される', async () => {
    const expectedError = new Error('Network error');
    vi.mocked(mockHttpClient.get).mockRejectedValueOnce(expectedError);

    const options: DeepSnakeCase<ImageApiOptions> = {
      ids: ['1:1'],
    };

    await expect(imagesApi(mockHttpClient, TestData.FILE_KEY, options)).rejects.toThrow(
      'Network error'
    );
  });

  test('空のidsが渡された場合でも処理される', async () => {
    const mockResponse: ImageApiResponse = {
      err: undefined,
      images: {},
    };

    vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

    const options: DeepSnakeCase<ImageApiOptions> = {
      ids: [],
    };

    await imagesApi(mockHttpClient, TestData.FILE_KEY, options);

    const calledParams = vi.mocked(mockHttpClient.get).mock.calls[0][1];
    expect(calledParams?.toString()).toBe('ids=');
  });

  test('特殊文字を含むnode IDが適切にエンコードされる', async () => {
    const mockResponse: ImageApiResponse = {
      err: undefined,
      images: {},
    };

    vi.mocked(mockHttpClient.get).mockResolvedValueOnce(mockResponse);

    const options: DeepSnakeCase<ImageApiOptions> = {
      ids: ['I:123', 'S;456', '7:8'],
    };

    await imagesApi(mockHttpClient, TestData.FILE_KEY, options);

    const calledParams = vi.mocked(mockHttpClient.get).mock.calls[0][1];
    expect(calledParams?.toString()).toBe('ids=I%3A123%2CS%3B456%2C7%3A8');
  });
});

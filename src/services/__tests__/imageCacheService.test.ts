describe('imageCacheService', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('faz download no miss e vira hit em chamada seguinte', async () => {
    const makeDirectoryAsync = jest.fn().mockResolvedValue(undefined);
    const getInfoAsync = jest
      .fn()
      .mockResolvedValueOnce({ exists: false })
      .mockResolvedValueOnce({ exists: true, size: 1200 });
    const downloadAsync = jest.fn().mockResolvedValue({
      status: 200,
      uri: 'file:///cache/a.png'
    });
    const deleteAsync = jest.fn().mockResolvedValue(undefined);

    jest.doMock('expo-file-system/legacy', () => ({
      documentDirectory: 'file:///doc/',
      makeDirectoryAsync,
      getInfoAsync,
      downloadAsync,
      deleteAsync
    }));

    const { getCachedImageUri, getImageCacheMetrics } = require('../imageCacheService');
    const remoteUri = 'https://example.com/a.png';

    const first = await getCachedImageUri(remoteUri);
    const second = await getCachedImageUri(remoteUri);
    const metrics = getImageCacheMetrics();

    expect(first).toBe('file:///cache/a.png');
    expect(second).toBe('file:///cache/a.png');
    expect(downloadAsync).toHaveBeenCalledTimes(1);
    expect(metrics.cacheMiss).toBeGreaterThanOrEqual(1);
    expect(metrics.cacheHit).toBeGreaterThanOrEqual(1);
  });
});

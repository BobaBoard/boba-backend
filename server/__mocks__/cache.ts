const { CacheKeys: OriginalCacheKeys } = await vi.importActual("../cache.ts");

const cacheMock = {
  hDel: vi.fn(),
  hGet: vi.fn(),
  hSet: vi.fn(),
};
export const cache = vi.fn().mockImplementation(() => {
  return cacheMock;
});

// Automatically reset all resettable mock methods in the cache.
afterEach(() => {
  Object.values(cacheMock).forEach((mock) => mock.mockClear?.());
});

export const CacheKeys = OriginalCacheKeys;

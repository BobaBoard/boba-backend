const { CacheKeys: OriginalCacheKeys } = jest.requireActual("../cache.ts");

const cacheMock = {
  hDel: jest.fn(),
  hGet: jest.fn(),
  hSet: jest.fn(),
};
export const cache = jest.fn().mockImplementation(() => {
  return cacheMock;
});

// Automatically reset all resettable mock methods in the cache.
afterEach(() => {
  Object.values(cacheMock).forEach((mock) => mock.mockClear?.());
});

export const CacheKeys = OriginalCacheKeys;

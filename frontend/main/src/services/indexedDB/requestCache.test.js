import RequestCache from './requestCache';

const mockDb = {
  cacheDB1: {
    where: vi.fn(() => mockDb.cacheDB1),
    between: vi.fn(() => mockDb.cacheDB1),
    and: vi.fn(() => mockDb.cacheDB1),
    first: vi.fn(),
    get: vi.fn(),
    below: vi.fn(() => mockDb.cacheDB1),
    delete: vi.fn(),
    add: vi.fn(),
    put: vi.fn(),
  },
};

describe('RequestCache', () => {
  let requestCache;

  beforeEach(() => {
    requestCache = new RequestCache('cacheDB1');
    requestCache.db = mockDb;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getCachedResponse', () => {
    it('should retrieve a cached response', async () => {
      const reqPayload = { key: 'value' };
      const cachedResponse = {
        reqPayload: JSON.stringify(reqPayload),
        timestamp: Date.now(),
        tenantId: 1,
        resPayload: 'cachedResponse',
      };

      mockDb.cacheDB1.first.mockResolvedValueOnce(cachedResponse);

      const response = await requestCache.getCachedResponse(reqPayload, 1);

      expect(response).toEqual(cachedResponse);
      expect(mockDb.cacheDB1.where).toHaveBeenCalledWith(['reqPayload', 'timestamp']);
      expect(mockDb.cacheDB1.between).toHaveBeenCalledWith(
        [JSON.stringify(reqPayload), expect.any(Number)],
        [JSON.stringify(reqPayload), expect.any(Number)],
      );
      expect(mockDb.cacheDB1.first).toHaveBeenCalled();
    });

    it('should return null if no cached response is found', async () => {
      const reqPayload = { key: 'value' };

      mockDb.cacheDB1.first.mockResolvedValueOnce(null);

      const response = await requestCache.getCachedResponse(reqPayload, 1);

      expect(response).toBeNull();
      expect(mockDb.cacheDB1.where).toHaveBeenCalledWith(['reqPayload', 'timestamp']);
      expect(mockDb.cacheDB1.between).toHaveBeenCalledWith(
        [JSON.stringify(reqPayload), expect.any(Number)],
        [JSON.stringify(reqPayload), expect.any(Number)],
      );
      expect(mockDb.cacheDB1.first).toHaveBeenCalled();
    });
  });

  describe('setCachedResponse', () => {
    it('should update an existing cache entry', async () => {
      const reqPayload = { key: 'value' };
      const resPayload = 'updatedResponse';
      const cacheEntry = {
        reqPayload: JSON.stringify(reqPayload),
        timestamp: Date.now() - 500, // An outdated entry
        tenantId: 1,
        resPayload: 'cachedResponse',
        trendlineData: 'cachedTrend',
      };

      const trendlineData = { intercept: 23, slope: 3 };

      mockDb.cacheDB1.get.mockResolvedValueOnce(cacheEntry);

      await requestCache.setCachedResponse(reqPayload, resPayload, 1, trendlineData);

      expect(mockDb.cacheDB1.get).toHaveBeenCalledWith({ reqPayload: JSON.stringify(reqPayload) });
      expect(mockDb.cacheDB1.put).toHaveBeenCalledWith({
        ...cacheEntry,
        timestamp: expect.any(Number),
        tenantId: 1,
        resPayload,
        trendlineData,
      });
    });

    it('should update an existing cache entry if tenantId is changed', async () => {
      const reqPayload = { key: 'value' };
      const resPayload = 'updatedResponse';
      const cacheEntry = {
        reqPayload: JSON.stringify(reqPayload),
        timestamp: Date.now(),
        tenantId: 2,
        resPayload: 'cachedResponse',
        trendlineData: 'cachedTrend',
      };

      const trendlineData = { intercept: 23, slope: 3 };

      mockDb.cacheDB1.get.mockResolvedValueOnce(cacheEntry);

      await requestCache.setCachedResponse(reqPayload, resPayload, 3, trendlineData);

      expect(mockDb.cacheDB1.get).toHaveBeenCalledWith({ reqPayload: JSON.stringify(reqPayload) });
      expect(mockDb.cacheDB1.put).toHaveBeenCalledWith({
        ...cacheEntry,
        timestamp: expect.any(Number),
        tenantId: 3,
        resPayload,
        trendlineData,
      });
    });

    it('should add a new cache entry if it does not exist', async () => {
      const reqPayload = { key: 'value' };
      const resPayload = 'newResponse';
      const trendlineData = { intercept: 23, slope: 3 };

      mockDb.cacheDB1.get.mockResolvedValueOnce(null);

      await requestCache.setCachedResponse(reqPayload, resPayload, 2, trendlineData);

      expect(mockDb.cacheDB1.get).toHaveBeenCalledWith({ reqPayload: JSON.stringify(reqPayload) });
      expect(mockDb.cacheDB1.add).toHaveBeenCalledWith({
        reqPayload: JSON.stringify(reqPayload),
        timestamp: expect.any(Number),
        tenantId: 2,
        resPayload,
        trendlineData,
      });
    });
  });

  describe('deleteOutdatedCache', () => {
    it('should delete outdated cache entries', async () => {
      await requestCache.deleteOutdatedCache();

      expect(mockDb.cacheDB1.where).toHaveBeenCalledWith('timestamp');
      expect(mockDb.cacheDB1.below).toHaveBeenCalledWith(expect.any(Number));
      expect(mockDb.cacheDB1.delete).toHaveBeenCalled();
    });
  });
});

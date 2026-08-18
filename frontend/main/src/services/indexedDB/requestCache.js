import { db } from '@/services/indexedDB';

export default class RequestCache {
  constructor(cacheDB, expiresMs = 1000 * 60 * 2) { // 2 minutes
    this.cacheDB = cacheDB;
    this.expiresMs = expiresMs;
    this.db = db;
  }

  getCachedResponse(reqPayload, tenantId) {
    const primaryKey = JSON.stringify(reqPayload);
    return this.db[this.cacheDB].where(['reqPayload', 'timestamp'])
      .between(
        [primaryKey, Date.now() - this.expiresMs],
        [primaryKey, Date.now()],
      ).and((item) => item.tenantId === tenantId)
      .first();
  }

  async setCachedResponse(reqPayload, resPayload, tenantId, trendlineData) {
    const primaryKey = JSON.stringify(reqPayload);
    const cacheEntry = await this.db[this.cacheDB].get({ reqPayload: primaryKey });
    const entry = {
      reqPayload: primaryKey,
      timestamp: Date.now(),
      tenantId,
      resPayload,
      trendlineData,
    };
    if (cacheEntry) {
      return this.db[this.cacheDB].put({ ...cacheEntry, ...entry });
    }
    return this.db[this.cacheDB].add(entry);
  }

  deleteOutdatedCache() {
    return this.db[this.cacheDB]
      .where('timestamp')
      .below(Date.now() - this.expiresMs)
      .delete();
  }
}

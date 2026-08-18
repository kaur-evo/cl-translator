import Dexie from 'dexie';

export const db = new Dexie('localEvoconDB');
// database indexes and versioning
db.version(1).stores({
  reportDataCache: '++id, [reqPayload+timestamp], timestamp, tenantId, reqPayload',
});

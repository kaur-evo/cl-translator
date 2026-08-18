export const entities = {
  USER: 'USER',
  OPERATOR: 'OPERATOR',
  STOP_REASON: 'STOP_REASON',
  STOP_REASON_GROUP: 'STOP_REASON_GROUP',
  SPEED_LOSS: 'SPEED_LOSS',
  SPEED_LOSS_GROUP: 'SPEED_LOSS_GROUP',
  SCRAP_REASON: 'SCRAP_REASON',
  SCRAP_REASON_GROUP: 'SCRAP_REASON_GROUP',
  STATION: 'STATION',
  STATION_GROUP: 'STATION_GROUP',
  POSITION: 'POSITION',
  PRODUCT: 'PRODUCT',
  PRODUCT_GROUP: 'PRODUCT_GROUP',
  SHIFT: 'SHIFT',
  ALERT: 'ALERT',
  CHECKLIST: 'CHECKLIST',
  CHECKLIST_GROUP: 'CHECKLIST_GROUP',
  API_KEY: 'API_KEY',
  DOWNTIME: 'DOWNTIME',
  SIGNAL: 'SIGNAL',
  BATCH: 'BATCH',
  SCRAP: 'SCRAP',
  SECURITY: 'SECURITY',
};

export const settingsUserActions = {
  SAVED: 'SAVED',
  EDITED: 'EDITED',
  DELETED: 'DELETED',
};

export const svUserActions = {
  ADDED: 'ADDED',
  SAVED: 'SAVED',
  EDITED: 'EDITED',
  DELETED: 'DELETED',
  FIRST_FILL: 'FIRST_FILL',
};

export const entityUrlParams = {
  [entities.STOP_REASON]: 'comments',
  [entities.STOP_REASON_GROUP]: 'comments',
  [entities.PRODUCT]: 'products',
  [entities.PRODUCT_GROUP]: 'products',
  [entities.STATION]: 'stations',
  [entities.STATION_GROUP]: 'stations',
  [entities.CHECKLIST_GROUP]: 'checklists',
  [entities.CHECKLIST]: 'checklists',
  [entities.SCRAP_REASON]: 'scrapreasons',
  [entities.SCRAP_REASON_GROUP]: 'scrapreasons',
  [entities.SPEED_LOSS]: 'speedlossreasons',
  [entities.SPEED_LOSS_GROUP]: 'speedlossreasons',
  [entities.USER]: 'users',
  [entities.POSITION]: 'positions',
  [entities.OPERATOR]: 'operators',
  [entities.SHIFT]: 'shifts',
};

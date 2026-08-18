import i18n from '@/services/i18n';

export const enabledTagEntities = {
  COMMENT: 'COMMENT',
  COMMENT_GROUP: 'COMMENT_GROUP',
  PERFORMANCE_COMMENT: 'PERFORMANCE_COMMENT',
  PERFORMANCE_COMMENT_GROUP: 'PERFORMANCE_COMMENT_GROUP',
  SCRAP_REASON: 'SCRAP_REASON',
  SCRAP_REASON_GROUP: 'SCRAP_REASON_GROUP',
};

export function getEnabledTagEntitiesMap() {
  return {
    [enabledTagEntities.COMMENT]: i18n.global.t('Stop reasons'),
    [enabledTagEntities.COMMENT_GROUP]: i18n.global.t('Stop groups'),
    [enabledTagEntities.PERFORMANCE_COMMENT]: i18n.global.t('Speed loss reasons'),
    [enabledTagEntities.PERFORMANCE_COMMENT_GROUP]: i18n.global.t('Speed loss groups'),
    [enabledTagEntities.SCRAP_REASON]: i18n.global.t('Scrap reasons'),
    [enabledTagEntities.SCRAP_REASON_GROUP]: i18n.global.t('Scrap groups'),
  };
}
export function getEnabledTagEntitiesList() {
  return [
    { text: i18n.global.t('Stop reasons'), value: enabledTagEntities.COMMENT },
    { text: i18n.global.t('Stop groups'), value: enabledTagEntities.COMMENT_GROUP },
    { text: i18n.global.t('Speed loss reasons'), value: enabledTagEntities.PERFORMANCE_COMMENT },
    { text: i18n.global.t('Speed loss groups'), value: enabledTagEntities.PERFORMANCE_COMMENT_GROUP },
    { text: i18n.global.t('Scrap reasons'), value: enabledTagEntities.SCRAP_REASON },
    { text: i18n.global.t('Scrap groups'), value: enabledTagEntities.SCRAP_REASON_GROUP },
  ];
}

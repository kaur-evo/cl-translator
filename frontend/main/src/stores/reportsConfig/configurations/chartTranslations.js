import i18n from '@/services/i18n';

export default function getChartTranslations() {
  return {
    Count: i18n.global.t('stopcount'),
    Duration: i18n.global.t('Duration'),
    Downtime: i18n.global.t('Stops'),
    Speedloss: i18n.global.t('Speed loss'),
    Week: i18n.global.t('weekofyear'),
    availability: i18n.global.t('availability'),
    performance: i18n.global.t('performance'),
    quality: i18n.global.t('quality'),
    technicalAvailability: i18n.global.t('technicalavailability'),
    OEE: i18n.global.t('OEE'),
    GoodProduction: i18n.global.t('goodproduction'),
    Scrap: i18n.global.t('Scrap'),
    SpeedLoss: i18n.global.t('Speed loss'),
    UncommentedStops: i18n.global.t('Uncommented'),
    CommentedStops: i18n.global.t('Unplanned stops'),
    PlannedStop: i18n.global.t('Planned stops'),
    Planned: i18n.global.t('Planned'),
    Unplanned: i18n.global.t('Unplanned'),
    AverageTime: i18n.global.t('Average time'),
  };
}

import i18n from '@/services/i18n';
import measure from '@/stores/reportsConfig/constants/measure';
import calcMeasure from '@/stores/reportsConfig/constants/calcMeasure';

export default function getOeeColumns() {
  return {
    AVAILABILITY: {
      textKey: 'availabilityFormatted',
      valueKey: 'availability',
      id: measure.AVAILABILITY,
      text: i18n.global.t('availability'),
      type: 'number',
      defaultDirection: 'desc',
      hasTotal: true,
      width: '120px',
    },
    PERFORMANCE: {
      textKey: 'performanceFormatted',
      valueKey: 'performance',
      id: measure.PERFORMANCE,
      text: i18n.global.t('performance'),
      type: 'number',
      defaultDirection: 'desc',
      hasTotal: true,
      width: '120px',
    },
    QUALITY: {
      textKey: 'qualityFormatted',
      valueKey: 'quality',
      id: measure.QUALITY,
      text: i18n.global.t('quality'),
      type: 'number',
      defaultDirection: 'desc',
      hasTotal: true,
      width: '120px',
    },
    TECHNICAL_AVAILABILITY: {
      textKey: 'technicalAvailabilityFormatted',
      valueKey: 'technicalAvailability',
      id: measure.TECHNICAL_AVAILABILITY,
      text: i18n.global.t('Technical availability'),
      type: 'number',
      defaultDirection: 'desc',
      hasTotal: true,
      width: '120px',
    },
    OEE: {
      textKey: 'oeeFormatted',
      valueKey: 'oee',
      id: measure.OEE,
      text: i18n.global.t('OEE'),
      type: 'number',
      defaultDirection: 'desc',
      hasTotal: true,
      width: '120px',
    },

    OOE: {
      textKey: 'ooeFormatted',
      valueKey: 'ooe',
      id: calcMeasure.OOE,
      text: i18n.global.t('OOE'),
      type: 'number',
      defaultDirection: 'desc',
      hasTotal: true,
      width: '120px',
    },
    TEEP: {
      textKey: 'teepFormatted',
      valueKey: 'teep',
      id: calcMeasure.TEEP,
      text: i18n.global.t('TEEP'),
      type: 'number',
      defaultDirection: 'desc',
      hasTotal: false,
      width: '120px',
    },
  };
}

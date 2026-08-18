import { mdiPoll, mdiChartLineVariant } from '@mdi/js';

import configType from '@/stores/reportsConfig/constants/configType';
import chartType from '@/stores/reportsConfig/constants/chartType';
import i18n from '@/services/i18n';

export default function getChartTypeSelectionMenuItems({ required, type }) {
  if (type === configType.OEE) {
    const ret = new Map([
      [chartType.GROUPED_COLUMN, { label: i18n.global.t('Bar chart'), icon: mdiPoll }],
      [[chartType.LINE, chartType.DOT_PLOT].join(','), { label: i18n.global.t('Line chart'), icon: mdiChartLineVariant }],
    ]);
    if (!required) {
      ret.set('', { label: '-' });
    }
    return ret;
  }
  return new Map([]);
}

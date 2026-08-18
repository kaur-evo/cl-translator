import { mdiPoll, mdiChartLineVariant } from '@mdi/js';

import getChartTypeSelectionMenuItems from './chartTypeSelectionMenuItems';

import configType from '@/stores/reportsConfig/constants/configType';
import chartType from '@/stores/reportsConfig/constants/chartType';
import i18n from '@/services/i18n';

describe('getChartTypeSelectionMenuItems', () => {
  it('returns the correct menu items for OEE config type', () => {
    const menuItems = getChartTypeSelectionMenuItems({ required: true, type: configType.OEE });

    expect(menuItems).toBeInstanceOf(Map);
    expect(menuItems.size).toBe(2);

    expect(menuItems.get(chartType.GROUPED_COLUMN)).toEqual({
      label: i18n.global.t('Bar chart'),
      icon: mdiPoll,
    });

    expect(menuItems.get([chartType.LINE, chartType.DOT_PLOT].join(','))).toEqual({
      label: i18n.global.t('Line chart'),
      icon: mdiChartLineVariant,
    });
  });

  it('returns the correct menu items for OEE config type with required set to false', () => {
    const menuItems = getChartTypeSelectionMenuItems({ required: false, type: configType.OEE });

    expect(menuItems).toBeInstanceOf(Map);
    expect(menuItems.size).toBe(3);

    expect(menuItems.get(chartType.GROUPED_COLUMN)).toEqual({
      label: i18n.global.t('Bar chart'),
      icon: mdiPoll,
    });

    expect(menuItems.get([chartType.LINE, chartType.DOT_PLOT].join(','))).toEqual({
      label: i18n.global.t('Line chart'),
      icon: mdiChartLineVariant,
    });

    expect(menuItems.get('')).toEqual({
      label: '-',
    });
  });

  it('returns an empty map for unknown config type', () => {
    const menuItems = getChartTypeSelectionMenuItems({ required: true, type: 'unknown' });

    expect(menuItems).toBeInstanceOf(Map);
    expect(menuItems.size).toBe(0);
  });
});

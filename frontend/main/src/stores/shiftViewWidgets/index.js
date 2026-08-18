import { defineStore } from 'pinia';

import i18n from '@/services/i18n';
import widgetsApi from '@/api/widgetsApi';
import performanceWidgetType from '@/constants/performanceWidgetType';
import getUnitIdFormatted from '@/helpers/getUnitIdFormatted';
import useGenericNotificationStore from '@/stores/genericNotification';
import useShiftviewTimelineStore from '@/stores/shiftviewTimeline';
import useUserPreferencesStore from '@/stores/userPreferences';

const WIDGET_SETUP_MAP = {
  perform: {
    name: 'performance',
    component: 'performance-widget',
  },
  oee: {
    name: 'OEE',
    component: 'OEE-widget',
  },
  measure: {
    name: 'measure',
    component: 'measure-widget',
  },
  metrics: {
    name: 'shiftview-custom-chart',
    component: 'shiftview-custom-chart-widget',
  },
};

const DEFAULT_WIDGETS = [
  {
    name: 'performance',
    component: 'performance-widget',
    type: 'perform',
    config: {},
  },
  {
    name: 'OEE',
    component: 'OEE-widget',
    type: 'oee',
    config: {},
  },
];

const mapWidget = (widget) => {
  const baseType = Object.keys(WIDGET_SETUP_MAP).find((key) => widget.type.startsWith(key));
  const setup = WIDGET_SETUP_MAP[widget.type] ?? WIDGET_SETUP_MAP[baseType];
  if (!setup) return null;
  return { ...setup, id: widget.id, type: baseType, config: parseConfig(widget.config) };
};

const parseConfig = (config) => {
  if (!config) return {};
  try {
    return JSON.parse(config);
  } catch {
    return {};
  }
};

const useShiftViewWidgetsStore = defineStore('shiftViewWidgets', {
  state: () => ({
    widgetsList: [],
    activeIndexes: {},
  }),
  actions: {
    async fetchAndInitializeWidgets(stationId) {
      try {
        const rawWidgets = await widgetsApi.getWidgets(stationId);
        let widgetsList = rawWidgets.map(mapWidget).filter(Boolean);

        if (!widgetsList.length) {
          widgetsList = [...DEFAULT_WIDGETS];
        }

        this.widgetsList = widgetsList;
      } catch {
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyError(i18n.global.t('We are sorry! There is a problem with your request'));
        this.widgetsList = [...DEFAULT_WIDGETS];
      }
    },
    setIndex({ widgetKey, index }) {
      this.activeIndexes = { ...this.activeIndexes, [widgetKey]: index };
    },
  },
  getters: {
    getActiveIndex: (state) => (widgetKey) => {
      const maxIndex = Math.max(0, state.widgetsList.length - 1);
      return Math.min(state.activeIndexes[widgetKey] ?? 0, maxIndex);
    },
    perfWidgetType() {
      const shiftviewTimelineStore = useShiftviewTimelineStore();
      const { viewSettings } = useUserPreferencesStore();
      const { currentRoute } = shiftviewTimelineStore;
      if (viewSettings.performanceWidgetType === performanceWidgetType.ROUTE_CONFIG) {
        return currentRoute?.runTimeType ?? performanceWidgetType.UNIT_PER_MINUTE;
      }
      return viewSettings.performanceWidgetType;
    },
    performanceChartConfigList() {
      const shiftviewTimelineStore = useShiftviewTimelineStore();
      const { viewSettings } = useUserPreferencesStore();
      const { usePrimaryUnit } = viewSettings;
      const { alternativeUnitId, unitId } = shiftviewTimelineStore.currentBatch;
      const effectiveUnitId = alternativeUnitId && !usePrimaryUnit ? alternativeUnitId : unitId;
      const runtimeTypes = [
        performanceWidgetType.UNIT_PER_HOUR,
        performanceWidgetType.UNIT_PER_MINUTE,
        performanceWidgetType.UNIT_PER_SECOND,
        performanceWidgetType.SECOND_PER_UNIT,
      ];
      return [
        ...runtimeTypes.map((type) => ({ value: type, label: getUnitIdFormatted(type, effectiveUnitId) })),
        { value: performanceWidgetType.SECOND_PER_SIGNAL, label: i18n.global.t('sec/signal') },
      ];
    },
  },
});

export default useShiftViewWidgetsStore;

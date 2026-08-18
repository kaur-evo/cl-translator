import { defineStore } from 'pinia';

import timelineApi from '@/api/timelineApi';
import ordersApi from '@/api/ordersApi';
import transformTimelineResponse from '@/services/transformTimelineResponse';
import stateUpdateHelper from '@/helpers/incremental/incrementalStateHelper';
import SliceUpdateFaking from '@/helpers/incremental/sliceUpdateFaking';
import useProfileStore from '@/stores/profile';
import useStationStore from '@/stores/station';
import useFactoryStore from '@/stores/factory';
import useShiftStore from '@/stores/shift';
import useShiftviewTimelineStore from '@/stores/shiftviewTimeline';
import useShiftviewSelectionStore from '@/stores/shiftviewSelection';
import useConfigurationStore from '@/stores/configuration';
import useShiftViewWidgetsStore from '@/stores/shiftViewWidgets';
import useOperatorStore from '@/stores/operator';
import useFeatureStore from '@/stores/feature';
import useCommentStore from '@/stores/comment';
import useShiftNotificationStore from '@/stores/shiftNotification';
import useChecklistTaskStore from '@/stores/checklistTask';
import useChecklistTemplateStore from '@/stores/checklistTemplate';

const useSliceUpdateFaking = new SliceUpdateFaking();

const cleanShiftChangeParams = ({ stationId = 0, shiftId = 0 }) => {
  let stationParam = Number(stationId);
  let shiftParam = Number(shiftId);

  if (Number.isNaN(stationParam)) {
    stationParam = 0;
  }

  if (Number.isNaN(shiftParam)) {
    shiftParam = 0;
  }

  return { stationId: stationParam, shiftId: shiftParam };
};

const checkPrequisites = async () => {
  const profileStore = useProfileStore();
  const stationStore = useStationStore();
  const factoryStore = useFactoryStore();
  await Promise.all([
    profileStore.initUser(),
    stationStore.fetchStations(),
    factoryStore.fetchFactories(),
  ]);
};

const findStation = (stationId = 0) => {
  const stationStore = useStationStore();
  if (stationId === 0) {
    return stationStore.getDefaultStation();
  }
  return stationStore.getDefaultStation(stationId);
};

const findTimeline = async (stationId, shiftId) => {
  if (shiftId === 0) {
    return timelineApi.getCurrent(stationId);
  }
  try {
    const shiftTimeline = await timelineApi.selectById(shiftId);
    if (shiftTimeline.shift.stationId !== stationId) {
      return timelineApi.getCurrent(stationId);
    }
    return shiftTimeline;
  } catch {
    return timelineApi.getCurrent(stationId);
  }
};

const getMissingOperatorsIds = (array, operators) => {
  const result = [];
  array.forEach((operator) => {
    if (!operators.get(operator.operatorId)) {
      result.push(operator.operatorId);
    }
  });
  return result;
};

const setSliceUpdateFakingParams = (timelineResponse, station, timeline) => {
  const shiftviewTimelineStore = useShiftviewTimelineStore();
  useSliceUpdateFaking.timezone = station.zoneId;
  useSliceUpdateFaking.shift = timelineResponse.shift;
  const firstBatch = timelineResponse.batches[0];
  useSliceUpdateFaking.batch = firstBatch;
  useSliceUpdateFaking.latestState = timeline ?? shiftviewTimelineStore.timeline;
  useSliceUpdateFaking.secondsFromLastShiftSignal = timelineResponse.secondsFromLastShiftSignal;
};

const useShiftViewStore = defineStore('shiftView', {
  state: () => ({
    shiftHours: [],
    lastShift: {},
    orders: [],
    metrics: [],
    shiftLoadingStack: [],
  }),
  actions: {
    startShiftLoading() {
      this.shiftLoadingStack.push(true);
    },
    finishShiftLoading() {
      this.shiftLoadingStack.pop();
    },
    async commitStationChange(station = {}) {
      const stationStore = useStationStore();
      const configurationStore = useConfigurationStore();
      const shiftStore = useShiftStore();
      const shiftViewWidgetsStore = useShiftViewWidgetsStore();

      if (station.id !== stationStore.lineviewStation.id || Object.keys(stationStore.lineviewStation).length === 0) {
        stationStore.setLineviewStation(station);
        configurationStore.fetchConfiguration({ stationId: station.id });
        shiftStore.fetchCurrentShift({ stationId: station.id });

        await shiftViewWidgetsStore.fetchAndInitializeWidgets(station.id);
        if (useFeatureStore().productionOrdersEnabled) {
          const orders = await ordersApi.getOrders(station.id);
          this.orders = orders;
        }
      }
    },
    async commitShiftChange(shiftId, station = {}) {
      const stationStore = useStationStore();
      const shiftStore = useShiftStore();
      const shiftviewTimelineStore = useShiftviewTimelineStore();
      const operatorStore = useOperatorStore();
      const configurationStore = useConfigurationStore();

      if (station.id !== stationStore.lineviewStation.id) await this.commitStationChange(station);
      let transformedTimeline = [];
      const timelineResponse = await findTimeline(station.id, shiftId);

      shiftStore.setShiftState({ timelineResponse });
      if (!timelineResponse.shift) return;

      shiftviewTimelineStore.setBatchQtyBeforeShift(timelineResponse.batchQtyBeforeShift);

      const timezone = stationStore.lineviewStation.zoneId;
      const { commentsRealMap } = useCommentStore();
      const transformedResponse = transformTimelineResponse(
        timelineResponse,
        commentsRealMap,
        shiftStore.isShiftRunning,
        timezone,
        stationStore.lineviewStation.timeModeActive,
      );
      transformedTimeline = transformedResponse.transformedTimeline;
      shiftviewTimelineStore.batchTargetFlags = transformedResponse.batchTargetFlags;

      shiftviewTimelineStore.setTimelineState({
        ...timelineResponse,
        timeline: transformedTimeline,
      });

      if (new Date(timelineResponse.shift.endTimeISO) > new Date()) {
        setSliceUpdateFakingParams(timelineResponse, station, transformedTimeline);
        useSliceUpdateFaking.startUpdateIntervalTracking({
          callback: (sliceUpdates) => {
            this.shiftUpdateCallback(sliceUpdates);
          },
        });
      } else {
        useSliceUpdateFaking.stopUpdateInterval();
      }

      const missingOperatorsIds = getMissingOperatorsIds(timelineResponse.operatorTimeline, operatorStore.operatorsRealMap);

      if (missingOperatorsIds.length) {
        operatorStore.fetchMissingOperators(missingOperatorsIds);
      }
      if (timelineResponse.shift.id === shiftStore.currentShift.id) {
        useShiftNotificationStore().cancelShiftNotificationTimer();
      } else {
        useShiftNotificationStore().resetShiftNotificationTimer();
      }

      if (configurationStore.checklistStations.includes(station.id)) {
        useChecklistTaskStore().fetchChecklistTasks();
        useChecklistTemplateStore().fetchManualChecklistTemplates({ stationId: station.id });
      } else {
        useChecklistTaskStore().checklistTasks = [];
        useChecklistTemplateStore().shiftviewStationManualTemplates = [];
      }
    },
    async changeShift(shiftChangeParams) {
      try {
        this.startShiftLoading();
        const { stationId, shiftId } = cleanShiftChangeParams(shiftChangeParams);
        const stationStore = useStationStore();
        const shiftStore = useShiftStore();
        if (stationStore.lineviewStation.id === stationId && shiftStore.shift.id === shiftId && !shiftChangeParams.force) {
          return;
        }
        await checkPrequisites();
        const station = findStation(stationId);
        await this.commitShiftChange(shiftId, station);
        const shiftviewSelectionStore = useShiftviewSelectionStore();
        shiftviewSelectionStore.clearSliceSelection();
      } finally {
        this.finishShiftLoading();
      }
    },
    updateTimeline(stateUpdate) {
      const shiftStore = useShiftStore();
      const stationStore = useStationStore();
      const shiftviewTimelineStore = useShiftviewTimelineStore();

      if (stateUpdate.shiftVersion !== shiftStore.shift.version + 1) {
        this.commitShiftChange(shiftStore.shift.id, stationStore.lineviewStation);
        return;
      }
      let newTimeline;
      if (stateUpdate.sliceUpdates) {
        const { commentsRealMap } = useCommentStore();
        const stateUpdateResult = stateUpdateHelper(
          shiftviewTimelineStore.timeline,
          stateUpdate.sliceUpdates,
          new Map(stateUpdate.batches.map((batch) => [batch.id, batch])),
          commentsRealMap,
          shiftStore.$state,
          stationStore.lineviewStation.zoneId,
          shiftviewTimelineStore.batchQtyBeforeShift,
        );
        newTimeline = stateUpdateResult.transformedTimeline;
        shiftviewTimelineStore.batchTargetFlags = stateUpdateResult.batchTargetFlags;
        useSliceUpdateFaking.registerTrackingUpdate(shiftviewTimelineStore.timeline);
      }
      shiftviewTimelineStore.setTimelineState({
        ...stateUpdate,
        timeline: newTimeline,
      });
      shiftStore.setStatistics(stateUpdate.statistics);
      shiftStore.setShiftVersion(stateUpdate.shiftVersion);
    },
    updateShift(shift) {
      const shiftStore = useShiftStore();
      shiftStore.setShift(shift);
      useSliceUpdateFaking.changeShift(shift);
    },
    stopUpdateFaking() {
      useSliceUpdateFaking.stopUpdateInterval();
    },
    continueUpdateFaking() {
      useSliceUpdateFaking.startUpdateIntervalTracking({
        callback: (sliceUpdates) => {
          this.shiftUpdateCallback(sliceUpdates);
        },
      });
    },
    async shiftUpdateCallback(sliceUpdates) {
      const shiftviewTimelineStore = useShiftviewTimelineStore();
      await shiftviewTimelineStore.setTimelineFakeState({
        sliceUpdates,
        finishedCB: () => {
          useSliceUpdateFaking.registerTrackingUpdate(shiftviewTimelineStore.timeline);
        },
      });
    },
  },
  getters: {
    isShiftLoading: (state) => !!state.shiftLoadingStack.length,
  },
});

export default useShiftViewStore;

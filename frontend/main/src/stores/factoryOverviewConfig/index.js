import axios from 'axios';
import { DateTime } from 'luxon';
import { defineStore } from 'pinia';

import CustomInterval from '@/helpers/interval/CustomInterval';
import fromEntries from '@/helpers/object/fromEntries';
import factoryOverviewApi from '@/api/factoryOverviewApi';
import stationApi from '@/api/stationApi';
import listToKeyMap from '@/helpers/list/listToKeyMap';
import sliceType from '@/constants/sliceType';
import factoryOverviewStatuses from '@/constants/factoryOverviewStatuses';
import useCommentStore from '@/stores/comment';
import useStationStore from '@/stores/station';

export const getStationStatus = (timeline, commentsMap) => {
  if (!timeline) return [factoryOverviewStatuses.NO_SHIFT];
  const statuses = [];
  const { lastSlice } = timeline;
  if (lastSlice?.typ === sliceType.PRODUCT) {
    if (lastSlice?.dur <= lastSlice.gDur) statuses.push(factoryOverviewStatuses.GOOD_PRODUCTION);
    else statuses.push(factoryOverviewStatuses.SLOW_PRODUCTION);
  } else if (lastSlice?.typ === sliceType.STOPPAGE) {
    if (lastSlice.cId === 0) statuses.push(factoryOverviewStatuses.UNCOMMENTED_STOP);
    else statuses.push(factoryOverviewStatuses.UNPLANNED_STOP);
    if (commentsMap[lastSlice.cId]?.technical) statuses.push(factoryOverviewStatuses.TECHNICAL_STOP);
  } else if (lastSlice?.typ === sliceType.STANDBY) {
    statuses.push(factoryOverviewStatuses.PLANNED_STOP_EXCL_OEE);
  } else if (lastSlice?.typ === sliceType.PLANNED_STOPPAGE) {
    statuses.push(factoryOverviewStatuses.PLANNED_STOP_INCL_OEE);
  } else {
    statuses.push(factoryOverviewStatuses.NO_SHIFT);
  }
  return statuses;
};

const useFactoryOverviewConfigStore = defineStore('factoryOverviewConfig', {
  state: () => ({
    initialized: false,
    timelinesInterval: 8,
    timelinesIntervalEndTime: null,
    timelinesOrdering: {},
    timelinesFactoryOrdering: {},
    timelinesStationGroupOrdering: {},
    timelinesStatColumn: 'oee',
    isFactoryOverviewOrderingModified: false,
    loading: [],
    timelines: {},
    factoryViewOrdering: [],
    rollingTimelines: {},
    rollingTimelinesSocketBuffer: {},
    socketBufferConsumerTimeout: null,
    socketBufferConsumerInterval: null,
    stationSelectionLastModified: null,
    stationCancelTokenObj: {},
    loadingStations: {},
    notificationTimeout: null,
    notificationVisible: false,
    notificationCountDown: 0,
    notificationCountDownInterval: null,
    unitType: 'primary',
    statusFilter: [],
  }),
  actions: {
    startLoading() {
      this.loading.push('loading');
    },
    finishLoading() {
      this.loading.pop();
    },
    setTimelinesInterval(interval) {
      if (interval) this.timelinesInterval = interval;
    },
    setTimelinesIntervalEndTime(endTime) {
      this.timelinesIntervalEndTime = endTime;
    },
    setTimelinesOrdering(ordering) {
      this.timelinesOrdering = ordering;
    },
    setTimelinesFactoryOrdering(ordering) {
      this.timelinesFactoryOrdering = ordering;
    },
    setTimelinesStationGroupOrdering(ordering) {
      this.timelinesStationGroupOrdering = ordering;
    },
    setTimelinesStatColumn(stat) {
      if (stat) this.timelinesStatColumn = stat;
    },
    setUnitType(unitType) {
      if (unitType) this.unitType = unitType;
    },
    setStatusFilter(statusFilter) {
      this.statusFilter = statusFilter || [];
    },
    setFactoryViewOrderingModified(value) {
      this.isFactoryOverviewOrderingModified = value;
    },
    setStationSelectionLastModified(lastModified) {
      this.stationSelectionLastModified = lastModified;
    },
    updateOrderings(orderedStations) {
      orderedStations.forEach((station, index) => {
        this.timelinesOrdering[station.id] = index + 1;
      });
    },
    updateStationGroupOrderings(orderedStationGroups) {
      orderedStationGroups.forEach((stationGroup, index) => {
        this.timelinesStationGroupOrdering[stationGroup.id] = index + 1;
      });
    },
    updateFactoryOrderings(orderedFactories) {
      orderedFactories.forEach((factory, index) => {
        this.timelinesFactoryOrdering[factory.id] = index + 1;
      });
    },
    setFactoryViewOrdering(ordering) {
      const orderingWoDuplicates = ordering.reduce((acc, elem) => {
        if (acc.find((order) => order.stationId === elem.stationId)) return acc;
        acc.push(elem);
        return acc;
      }, []);
      this.factoryViewOrdering = orderingWoDuplicates;
    },
    modifyFactoryViewOrdering(stationIds) {
      this.factoryViewOrdering = stationIds.reduce((newOrdering, id) => {
        const existingOrdering = this.factoryViewOrdering.find((ordering) => ordering.stationId === id);
        if (existingOrdering) {
          newOrdering.push(existingOrdering);
        } else {
          newOrdering.push({ stationId: id, order: newOrdering.length });
        }
        return newOrdering;
      }, []);
    },
    setStationTimeline(timeline) {
      // Merging with existing to avoid potential race condition and overwriting with alerts
      const station = this.timelines[timeline.station];
      const stationUpdated = station ? { ...station, ...timeline.data } : timeline.data;
      this.timelines = { ...this.timelines, [timeline.station]: stationUpdated };
    },
    setStationTimelines(timelines) {
      this.timelines = timelines;
    },
    setStationRollingTimelineBuffer(timeline) {
      const station = this.rollingTimelines[timeline.station];
      const stationUpdated = station
        ? { ...station, ...timeline.data }
        : timeline.data;
      this.rollingTimelinesSocketBuffer = { ...this.rollingTimelinesSocketBuffer, [timeline.station]: stationUpdated };
    },
    mergeRollingBuffer() {
      this.rollingTimelines = { ...this.rollingTimelines, ...this.rollingTimelinesSocketBuffer };
      this.rollingTimelinesSocketBuffer = {};
    },
    setStationRollingTimelines(timelines) {
      this.rollingTimelines = timelines;
    },
    setStationTimelineAlert(alert) {
      // Merging with existing to avoid potential race condition and overwriting with alerts
      const alertStation = this.timelines[alert.station];
      const alertStationUpdated = alertStation ? { ...alertStation, alert: alert.info[0] } : { alert: alert.info[0] };
      this.timelines = { ...this.timelines, [alert.station]: alertStationUpdated };
    },
    setStationReqCancelToken({ stationId, source }) {
      this.stationCancelTokenObj[stationId] = source;
    },
    setInitialized() {
      this.initialized = true;
    },
    startStationLoading(stationId) {
      this.loadingStations[stationId] = true;
    },
    finishStationLoading(stationId) {
      this.loadingStations[stationId] = false;
    },
    applyNotificationTimeout(timeout) {
      this.notificationTimeout = timeout;
    },
    hideNotification() {
      this.notificationVisible = false;
    },
    showNotificationVisible() {
      this.notificationVisible = true;
    },
    setFactoryOverviewConfig(config) {
      if (config.interval) this.timelinesInterval = config.interval;
      if (config.ordering) this.timelinesOrdering = config.ordering;
      if (config.factoryOrdering) this.timelinesFactoryOrdering = config.factoryOrdering;
      if (config.stationGroupOrdering) this.timelinesStationGroupOrdering = config.stationGroupOrdering;
      if (config.statColumn) this.timelinesStatColumn = config.statColumn;
      if (config.unitType) this.unitType = config.unitType;
      if (config.isFactoryOverviewOrderingModified) this.isFactoryOverviewOrderingModified = config.isFactoryOverviewOrderingModified;
      if (config.stationSelectionLastModified) this.stationSelectionLastModified = config.stationSelectionLastModified;
      if (config.statusFilter) this.statusFilter = config.statusFilter;
    },
    async fetchFactoryOverviewConfig() {
      this.startLoading();
      const response = await factoryOverviewApi.getTimelineViewState();
      this.setFactoryOverviewConfig(response);
      this.finishLoading();
    },
    async saveFactoryOverviewConfig() {
      this.startLoading();
      await factoryOverviewApi.putTimelineViewState({
        ordering: this.timelinesOrdering,
        factoryOrdering: this.timelinesFactoryOrdering,
        stationGroupOrdering: this.timelinesStationGroupOrdering,
        interval: this.timelinesInterval,
        statColumn: this.timelinesStatColumn,
        isFactoryOverviewOrderingModified: this.isFactoryOverviewOrderingModified,
        stationSelectionLastModified: this.stationSelectionLastModified,
        unitType: this.unitType,
        statusFilter: this.statusFilter,
      });
      this.finishLoading();
    },
    async modifyTimelineInterval(timelinesInterval) {
      this.startLoading();
      this.setTimelinesInterval(timelinesInterval);
      await this.saveFactoryOverviewConfig();
      this.finishLoading();
    },
    async modifyTimelineStatColumn(statColumn) {
      this.startLoading();
      this.setTimelinesStatColumn(statColumn);
      await this.saveFactoryOverviewConfig();
      this.finishLoading();
    },
    async modifyUnitType(unitType) {
      this.startLoading();
      this.setUnitType(unitType);
      await this.saveFactoryOverviewConfig();
      this.finishLoading();
    },
    async modifyStatusFilter(statusFilter) {
      this.startLoading();
      this.setStatusFilter(statusFilter);
      await this.saveFactoryOverviewConfig();
      this.finishLoading();
    },
    async modifyTimelineOrdering(stationOrdering) {
      this.startLoading();
      this.updateOrderings(stationOrdering);
      await this.saveFactoryOverviewConfig();
      this.finishLoading();
    },
    async modifyTimelineFactoryOrdering(factoryOrdering) {
      this.startLoading();
      this.updateFactoryOrderings(factoryOrdering);
      await this.saveFactoryOverviewConfig();
      this.finishLoading();
    },
    async modifyTimelineStationGroupOrdering(stationGroupOrdering) {
      this.startLoading();
      this.updateStationGroupOrderings(stationGroupOrdering);
      await this.saveFactoryOverviewConfig();
      this.finishLoading();
    },
    async modifyFactoryViewStationOrdering(stationsList) {
      this.startLoading();
      this.modifyFactoryViewOrdering(stationsList);
      await this.saveFactoryViewStationsOrder(this.factoryViewStations);
      this.finishLoading();
    },
    async makeRollingTimelineRequest({ stationId }) {
      const { CancelToken } = axios;
      const source = CancelToken.source();
      const endTime = this.timelinesIntervalEndTime || DateTime.now().toUTC();
      const startTime = endTime.minus({ hours: this.timelinesInterval });
      const promise = stationApi.getRollingStationTimeline(
        { stationIds: [stationId], startTime: startTime.toISO(), endTime: endTime.toISO() },
        { cancelToken: source.token },
      );
      this.setStationReqCancelToken({ stationId, source });
      return promise;
    },
    async cancelStationRequest(stationId) {
      if (this.stationCancelTokenObj[stationId] !== undefined) {
        this.stationCancelTokenObj[stationId].cancel();
      }
    },
    async fetchFactoryViewRollingStationTimeline({ stationId }) {
      this.startStationLoading(stationId);
      const bufferConsumingIntervalSeconds = 1;
      try {
        const rollingTimelines = await this.makeRollingTimelineRequest({ stationId });
        setTimeout(() => {
          this.finishStationLoading(stationId);
        }, bufferConsumingIntervalSeconds * 1000);
        clearTimeout(this.socketBufferConsumerTimeout);
        this.socketBufferConsumerTimeout = null;
        this.socketBufferConsumerTimeout = setTimeout(() => {
          this.mergeRollingBuffer();
        }, bufferConsumingIntervalSeconds * 1000);
        const commentsMap = fromEntries(Object.entries(useCommentStore().commentsMap), { toRaw: true });
        window.WorkerService
          .process(
            'processTimeline',
            {
              timeline: rollingTimelines[stationId],
              stationId,
              commentsMap,
              timezone: useStationStore().lineviewStation.zoneId,
            },
          )
          .then((res) => {
            this.setStationRollingTimelineBuffer(res);
          });
      } catch {
        //
      }
    },
    async fetchFactoryViewStationsOrder() {
      this.startLoading();
      const data = await stationApi.getFactoryViewStationsOrder() || [];
      let ordering = JSON.parse(data.ordering);
      if (!ordering.length && !this.isFactoryOverviewOrderingModified) {
        // If user has not modified stations order or selection
        // and backend returns empty ordering, default to 20 first stations
        const shownStationCount = 20;
        const firstTwentyStations = useStationStore().stations.slice(0, shownStationCount);
        ordering = firstTwentyStations.map((station, index) => ({ stationId: station.id, order: index }));
      }
      this.setFactoryViewOrdering(ordering);
      this.finishLoading();
    },
    async saveFactoryViewStationsOrder(stationsList) {
      this.startLoading();
      this.setStationSelectionLastModified(new Date(Date.now()).toISOString());
      const idOrderList = stationsList.map((station, index) => ({ stationId: station.id, order: index }));
      const data = await stationApi.postFactoryViewStationsOrder(idOrderList);
      const ordering = JSON.parse(data.ordering);
      this.setFactoryViewOrdering(ordering);
      this.setFactoryViewOrderingModified(true);
      await this.saveFactoryOverviewConfig();
      this.finishLoading();
    },
    async fetchFactoryViewStationTimelines({ stationIds }) {
      this.startLoading();
      const timelines = await stationApi.getFactoryViewStationTimeline({ stationIds }) || {};
      // Comments are needed for status calculations, wait for them to be loaded
      await useCommentStore().commentsPromise;
      const timelinesWithStatus = Object.entries(timelines).reduce((acc, [stationId, timeline]) => {
        const { commentsMap } = useCommentStore();
        const statusTypes = getStationStatus(timeline, commentsMap);
        acc[stationId] = {
          ...timeline,
          statusTypes,
        };
        return acc;
      }, {});
      this.setStationTimelines(timelinesWithStatus);
      this.finishLoading();
    },
    async fetchFactoryViewRequirements() {
      const promises = [
        this.fetchFactoryViewStationsOrder(),
        this.fetchFactoryOverviewConfig(),
      ];
      await Promise.all(promises);
      this.setInitialized();
    },
    async subscribeToFactoryViewStations() {
      if (!this.initialized) {
        await this.fetchFactoryViewRequirements();
      }
      await this.fetchFactoryViewStationTimelines({ stationIds: this.factoryViewVisibleStationIds });
      if (window.factoryViewLiveCentrifugeService) {
        window.factoryViewLiveCentrifugeService.subscribeToFactoryViewStations(
          this.factoryViewVisibleStationIds,
          (val) => {
            const commitVal = { ...val };
            commitVal.data.statusTypes = getStationStatus(val.data, useCommentStore().commentsMap);
            this.setStationTimeline(commitVal);
          },
        );
      }
    },
    async subscribeToFactoryViewRollingTimeline(stationId) {
      const bufferConsumingIntervalSeconds = 33;
      if (this.socketBufferConsumerInterval) {
        this.socketBufferConsumerInterval.clear();
        this.socketBufferConsumerInterval = null;
      }
      this.socketBufferConsumerInterval = new CustomInterval(() => {
        this.mergeRollingBuffer();
      }, bufferConsumingIntervalSeconds * 1000).set();
      const commentsMap = fromEntries(Object.entries(useCommentStore().commentsMap), { toRaw: true });
      if (window.factoryViewTimelineCentrifugeService) {
        window.factoryViewTimelineCentrifugeService.subscribeRollingStation(
          stationId,
          this.timelinesInterval,
          (timeline) => {
            window.WorkerService
              .process(
                'processTimeline',
                { timeline: timeline.data, stationId: timeline.station, commentsMap },
              )
              .then((res) => {
                this.setStationRollingTimelineBuffer(res);
                this.finishLoading();
              });
          },
        );
      }
    },
    disconnectFromFactoryViewRollingTimelines() {
      if (this.socketBufferConsumerInterval) {
        this.socketBufferConsumerInterval = this.socketBufferConsumerInterval.clear();
      }
      window.factoryViewTimelineCentrifugeService.disconnectRollingStations();
    },
    unsubscribeFromFactoryViewRollingTimeline(stationId) {
      window.factoryViewTimelineCentrifugeService.unsubscribeRollingStation(stationId);
    },
    updateTimelineIntervalEndTime(endTime) {
      this.setTimelinesIntervalEndTime(endTime);
      if (endTime) {
        this.setNotificationTimeout();
      } else {
        this.clearNotificationTimeout();
      }
    },
    setNotificationTimeout() {
      this.clearNotificationTimeout();
      const delayInMinutes = 30;
      this.applyNotificationTimeout(setTimeout(() => {
        this.showNotification();
      }, delayInMinutes * 60 * 1000));
    },
    showNotification() {
      this.showNotificationVisible();
      this.notificationCountDown = 180;
      this.notificationCountDownInterval = new CustomInterval(() => {
        this.notificationCountDown -= 1;
        if (this.notificationCountDown === 0) {
          this.clearNotificationTimeout();
          this.updateTimelineIntervalEndTime(null);
        }
      }, 1000).set();
    },
    clearNotificationTimeout() {
      if (this.notificationTimeout) {
        clearTimeout(this.notificationTimeout);
        this.applyNotificationTimeout(null);
      }
      if (this.notificationCountDownInterval) {
        this.notificationCountDownInterval.clear();
        this.notificationCountDownInterval = null;
      }
      this.hideNotification();
    },
  },
  getters: {
    isLoading: (state) => !!state.loading.length,
    factoryViewOrderingMap: (state) => listToKeyMap(state.factoryViewOrdering, 'stationId'),
    factoryViewVisibleStationIds() {
      return [...new Set(this.factoryViewStations.map((station) => station.id))];
    },
    factoryViewStations(state) {
      if (state.initialized === false) return [];
      if (!useStationStore().stations.length) return [];
      if (!state.factoryViewOrdering.length && !state.stationSelectionLastModified) {
        return useStationStore().stations;
      }
      if (!state.factoryViewOrdering.length) return [];
      const { stationsMap } = useStationStore();
      const manuallySelectedStations = state.factoryViewOrdering.reduce((acc, fvo) => {
        if (!(fvo.stationId in stationsMap)) return acc;
        acc.push({
          ...stationsMap[fvo.stationId],
          factoryViewOrder: fvo.order,
        });
        return acc;
      }, []);
      let lastCreatedDate;
      if (state.stationSelectionLastModified) {
        lastCreatedDate = state.stationSelectionLastModified;
      } else {
        const sortedSelectedStations = [...manuallySelectedStations].sort((a, b) => (a.createdDate < b.createdDate ? 1 : -1));
        lastCreatedDate = sortedSelectedStations[0].createdDate;
      }
      const stationsCreatedAfterLastSelection = useStationStore().stations.filter(
        (station) => station.createdDate > lastCreatedDate && !this.factoryViewOrderingMap[station.id],
      );
      return [
        ...manuallySelectedStations.sort((a, b) => (a.factoryViewOrder - b.factoryViewOrder)),
        ...stationsCreatedAfterLastSelection,
      ];
    },
    filteredFactoryOverviewStations(state) {
      return this.factoryViewStations.filter((station) => {
        if (state.statusFilter.length === 0) return true;
        const timeline = state.timelines[station.id];
        if (!timeline) return state.statusFilter.includes(factoryOverviewStatuses.NO_SHIFT);
        return timeline.statusTypes?.some((status) => state.statusFilter.includes(status));
      });
    },
  },
});

export default useFactoryOverviewConfigStore;

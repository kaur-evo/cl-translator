import { defineStore } from 'pinia';
import { DateTime } from 'luxon';

import shiftApi from '@/api/shiftApi';
import useStationStore from '@/stores/station';
import useGenericNotificationStore from '@/stores/genericNotification';

const useShiftStore = defineStore('shift', {
  state: () => ({
    currentShift: {},
    loading: [],
    shift: {},
    statisticsRaw: {},
    secondsFromLastShiftSignal: -1,
    shiftSetTimeout: null,
    isShiftRunning: false,
    firstShiftOfShiftviewStation: {},
    shifts: [],
  }),
  actions: {
    async fetchCurrentShift(params = {}) {
      this.loading.push('loading');
      const currentShift = await shiftApi.getCurrentShift(params.stationId);
      this.loading.pop();
      this.currentShift = currentShift;
    },
    setShiftState({ timelineResponse }) {
      if (!timelineResponse.shift) {
        this.shift = { id: 0 };
        return;
      }
      this.shift = timelineResponse.shift;
      this.statisticsRaw = timelineResponse.statistics;
      this.secondsFromLastShiftSignal = timelineResponse.secondsFromLastShiftSignal;
      this.setIsShiftRunning(timelineResponse.shift);
    },
    setIsShiftRunning(shift) {
      const stationStore = useStationStore();
      const timezone = stationStore.lineviewStation.zoneId;

      if (this.shiftSetTimeout) window.clearTimeout(this.shiftSetTimeout);
      const shiftStart = DateTime.fromISO(shift.startTimeISO).setZone(timezone);
      const shiftEnd = DateTime.fromISO(shift.endTimeISO).setZone(timezone);
      const now = DateTime.local().setZone(timezone);
      const isRunning = shiftStart <= now && now <= shiftEnd;
      if (isRunning) {
        const { milliseconds: timeToShiftEnd } = shiftEnd.diff(now).toObject();
        this.shiftSetTimeout = window.setTimeout(() => {
          this.isShiftRunning = false;
        }, timeToShiftEnd);
      }
      this.isShiftRunning = isRunning;
    },
    setShiftVersion(version) {
      this.shift.version = version;
    },
    setStatistics(stats) {
      this.statisticsRaw = stats;
    },
    setShift(shift) {
      this.shift = shift;
      this.setIsShiftRunning(shift);
    },
    setCurrentShift(shift) {
      this.currentShift = shift;
    },
    async setFirstShiftOfStation(station) {
      const shift = await shiftApi.getFirstShift(station.id);
      if (shift) this.firstShiftOfShiftviewStation = shift;
    },
    async fetchShifts(params) {
      this.loading.push('loading');
      const shifts = await shiftApi.getShifts(params);
      if (shifts) this.shifts = shifts;
      this.loading.pop();
    },
    async deleteShift(shift) {
      this.loading.push('loading');
      try {
        await shiftApi.deleteShift(shift.id);
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyDeleted(shift.shiftName);
      } catch (error) {
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyError(error.response.data.message);
      }
      this.loading.pop();
    },
  },
  getters: {
    isLastShiftSelected: (state) => state.isShiftRunning || state.shift.id === state.currentShift.id,
    shiftExists: (state) => !!state.shift.id,
    statistics() {
      if (!this.statisticsRaw || !this.statisticsRaw.hourStatistics) return {};
      const stationStore = useStationStore();
      const hourStatistics = Object.entries(this.statisticsRaw.hourStatistics).reduce((acc, [key, value]) => {
        acc[DateTime.fromISO(key, { zone: stationStore.lineviewStation.zoneId }).toISO()] = value;
        return acc;
      }, {});
      return { ...this.statisticsRaw, hourStatistics };
    },
  },
});

export default useShiftStore;

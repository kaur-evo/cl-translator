import { defineStore } from 'pinia';
import { DateTime } from 'luxon';

import i18n from '@/services/i18n';
import shiftApi from '@/api/shiftApi';
import listToKeyMap from '@/helpers/list/listToKeyMap';
import filterByStationAdminPermissions from '@/helpers/permissions/filterByStationAdminPermissions';
import { joinShiftOverlapMessage } from '@/helpers/shiftTemplate/joinShiftOverlapMessage';
import shiftTimelineDataMapper from '@/stores/shiftTemplate/shiftTimelineDataMapper.js';
import useGenericNotificationStore from '@/stores/genericNotification';
import useStationStore from '@/stores/station';
import useConfirmDialogStore from '@/stores/confirmDialog';

const timeDeviationType = {
  TIME_DEVIATION: 'TIME_DEVIATION',
  NO_SHIFT_DAY: 'NO_SHIFT_DAY',
};

export const UNSAVED_KEY = 'unsaved';

const useShiftTemplateStore = defineStore('shiftTemplate', {
  state: () => ({
    shiftTemplates: [],
    loading: [],
    noShiftDeviations: {},
    timeDeviations: {},
    shiftTimelines: {},
    shiftTimelinesLoading: {},
  }),
  actions: {
    async fetchShiftTemplates() {
      this.loading.push('loading');
      try {
        const shiftTemplates = await shiftApi.getShiftTemplates();
        this.shiftTemplates = shiftTemplates;
      } catch (error) {
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyError(error.response.data.message);
      } finally {
        this.loading.pop();
      }
    },
    async saveShiftTemplate({ data, callback }) {
      this.loading.push('loading');
      try {
        let shiftTemplate;
        if (data.id) {
          shiftTemplate = await shiftApi.putShiftTemplate(data);
        } else {
          shiftTemplate = await shiftApi.postShiftTemplate(data);
          this.unsavedNoShiftDeviations.forEach((deviation) => {
            this.saveShiftTemplateNoShiftDeviation({ ...deviation, shiftTemplateId: shiftTemplate.id, hideNotifications: true });
            this._deleteNoShiftDeviation(deviation.shiftTemplateId, deviation);
          });
        }
        const notificationText = shiftTemplate.enabled
          ? i18n.global.t('Shift template {value} saved - status on', { value: shiftTemplate.name })
          : i18n.global.t('Shift template {value} saved - status off', { value: shiftTemplate.name });
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifySuccess(notificationText);
        this._editShiftTemplate(shiftTemplate);
        if (callback) callback(shiftTemplate);
        return shiftTemplate;
      } catch (error) {
        if (error.response?.data?.overlaps) {
          const stationStore = useStationStore();
          const overlaps = joinShiftOverlapMessage(stationStore.stationsMap, error.response.data.overlaps);
          const text = `${i18n.global.t('Shift template can be saved only as inactive due to overlapping times')}:\n\n${overlaps}.`;
          const longTextThreshold = 300;
          const longTextWidth = 700;
          const confirmDialogStore = useConfirmDialogStore();
          confirmDialogStore.openConfirmDialog({
            title: i18n.global.t('Save as inactive?'),
            text,
            action: () => {
              this.saveShiftTemplate({ data: { ...data, enabled: false }, callback });
            },
            color: 'primary',
            confirmText: i18n.global.t('Save'),
            cancelText: i18n.global.t('Cancel'),
            width: text.length > longTextThreshold ? longTextWidth : null,
          });
        } else {
          const genericNotificationStore = useGenericNotificationStore();
          genericNotificationStore.notifyError(error.response?.data?.message);
        }
        return error;
      } finally {
        this.loading.pop();
      }
    },
    async deleteShiftTemplate(shiftTemplate) {
      this.loading.push('loading');
      try {
        await shiftApi.deleteShiftTemplate(shiftTemplate.id);
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyDeleted(shiftTemplate.name);
        const index = this.shiftTemplates.findIndex((el) => el.id === shiftTemplate.id);
        if (index > -1) this.shiftTemplates.splice(index, 1);
      } catch (error) {
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyError(error.response.data.message);
      }
      this.loading.pop();
    },
    async toggleShiftActivity(data) {
      try {
        const shiftTemplate = await shiftApi.putShiftTemplate(data);
        this._editShiftTemplate(shiftTemplate);
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifySuccess(
          shiftTemplate.enabled
            ? i18n.global.t('Shift template {value} saved - status on', { value: shiftTemplate.name })
            : i18n.global.t('Shift template {value} saved - status off', { value: shiftTemplate.name }),
        );
        return shiftTemplate;
      } catch (error) {
        if (error.response.data.overlaps) {
          const stationStore = useStationStore();
          const genericNotificationStore = useGenericNotificationStore();
          genericNotificationStore.openNotification({
            type: 'warning',
            secondaryText: joinShiftOverlapMessage(stationStore.stationsMap, error.response.data.overlaps),
            text: `${i18n.global.t('Shift template cannot be activated due to overlapping times')}:`,
            timeout: -1,
          });
        } else {
          const genericNotificationStore = useGenericNotificationStore();
          genericNotificationStore.notifyError(error.response.data.message);
        }
        return error;
      }
    },
    async fetchShiftTemplateNoShiftDeviations(templateId) {
      try {
        const shiftTemplateNoShiftDeviations = await shiftApi.getShiftTemplateDeviationsByType(templateId, timeDeviationType.NO_SHIFT_DAY);
        this.noShiftDeviations = { ...this.noShiftDeviations, [templateId]: shiftTemplateNoShiftDeviations };
        return shiftTemplateNoShiftDeviations;
      } catch (error) {
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyError(error.response.data.message);
      }
      return null;
    },
    async saveShiftTemplateNoShiftDeviation(_data) {
      const data = { ..._data };
      const { hideNotifications } = data;
      if ('hideNotifications' in data) delete data.hideNotifications;
      try {
        if (!data.description) throw new Error('Name is required');
        let result;
        if (data.id && !data[UNSAVED_KEY]) {
          result = await shiftApi.putShiftTemplateDeviation({ ...data, type: timeDeviationType.NO_SHIFT_DAY });
          if (!hideNotifications) {
            const genericNotificationStore = useGenericNotificationStore();
            genericNotificationStore.notifyUpdated(data.description);
          }
        } else {
          if (data[UNSAVED_KEY]) {
            delete data.id;
            delete data[UNSAVED_KEY];
          }
          result = await shiftApi.postShiftTemplateDeviation({ ...data, type: timeDeviationType.NO_SHIFT_DAY });
          if (!hideNotifications) {
            const genericNotificationStore = useGenericNotificationStore();
            genericNotificationStore.notifyAdded(data.description);
          }
        }
        this._setNoShiftDeviation(result.shiftTemplateId, result);
        this.fetchShiftTemplateNoShiftDeviations(_data.shiftTemplateId);
        return result;
      } catch (error) {
        return this.handleDeviationError(error);
      }
    },
    async storeShiftTemplateNoShiftDeviation(deviation) {
      if (!deviation.description) throw new Error('Name is required');
      this._setNoShiftDeviation(
        deviation.shiftTemplateId ?? UNSAVED_KEY,
        {
          ...deviation,
          id: deviation.id ?? new Date().getTime(),
          [UNSAVED_KEY]: true,
          type: timeDeviationType.NO_SHIFT_DAY,
          shiftTemplateId: deviation.shiftTemplateId ?? UNSAVED_KEY,
        },
      );
    },
    async fetchShiftTemplateTimeDeviations(templateId) {
      try {
        const shiftTemplateTimeDeviations = await shiftApi.getShiftTemplateDeviationsByType(templateId, timeDeviationType.TIME_DEVIATION);
        this.timeDeviations = { ...this.timeDeviations, [templateId]: shiftTemplateTimeDeviations };
        return shiftTemplateTimeDeviations;
      } catch (error) {
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyError(error.response.data.message);
      }
      return null;
    },
    async deleteShiftTemplateNoShiftDeviation(deviation) {
      try {
        if (!deviation[UNSAVED_KEY]) {
          await shiftApi.deleteShiftTemplateDeviation(deviation);
        }
        this._deleteNoShiftDeviation(deviation.shiftTemplateId, deviation);
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyDeleted(deviation.description);
      } catch (error) {
        return this.handleDeviationError(error);
      }
    },
    async saveShiftTemplateTimeDeviation(data) {
      try {
        const result = await shiftApi.postShiftTemplateDeviation({ ...data, type: timeDeviationType.TIME_DEVIATION });
        const currentTimeDeviations = [...(this.timeDeviations[data.shiftTemplateId] || [])];
        const index = currentTimeDeviations.findIndex((d) => d.id === result.id);
        if (index > -1) {
          currentTimeDeviations[index] = result;
        } else {
          currentTimeDeviations.push(result);
        }
        this.timeDeviations = { ...this.timeDeviations, [data.shiftTemplateId]: currentTimeDeviations };
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifySuccess(i18n.global.t('Time exception added'));
        return result;
      } catch (error) {
        return this.handleDeviationError(error);
      }
    },
    async deleteShiftTemplateTimeDeviation(deviation) {
      try {
        await shiftApi.deleteShiftTemplateDeviation(deviation);
        const currentDeviations = [...(this.timeDeviations[deviation.shiftTemplateId] || [])];
        const index = currentDeviations.findIndex((d) => d.id === deviation.id);
        if (index > -1) {
          currentDeviations.splice(index, 1);
          this.timeDeviations = { ...this.timeDeviations, [deviation.shiftTemplateId]: currentDeviations };
        }
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyDeleted(i18n.global.t('Time exception'));
      } catch (error) {
        return this.handleDeviationError(error);
      }
    },
    async fetchShiftTemplateTimeline({ dateRange, stationId }) {
      this.shiftTimelinesLoading = { ...this.shiftTimelinesLoading, [stationId]: true };
      try {
        const stationStore = useStationStore();
        const station = stationStore.stationsMap[stationId];
        if (!station) throw new Error('Station not found');
        const zoneId = station.timeZone || 'UTC';
        const startDate = DateTime.fromJSDate(dateRange[0]).setZone('UTC').toISODate();
        const endDate = DateTime.fromJSDate(dateRange[1]).setZone('UTC').toISODate();
        const data = await shiftApi.getShiftTimeline(stationId, { startDate, endDate });
        const modifiedTimeline = shiftTimelineDataMapper(data, zoneId);
        this.shiftTimelines = { ...this.shiftTimelines, [stationId]: modifiedTimeline };
      } catch (error) {
        this.handleDeviationError(error);
      }
      this.shiftTimelinesLoading = { ...this.shiftTimelinesLoading, [stationId]: false };
    },
    handleDeviationError(error) {
      const genericNotificationStore = useGenericNotificationStore();
      if (error?.response?.data?.message === 'SHIFT_TIMELINE_MODIFICATION_BLOCKED') {
        genericNotificationStore.openNotification({
          type: 'error',
          text: i18n.global.t('Shift time locked'),
          secondaryText: i18n.global.t('Shift time can no longer be changed here. Once the shift begins, you can adjust them directly in the Shift View'),
        });
      } else {
        genericNotificationStore.notifyError(error?.response?.data?.message);
      }
      return error;
    },
    // Internal mutation-like helpers
    _editShiftTemplate(item) {
      const index = this.shiftTemplates.findIndex((shift) => shift.id === item.id);
      if (index > -1) {
        this.shiftTemplates[index] = item;
      } else {
        this.shiftTemplates.push(item);
      }
    },
    _setNoShiftDeviation(id, deviation) {
      const currentNoShiftDeviations = [...(this.noShiftDeviations[deviation.shiftTemplateId] || [])];
      const index = currentNoShiftDeviations.findIndex((d) => d.id === deviation.id);
      if (index > -1) {
        currentNoShiftDeviations[index] = deviation;
      } else {
        currentNoShiftDeviations.push(deviation);
      }
      this.noShiftDeviations = { ...this.noShiftDeviations, [id]: currentNoShiftDeviations };
    },
    _deleteNoShiftDeviation(id, deviation) {
      const currentNoShiftDeviations = [...(this.noShiftDeviations[deviation.shiftTemplateId] || [])];
      const index = currentNoShiftDeviations.findIndex((d) => d.id === deviation.id);
      if (index > -1) {
        currentNoShiftDeviations.splice(index, 1);
        this.noShiftDeviations = { ...this.noShiftDeviations, [id]: currentNoShiftDeviations };
      }
    },
  },
  getters: {
    shiftTemplatesWithAdminPermissions() {
      const stationStore = useStationStore();
      const { adminStationsMap } = stationStore;
      return filterByStationAdminPermissions(this.shiftTemplates, adminStationsMap);
    },
    isLoading: (state) => !!state.loading.length,
    shiftTemplatesMap: (state) => listToKeyMap(state.shiftTemplates, 'id'),
    currentNoShiftDeviations: (state) => (templateId) => state.noShiftDeviations[templateId] || [],
    unsavedNoShiftDeviations: (state) => (state.noShiftDeviations[UNSAVED_KEY] || []).filter((d) => d[UNSAVED_KEY]),
    currentTimeDeviations: (state) => (templateId) => state.timeDeviations[templateId] || [],
    stationShiftTimeline: (state) => (stationId) => state.shiftTimelines[stationId] || [],
    stationShiftTimelineLoading: (state) => (stationId) => !!state.shiftTimelinesLoading[stationId],
  },
});

export default useShiftTemplateStore;

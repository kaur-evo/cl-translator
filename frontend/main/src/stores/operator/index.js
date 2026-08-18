import { defineStore } from 'pinia';

import operatorApi from '@/api/operatorApi';
import mergeFilteredRequestState from '@/helpers/list/mergeFilteredRequestState';
import i18n from '@/services/i18n';
import listToKeyMap from '@/helpers/list/listToKeyMap';
import useGenericNotificationStore from '@/stores/genericNotification';
import useStationStore from '@/stores/station';

const useOperatorStore = defineStore('operator', {
  state: () => ({
    operatorsList: [],
    loading: [],
  }),
  actions: {
    startLoading() {
      this.loading.push('loading');
    },
    finishLoading() {
      this.loading.pop();
    },
    setOperators(operators) {
      this.operatorsList = operators;
    },
    editOperator(item) {
      const index = this.operatorsList.findIndex((operator) => operator.id === item.id);
      if (index > -1) {
        this.operatorsList[index] = item;
      } else {
        this.operatorsList.push(item);
      }
    },
    removeOperator(id) {
      const index = this.operatorsList.findIndex((el) => el.id === id);
      this.operatorsList.splice(index, 1);
    },
    setPasscode(passcodeObj) {
      const index = this.operatorsList.findIndex((el) => el.id === passcodeObj.operatorId);
      if (index > -1) this.operatorsList[index].passcodeCreatedAt = passcodeObj.passcodeCreatedAt;
    },
    deletePasscodeFromOperator(id) {
      const index = this.operatorsList.findIndex((el) => el.id === id);
      if (index > -1) this.operatorsList[index].passcodeCreatedAt = null;
    },
    async fetchOperators(params) {
      this.startLoading();
      const operators = await operatorApi.getOperators(params) || [];
      this.finishLoading();
      const stationStore = useStationStore();
      const stations = stationStore.stationsMap;
      const operatorsWithFactories = operators.map((operator) => {
        const factoryIds = [];
        operator.stationIds.forEach((station) => {
          if (stations[station]) {
            factoryIds.push(stations[station].factoryId);
          }
        });
        return { ...operator, factoryIds };
      });

      this.setOperators([...new Set(mergeFilteredRequestState(this.operatorsRealMap, operatorsWithFactories))]);
    },
    fetchMissingOperators(idsList) {
      this.fetchOperators({ includeDeleted: true, id: idsList });
    },
    async saveOperator(data) {
      this.startLoading();
      try {
        let operator;
        if (data.id) {
          operator = await operatorApi.putOperator(data);
          useGenericNotificationStore().notifyUpdated(`${operator.firstname} ${operator.lastname}`);
        } else {
          operator = await operatorApi.postOperator(data);
          useGenericNotificationStore().notifyAdded(`${operator.firstname} ${operator.lastname}`);
        }
        const stationStore = useStationStore();
        const stations = stationStore.stationsMap;
        const factoryIds = [];
        operator.stationIds.forEach((id) => {
          if (stations[id]) factoryIds.push(stations[id].factoryId);
        });
        this.editOperator({ ...operator, factoryIds });
        return operator;
      } catch (error) {
        useGenericNotificationStore().notifyError(error.response.data.message);
        return error;
      } finally {
        this.finishLoading();
      }
    },
    async deleteOperator(operator) {
      this.startLoading();
      try {
        await operatorApi.deleteOperator(operator.id);
        useGenericNotificationStore().notifyDeleted(`${operator.firstname} ${operator.lastname}`);
        this.removeOperator(operator.id);
      } catch (error) {
        useGenericNotificationStore().notifyError(error.response.data.message);
      }
      this.finishLoading();
    },
    async generatePasscode({ operatorId, isRegenerate, callback }) {
      this.startLoading();
      try {
        let response;
        if (isRegenerate) response = await operatorApi.regeneratePasscode(operatorId);
        else response = await operatorApi.generatePasscode(operatorId);
        this.setPasscode(response);
        useGenericNotificationStore().notifySuccess(i18n.global.t('Passcode generated'));
        if (callback) callback(response.passcode);
        return response;
      } catch (error) {
        useGenericNotificationStore().notifyError(i18n.global.t('Try again and contact support if the problem persists'));
        return error;
      } finally {
        this.finishLoading();
      }
    },
    async deletePasscode(operatorId) {
      this.startLoading();
      try {
        await operatorApi.deletePasscode(operatorId);
        useGenericNotificationStore().notifySuccess(i18n.global.t('Passcode deleted'));
        this.deletePasscodeFromOperator(operatorId);
      } catch (error) {
        useGenericNotificationStore().notifyError(error.response.data.message);
      }
      this.finishLoading();
    },
  },
  getters: {
    operators: (state) => state.operatorsList.sort((a, b) => a.name.localeCompare(b.name)),
    operatorsIncludeNotSpecified() {
      return [
        {
          id: 0, name: i18n.global.t('Unknown'), stationIds: [], factoryIds: [],
        },
        ...this.operators,
      ];
    },
    isLoading: (state) => !!state.loading.length,
    operatorsMap() {
      return listToKeyMap(this.operatorsIncludeNotSpecified, 'id');
    },
    operatorsRealMap() {
      return new Map(this.operatorsIncludeNotSpecified.map((oper) => [oper.id, oper]));
    },
    shiftviewStationOperators() {
      const stationStore = useStationStore();
      return this.operators.filter(
        (operator) => operator.stationIds.includes(stationStore.lineviewStation.id),
      );
    },
  },
});

export default useOperatorStore;

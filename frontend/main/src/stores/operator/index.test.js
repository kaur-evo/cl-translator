import { setActivePinia, createPinia } from 'pinia';

import useOperatorStore from './index';

import useGenericNotificationStore from '@/stores/genericNotification';
import useStationStore from '@/stores/station';
import operatorApi from '@/api/operatorApi';

vi.mock('@/api/operatorApi', () => ({
  default: {
    getOperators: vi.fn(),
    putOperator: vi.fn(),
    postOperator: vi.fn(),
    deleteOperator: vi.fn(),
    generatePasscode: vi.fn(),
    regeneratePasscode: vi.fn(),
    deletePasscode: vi.fn(),
  },
  __esModule: true,
}));

vi.mock('@/stores/genericNotification', () => ({
  default: vi.fn(),
  __esModule: true,
}));

vi.mock('@/stores/station', () => ({
  default: vi.fn(),
  __esModule: true,
}));

vi.mock('@/services/i18n', () => ({
  default: { global: { t: (key) => key } },
  __esModule: true,
}));

const mockNotificationStore = {
  notifyAdded: vi.fn(),
  notifyUpdated: vi.fn(),
  notifyDeleted: vi.fn(),
  notifyError: vi.fn(),
  notifySuccess: vi.fn(),
};

const mockStationStore = {
  stationsMap: { 1: { factoryId: 1 }, 2: { factoryId: 2 } },
  lineviewStation: { id: 2 },
};

describe('useOperatorStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useOperatorStore();
    useGenericNotificationStore.mockReturnValue(mockNotificationStore);
    useStationStore.mockReturnValue(mockStationStore);
    vi.clearAllMocks();
  });

  describe('actions', () => {
    test('setOperators', () => {
      const operators = [{ id: 1, name: 'Operator1' }, { id: 2, name: 'Operator2' }];
      store.setOperators(operators);
      expect(store.operatorsList).toEqual(operators);
    });

    test('editOperator edits existing operator', () => {
      store.operatorsList = [{ id: 1, name: 'Operator1' }];
      store.editOperator({ id: 1, name: 'Operator1-edited' });
      expect(store.operatorsList).toEqual([{ id: 1, name: 'Operator1-edited' }]);
    });

    test('editOperator adds new operator', () => {
      store.operatorsList = [];
      store.editOperator({ id: 1, name: 'Operator1' });
      expect(store.operatorsList).toEqual([{ id: 1, name: 'Operator1' }]);
    });

    test('removeOperator', () => {
      store.operatorsList = [{ id: 1, name: 'Operator1' }, { id: 2, name: 'Operator2' }];
      store.removeOperator(1);
      expect(store.operatorsList).toEqual([{ id: 2, name: 'Operator2' }]);
    });

    test('setPasscode', () => {
      store.operatorsList = [{ id: 1, passcodeCreatedAt: null }];
      store.setPasscode({ passcode: '1234', passcodeCreatedAt: '2020-01-01T12:34:56Z', operatorId: 1 });
      expect(store.operatorsList[0].passcodeCreatedAt).toEqual('2020-01-01T12:34:56Z');
    });

    test('deletePasscodeFromOperator', () => {
      store.operatorsList = [{ id: 1, passcodeCreatedAt: '2020-01-01T12:34:56Z' }];
      store.deletePasscodeFromOperator(1);
      expect(store.operatorsList[0].passcodeCreatedAt).toBeNull();
    });

    test('deletePasscodeFromOperator with id not in operators', () => {
      store.operatorsList = [{ id: 1, passcodeCreatedAt: '2020-01-01T12:34:56Z' }];
      store.deletePasscodeFromOperator(3);
      expect(store.operatorsList[0].passcodeCreatedAt).toEqual('2020-01-01T12:34:56Z');
    });

    test('fetchOperators', async () => {
      const operators = [{ id: 1, name: 'Operator 1', stationIds: [] }, { id: 2, name: 'Operator 2', stationIds: [] }];
      operatorApi.getOperators.mockResolvedValueOnce(operators);
      await store.fetchOperators({ someParam: 'someValue' });
      expect(operatorApi.getOperators).toHaveBeenCalledWith({ someParam: 'someValue' });
      expect(store.loading).toEqual([]);
    });

    test('fetchOperators maps stationIds to factoryIds', async () => {
      const operators = [{ id: 1, name: 'Operator 1', stationIds: [1, 2] }];
      operatorApi.getOperators.mockResolvedValueOnce(operators);
      await store.fetchOperators({});
      const operator = store.operatorsList.find((o) => o.id === 1);
      expect(operator.factoryIds).toEqual([1, 2]);
    });

    test('saveOperator creates new operator', async () => {
      const notifyAddedSpy = vi.spyOn(mockNotificationStore, 'notifyAdded');
      const data = { firstname: 'John', lastname: 'Doe', stationIds: [1, 2] };
      const createdOperator = { id: 1, ...data };
      operatorApi.postOperator.mockResolvedValueOnce(createdOperator);
      const result = await store.saveOperator(data);
      expect(operatorApi.postOperator).toHaveBeenCalledWith(data);
      expect(notifyAddedSpy).toHaveBeenCalledWith('John Doe');
      expect(result).toEqual(createdOperator);
    });

    test('saveOperator updates existing operator', async () => {
      const notifyUpdatedSpy = vi.spyOn(mockNotificationStore, 'notifyUpdated');
      const data = { id: 1, firstname: 'John', lastname: 'Doe', stationIds: [1, 2] };
      operatorApi.putOperator.mockResolvedValueOnce(data);
      const result = await store.saveOperator(data);
      expect(operatorApi.putOperator).toHaveBeenCalledWith(data);
      expect(notifyUpdatedSpy).toHaveBeenCalledWith('John Doe');
      expect(result).toEqual(data);
    });

    test('saveOperator with error', async () => {
      const notifyErrorSpy = vi.spyOn(mockNotificationStore, 'notifyError');
      const error = { response: { data: { message: 'Something went wrong!' } } };
      operatorApi.postOperator.mockRejectedValueOnce(error);
      const result = await store.saveOperator({ firstname: 'John', lastname: 'Doe', stationIds: [1, 2] });
      expect(notifyErrorSpy).toHaveBeenCalledWith('Something went wrong!');
      expect(result).toEqual(error);
    });

    test('generatePasscode with isRegenerate true', async () => {
      const notifySuccessSpy = vi.spyOn(mockNotificationStore, 'notifySuccess');
      const callback = vi.fn();
      const response = { passcode: '1234', passcodeCreatedAt: '2020-01-01T12:34:56Z' };
      operatorApi.regeneratePasscode.mockResolvedValueOnce(response);
      await store.generatePasscode({ operatorId: 1, isRegenerate: true, callback });
      expect(operatorApi.regeneratePasscode).toHaveBeenCalledWith(1);
      expect(notifySuccessSpy).toHaveBeenCalledWith('Passcode generated');
      expect(callback).toHaveBeenCalledWith('1234');
    });

    test('generatePasscode with isRegenerate false', async () => {
      const response = { passcode: '1234', passcodeCreatedAt: '2020-01-01T12:34:56Z' };
      operatorApi.generatePasscode.mockResolvedValueOnce(response);
      await store.generatePasscode({ operatorId: 1, isRegenerate: false, callback: vi.fn() });
      expect(operatorApi.generatePasscode).toHaveBeenCalledWith(1);
    });

    test('generatePasscode with error', async () => {
      const notifyErrorSpy = vi.spyOn(mockNotificationStore, 'notifyError');
      operatorApi.generatePasscode.mockRejectedValueOnce({ response: { data: { message: 'fail' } } });
      await store.generatePasscode({ operatorId: 1, isRegenerate: false });
      expect(notifyErrorSpy).toHaveBeenCalledWith('Try again and contact support if the problem persists');
    });

    test('deletePasscode', async () => {
      const notifySuccessSpy = vi.spyOn(mockNotificationStore, 'notifySuccess');
      store.operatorsList = [{ id: 1, passcodeCreatedAt: '2020-01-01T12:34:56Z' }];
      operatorApi.deletePasscode.mockResolvedValueOnce({});
      await store.deletePasscode(1);
      expect(operatorApi.deletePasscode).toHaveBeenCalledWith(1);
      expect(notifySuccessSpy).toHaveBeenCalledWith('Passcode deleted');
      expect(store.operatorsList[0].passcodeCreatedAt).toBeNull();
    });

    test('deletePasscode with error', async () => {
      const notifyErrorSpy = vi.spyOn(mockNotificationStore, 'notifyError');
      const error = { response: { data: { message: 'Deleting passcode failed' } } };
      operatorApi.deletePasscode.mockRejectedValueOnce(error);
      await store.deletePasscode(1);
      expect(notifyErrorSpy).toHaveBeenCalledWith('Deleting passcode failed');
    });
  });

  describe('getters', () => {
    test('operators returns alphabetical order', () => {
      store.operatorsList = [
        { id: 1, name: 'Test Operator' },
        { id: 2, name: 'Aadu Operator' },
        { id: 3, name: '1st Operator' },
      ];
      expect(store.operators.map((o) => o.name)).toEqual(['1st Operator', 'Aadu Operator', 'Test Operator']);
    });

    test('operatorsIncludeNotSpecified includes Unknown', () => {
      store.operatorsList = [{ id: 1, name: 'Test Operator 1' }];
      expect(store.operatorsIncludeNotSpecified[0]).toEqual({ id: 0, name: 'Unknown', stationIds: [], factoryIds: [] });
    });

    test('isLoading', () => {
      expect(store.isLoading).toBe(false);
      store.loading.push('loading');
      expect(store.isLoading).toBe(true);
    });

    test('shiftviewStationOperators', () => {
      store.operatorsList = [
        { id: 1, name: 'Op1', stationIds: [1, 2] },
        { id: 2, name: 'Op2', stationIds: [1] },
      ];
      expect(store.shiftviewStationOperators.map((o) => o.id)).toEqual([1]);
    });
  });
});

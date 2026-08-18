import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { cloneDeep } from 'lodash';
import { DateTime, Settings } from 'luxon';
import { subSeconds } from 'date-fns';

import { DAYS } from '@/constants/shiftViewTimeRestrictionTypes';
import KeyListener from '@/services/keyListener';
import timelineApi from '@/api/timelineApi';
import clientMetricsApi from '@/api/clientMetricsApi';
import shiftApi from '@/api/shiftApi';
import commentApi from '@/api/commentApi';
import productApi from '@/api/productApi';
import scrapApi from '@/api/scrapReasonApi';
import editTeamDialogConfig from '@/constants/shiftviewDialogConfigs/editTeamDialogConfig';
import ShiftView from '@/components/pages/shiftview/ShiftViewMain/index.vue';
import CustomInterval from '@/helpers/interval/CustomInterval';
import messageApi from '@/api/messageApi';
import dialogConfigs from '@/constants/dialogConfigs';
import { useShiftStore, useShiftviewTimelineStore, useShiftViewStore, useCommentStore, useProfileStore, useStationStore, useOperatorStore, useDeviceStore, useConfigurationStore } from '@/stores/index';

vi.mock('@/services/keyListener');
vi.mock('@/api/timelineApi');
vi.mock('@/api/clientMetricsApi');
vi.mock('@/api/shiftApi');
vi.mock('@/api/commentApi');
vi.mock('@/api/productApi');
vi.mock('@/api/scrapReasonApi');
vi.mock('@/api/messageApi');

KeyListener.registerKeyListener = vi.fn();
KeyListener.removeEventListener = vi.fn();
const addProductionSignal = vi.fn().mockReturnValue({ success: true, message: '2025-12-17T14:22:45Z' });
timelineApi.addProductionSignal = addProductionSignal;
clientMetricsApi.postClientMetrics = vi.fn();
shiftApi.getShift = vi.fn();
const saveComment = vi.fn().mockReturnValue({ success: true });
commentApi.saveComment = saveComment;
const changeProduct = vi.fn();
productApi.changeProduct = changeProduct;
const saveScrap = vi.fn().mockReturnValue([{ body: { success: true } }]);
scrapApi.saveScrap = saveScrap;
messageApi.getUnread = vi.fn().mockReturnValue(0);
messageApi.getMessages = vi.fn().mockReturnValue([{ subject: 'message subject' }]);

window.centrifugeService = {
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
};

const $route = { params: { stationId: 1 } };

const defaultPiniaState = {
  shift: {
    shift: { id: 3, shiftDate: '2021-01-01' },
    currentShift: {},
  },
  genericDialog: {
    isOpen: false,
  },
};

const defaultGetterOverrides = {
  shift: { isShiftRunning: true, shiftExists: true, statistics: { shiftTotal: { oee: 0.46 } } },
  shiftviewTimeline: { teamTimeline: [], timeline: [], currentBatch: { productId: 7 } },
  shiftView: { isShiftLoading: false },
  comment: { commentsRealMap: new Map([[2, { id: 2, name: 'test comment 2' }], [1, { id: 1, name: 'test comment 1' }]]) },
  profile: {
    highestRoleAllows: () => true,
    isReadOnly: false,
    shiftviewStationUserRole: 'LINEVIEW_USER',
    currentUser: { tenantId: 1, lineviewTimeRestrictionValue: 0, lineviewTimeRestrictionType: DAYS },
  },
  station: { lineviewStation: { requireOperator: true, id: 12, zoneId: 'Europe/Tallinn' } },
  operator: { operatorsRealMap: new Map([[1, { id: 1 }]]) },
  device: { isBrowserTabActive: true },
  configuration: { checklistStations: [] },
};

const createPinia = (stateOverrides = {}, getterOverrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    initialState: {
      ...cloneDeep(defaultPiniaState),
      ...stateOverrides,
    },
  });
  const merged = cloneDeep(defaultGetterOverrides);
  Object.entries(getterOverrides).forEach(([storeName, overrides]) => {
    merged[storeName] = { ...merged[storeName], ...overrides };
  });
  Object.assign(useShiftStore(pinia), merged.shift);
  Object.assign(useShiftviewTimelineStore(pinia), merged.shiftviewTimeline);
  Object.assign(useShiftViewStore(pinia), merged.shiftView);
  Object.assign(useCommentStore(pinia), merged.comment);
  Object.assign(useProfileStore(pinia), merged.profile);
  Object.assign(useStationStore(pinia), merged.station);
  Object.assign(useOperatorStore(pinia), merged.operator);
  Object.assign(useDeviceStore(pinia), merged.device);
  Object.assign(useConfigurationStore(pinia), merged.configuration);
  return pinia;
};

let originalNow;
const now = DateTime.utc(2023, 1, 28, 9, 30, 0, 0).toMillis();

describe('ShiftViewMain', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = shallowMount(ShiftView, {
      global: {
        plugins: [createPinia()],
        mocks: { $route },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(ShiftView, {
      global: {
        plugins: [createPinia()],
        mocks: { $route },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('subscribes to checklists channel if station is in checklistStations on mount', () => {
    shallowMount(ShiftView, {
      global: {
        plugins: [createPinia({}, { configuration: { checklistStations: [12, 15, 20] } })],
        mocks: { $route: { params: { stationId: 12 } } },
      },
    });
    expect(window.centrifugeService.subscribe).toHaveBeenCalledWith('checklists', 12, expect.any(Function));
  });

  it('doesnt subscribe to checklists channel if station is not in checklistStations on mount', () => {
    shallowMount(ShiftView, {
      global: {
        plugins: [createPinia({}, { configuration: { checklistStations: [15, 20] } })],
        mocks: { $route: { params: { stationId: 12 } } },
      },
    });
    expect(window.centrifugeService.subscribe).not.toHaveBeenCalledWith('checklists', 12, expect.any(Function));
  });

  describe('shouldRequireOperator', () => {
    it('is true if station requires operator, teamTimeline is empty, station has operators, user isnt readOnly and is lineview user', () => {
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia()],
          mocks: { $route },
        },
      });

      expect(wrapper.vm.shouldRequireOperator).toBe(true);
    });

    it('is false if station does not require operator', () => {
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia({}, { station: { lineviewStation: { requireOperator: false } } })],
          mocks: { $route },
        },
      });

      expect(wrapper.vm.shouldRequireOperator).toBe(false);
    });

    it('is false if teamTimeline is not empty', () => {
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia({}, { shiftviewTimeline: { teamTimeline: [{ id: 1 }] } })],
          mocks: { $route },
        },
      });

      expect(wrapper.vm.shouldRequireOperator).toBe(false);
    });

    it('is false if station has no operators', () => {
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia({}, { operator: { operatorsRealMap: new Map() } })],
          mocks: { $route },
        },
      });

      expect(wrapper.vm.shouldRequireOperator).toBe(false);
    });

    it('is false if user is readOnly', () => {
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia({}, { profile: { isReadOnly: true } })],
          mocks: { $route },
        },
      });

      expect(wrapper.vm.shouldRequireOperator).toBe(false);
    });

    it('is false if user is not lineview user', () => {
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia({}, { profile: { shiftviewStationUserRole: 'COMPANY_ADMIN' } })],
          mocks: { $route },
        },
      });

      expect(wrapper.vm.shouldRequireOperator).toBe(false);
    });
  });

  describe('isBrowserTabActive watcher', () => {
    it('calls continueUpdateFaking when isBrowserTabActive changes from false to true and isShiftRunning is true', () => {
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia({}, { device: { isBrowserTabActive: false } })],
          mocks: { $route },
        },
      });

      const spy = vi.spyOn(wrapper.vm, 'continueUpdateFaking').mockImplementation(() => {});
      wrapper.vm.$options.watch.isBrowserTabActive.call(wrapper.vm, true);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('doesnt call continueUpdateFaking when isBrowserTabActive changes from false to true and isShiftRunning is false', () => {
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia({}, { device: { isBrowserTabActive: false }, shift: { isShiftRunning: false } })],
          mocks: { $route },
        },
      });

      const spy = vi.spyOn(wrapper.vm, 'continueUpdateFaking');
      wrapper.vm.$options.watch.isBrowserTabActive.call(wrapper.vm, true);
      expect(spy).toHaveBeenCalledTimes(0);
    });

    it('calls stopUpdateFaking when isBrowserTabActive changes from true to false', () => {
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia()],
          mocks: { $route },
        },
      });

      const spy = vi.spyOn(wrapper.vm, 'stopUpdateFaking');
      wrapper.vm.$options.watch.isBrowserTabActive.call(wrapper.vm, false);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('applyBarCodeSignalQty', () => {
    beforeEach(() => {
      originalNow = Settings.now;
      Settings.now = () => now;
    });

    afterEach(() => {
      Settings.now = originalNow;
      vi.clearAllMocks();
    });

    it('calls addProductionSignal with lineviewStation id and correct quantity', async () => {
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia()],
          mocks: { $route },
        },
      });

      await wrapper.vm.applyBarCodeSignalQty('2');
      expect(addProductionSignal).toHaveBeenCalledTimes(1);
      expect(addProductionSignal).toHaveBeenCalledWith(12, [{
        signalQty: parseFloat(2, Number),
      }]);
    });

    it('doesnt call applyBarCodeChangeover if no productId is given', async () => {
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia()],
          mocks: { $route },
        },
      });

      const applyBarCodeChangeover = vi.spyOn(wrapper.vm, 'applyBarCodeChangeover');
      await wrapper.vm.applyBarCodeSignalQty('2');
      expect(applyBarCodeChangeover).toHaveBeenCalledTimes(0);
    });

    it('doesnt call applyBarCodeChangeover if productId is given, but is the same as currentBatch.productId', async () => {
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia({}, { shiftviewTimeline: { currentBatch: { productId: 7 } } })],
          mocks: { $route },
        },
      });

      const applyBarCodeChangeover = vi.spyOn(wrapper.vm, 'applyBarCodeChangeover');
      await wrapper.vm.applyBarCodeSignalQty('2', '7');
      expect(applyBarCodeChangeover).toHaveBeenCalledTimes(0);
    });

    it('calls applyBarCodeChangeover if productId is given and it is different from currentBatch.productId', async () => {
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia({}, { shiftviewTimeline: { currentBatch: { productId: 7 } } })],
          mocks: { $route },
        },
      });

      const applyBarCodeChangeover = vi.spyOn(wrapper.vm, 'applyBarCodeChangeover');
      await wrapper.vm.applyBarCodeSignalQty('2', '9');
      expect(applyBarCodeChangeover).toHaveBeenCalledTimes(1);
      expect(applyBarCodeChangeover).toHaveBeenCalledWith('9', '2025-12-17T14:22:45Z');
    });
  });

  describe('applyBarCodeChangeover', () => {
    beforeEach(() => {
      originalNow = Settings.now;
      Settings.now = () => now;
    });

    afterEach(() => {
      Settings.now = originalNow;
      vi.clearAllMocks();
    });

    test('if time is provided', () => {
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia()],
          mocks: { $route },
        },
      });


      wrapper.vm.applyBarCodeChangeover('2', '2025-12-17T14:22:45Z');

      expect(changeProduct).toHaveBeenCalledTimes(1);
      expect(changeProduct).toHaveBeenCalledWith(12, { productId: '2', eventTimeISO: new DateTime('2025-12-17T14:22:45Z').minus({ seconds: 1 }).toISO() });
    });

    test('if time is not provided', () => {
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia()],
          mocks: { $route },
        },
      });

      wrapper.vm.applyBarCodeChangeover('2');

      expect(changeProduct).toHaveBeenCalledTimes(1);
      expect(changeProduct).toHaveBeenCalledWith(12, { productId: '2', eventTimeISO: DateTime.local().setZone('Europe/Tallinn').minus({ seconds: 1 }).toISO() });
    });
  });

  describe('applyBarCodeScrap', () => {
    afterEach(() => {
      vi.clearAllMocks();
    });
    it('calls notifyError and not saveScrap if added scrapQty is larger than goodQty of currentBatch', () => {
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia({}, { shiftviewTimeline: { currentBatch: { producedQty: 10, scrapQty: 8 } } })],
          mocks: { $route },
        },
      });

      const notifyError = vi.spyOn(wrapper.vm, 'notifyError');

      wrapper.vm.applyBarCodeScrap({ scrapQty: 8, scrapReasonId: 12, scrapNotes: 'notes' });

      expect(saveScrap).toHaveBeenCalledTimes(0);
      expect(notifyError).toHaveBeenCalledTimes(1);
    });

    test('adding when batch start is in previous shift', () => {
      const batch = {
        startTimeISO: '2022-01-11T12:00:00.000+02:00', endTimeISO: null, producedQty: 100, scrapQty: 8,
      };
      const shift = {
        id: 122, startTimeISO: '2022-01-11T15:00:00.000+02:00', endTimeISO: '2022-01-11T20:00:00.000+02:00', shiftDate: '2022-01-11',
      };
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia({ shift: { shift, currentShift: {} } }, { shiftviewTimeline: { currentBatch: batch } })],
          mocks: { $route },
        },
      });

      const data = { scrapQty: 8, scrapReasonId: 12, scrapNotes: 'notes' };

      wrapper.vm.applyBarCodeScrap({ scrapQty: 8, scrapReasonId: 12, scrapNotes: 'notes' });

      expect(saveScrap).toHaveBeenCalledTimes(1);
      expect(saveScrap).toHaveBeenCalledWith(12, {
        ...data,
        qtyType: 'delta',
        overwrite: false,
        shiftId: shift.id,
        scrapRanges: [{ startTimeISO: shift.startTimeISO, endTimeISO: shift.endTimeISO }],
      });
    });

    test('adding when batch start is in visible shift', () => {
      const batch = {
        startTimeISO: '2022-01-11T16:00:00.000+02:00', endTimeISO: null, producedQty: 100, scrapQty: 8,
      };
      const shift = {
        id: 122, startTimeISO: '2022-01-11T15:00:00.000+02:00', endTimeISO: '2022-01-11T20:00:00.000+02:00', shiftDate: '2022-01-11',
      };
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia({ shift: { shift, currentShift: {} } }, { shiftviewTimeline: { currentBatch: batch } })],
          mocks: { $route },
        },
      });

      const data = { scrapQty: 8, scrapReasonId: 12, scrapNotes: 'notes' };

      wrapper.vm.applyBarCodeScrap({ scrapQty: 8, scrapReasonId: 12, scrapNotes: 'notes' });

      expect(saveScrap).toHaveBeenCalledTimes(1);
      expect(saveScrap).toHaveBeenCalledWith(12, {
        ...data,
        qtyType: 'delta',
        overwrite: false,
        shiftId: shift.id,
        scrapRanges: [{ startTimeISO: batch.startTimeISO, endTimeISO: shift.endTimeISO }],
      });
    });
  });

  describe('applyBarcodeScrapReason', () => {
    it('doesnt call saveScrap if there are no signals with scrap', async () => {
      const shift = {
        id: 122, startTimeISO: '2022-01-11T15:00:00.000+02:00', endTimeISO: '2022-01-11T20:00:00.000+02:00', shiftDate: '2022-01-11',
      };
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia({ shift: { shift, currentShift: {} } }, { shiftviewTimeline: { timeline: [] } })],
          mocks: { $route },
        },
      });

      const data = { scrapReasonId: 12, scrapNotes: 'notes' };

      await wrapper.vm.applyBarcodeScrapReason(data);

      expect(saveScrap).toHaveBeenCalledTimes(0);
    });

    it('calls saveScrap with correct arguments', async () => {
      const shift = {
        id: 122, startTimeISO: '2022-01-11T15:00:00.000+02:00', endTimeISO: '2022-01-11T20:00:00.000+02:00', shiftDate: '2022-01-11',
      };
      const timeline = [
        { id: 1, scrapQty: 2, sliceStartTmISO: '2022-01-11T15:30:00.000+02:00', sliceEndTmISO: '2022-01-11T15:31:00.000+02:00', scrapReasonId: 0 },
        { id: 2, scrapQty: 4, sliceStartTmISO: '2022-01-11T15:31:00.000+02:00', sliceEndTmISO: '2022-01-11T15:32:00.000+02:00', scrapReasonId: 1 },
      ];
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia({ shift: { shift, currentShift: {} } }, { shiftviewTimeline: { timeline } })],
          mocks: { $route },
        },
      });

      const data = { scrapReasonId: 12, scrapNotes: 'notes' };

      await wrapper.vm.applyBarcodeScrapReason(data);

      expect(saveScrap).toHaveBeenCalledTimes(1);
      expect(saveScrap).toHaveBeenCalledWith(12, {
        qtyType: 'delta',
        overwrite: true,
        shiftId: shift.id,
        scrapRanges: [{
          startTimeISO: '2022-01-11T15:30:00.000+02:00',
          endTimeISO: '2022-01-11T15:31:00.000+02:00',
        }],
        scrapReasonId: data.scrapReasonId,
        scrapNotes: data.scrapNotes,
        scrapQty: 0,
      });
    });
  });

  describe('applyBarCodeComment', () => {
    afterEach(() => {
      vi.clearAllMocks();
    });
    test('when no team has selected and requireOperator is true', async () => {
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia()],
          mocks: { $route },
        },
      });

      const notifyInformation = vi.spyOn(wrapper.vm, 'notifyInformation');
      const openDialog = vi.spyOn(wrapper.vm, 'openDialog');

      await wrapper.vm.applyBarCodeComment(1);

      expect(notifyInformation).toHaveBeenCalledTimes(1);
      expect(notifyInformation).toHaveBeenCalledWith('Please select team first');
      expect(openDialog).toHaveBeenCalledTimes(1);
      expect(openDialog).toHaveBeenCalledWith(editTeamDialogConfig);
      expect(saveComment).toHaveBeenCalledTimes(0);
    });
    test('with no stoppages on timeline', async () => {
      const timeline = [
        { type: 'PRODUCT', sliceStartTime: '2020-02-12T12:00:00', sliceEndTime: '2020-02-12T12:01:00' },
        { type: 'PRODUCT', sliceStartTime: '2020-02-12T12:01:00', sliceEndTime: '2020-02-12T12:02:00' },
        { type: 'PRODUCT', sliceStartTime: '2020-02-12T12:02:00', sliceEndTime: '2020-02-12T12:03:00' },
      ];
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia({}, { profile: { shiftviewStationUserRole: 'COMPANY_ADMIN' }, shiftviewTimeline: { timeline } })],
          mocks: { $route },
        },
      });

      const notifyInformation = vi.spyOn(wrapper.vm, 'notifyInformation');
      const openDialog = vi.spyOn(wrapper.vm, 'openDialog');

      await wrapper.vm.applyBarCodeComment(1);

      expect(notifyInformation).toHaveBeenCalledTimes(0);
      expect(openDialog).toHaveBeenCalledTimes(0);
      expect(saveComment).toHaveBeenCalledTimes(0);
    });

    test('with multiple uncommented stoppages', async () => {
      const timeline = [
        { type: 'PRODUCT', sliceStartTmISO: '2020-02-12T12:00:00', sliceEndTmISO: '2020-02-12T12:01:00' },
        { type: 'STOPPAGE', sliceStartTmISO: '2020-02-12T12:01:00', sliceEndTmISO: '2020-02-12T12:06:00', commentId: 0 },
        { type: 'PRODUCT', sliceStartTmISO: '2020-02-12T12:06:00', sliceEndTmISO: '2020-02-12T12:07:00' },
        { type: 'PRODUCT', sliceStartTmISO: '2020-02-12T12:07:00', sliceEndTmISO: '2020-02-12T12:08:00' },
        { type: 'STOPPAGE', sliceStartTmISO: '2020-02-12T12:08:00', sliceEndTmISO: '2020-02-12T12:13:00', commentId: 0 },
        { type: 'PRODUCT', sliceStartTmISO: '2020-02-12T12:13:00', sliceEndTmISO: '2020-02-12T12:14:00' },
      ];
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia({}, { profile: { shiftviewStationUserRole: 'COMPANY_ADMIN' }, shiftviewTimeline: { timeline } })],
          mocks: { $route },
        },
      });

      const notifyInformation = vi.spyOn(wrapper.vm, 'notifyInformation');
      const openDialog = vi.spyOn(wrapper.vm, 'openDialog');

      await wrapper.vm.applyBarCodeComment(1);

      expect(notifyInformation).toHaveBeenCalledTimes(0);
      expect(openDialog).toHaveBeenCalledTimes(0);
      expect(saveComment).toHaveBeenCalledTimes(1);
      expect(saveComment).toHaveBeenCalledWith(12, 3, [{ startTimeISO: '2020-02-12T12:08:00', commentId: 1 }]);
    });

    test('with uncommented and commented stoppage', async () => {
      const timeline = [
        { type: 'PRODUCT', sliceStartTmISO: '2020-02-12T12:00:00', sliceEndTmISO: '2020-02-12T12:01:00' },
        { type: 'STOPPAGE', sliceStartTmISO: '2020-02-12T12:01:00', sliceEndTmISO: '2020-02-12T12:06:00', commentId: 0 },
        { type: 'PRODUCT', sliceStartTmISO: '2020-02-12T12:06:00', sliceEndTmISO: '2020-02-12T12:07:00' },
        { type: 'PRODUCT', sliceStartTmISO: '2020-02-12T12:07:00', sliceEndTmISO: '2020-02-12T12:08:00' },
        { type: 'STOPPAGE', sliceStartTmISO: '2020-02-12T12:08:00', sliceEndTmISO: '2020-02-12T12:13:00', commentId: 2 },
        { type: 'PRODUCT', sliceStartTmISO: '2020-02-12T12:13:00', sliceEndTmISO: '2020-02-12T12:14:00' },
      ];
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia({}, { profile: { shiftviewStationUserRole: 'COMPANY_ADMIN' }, shiftviewTimeline: { timeline } })],
          mocks: { $route },
        },
      });

      const notifyInformation = vi.spyOn(wrapper.vm, 'notifyInformation');
      const openDialog = vi.spyOn(wrapper.vm, 'openDialog');

      await wrapper.vm.applyBarCodeComment(1);

      expect(notifyInformation).toHaveBeenCalledTimes(0);
      expect(openDialog).toHaveBeenCalledTimes(0);
      expect(saveComment).toHaveBeenCalledTimes(1);
      expect(saveComment).toHaveBeenCalledWith(12, 3, [{ startTimeISO: '2020-02-12T12:01:00', commentId: 1 }]);
    });

    test('with all commented stoppages', async () => {
      const timeline = [
        { type: 'PRODUCT', sliceStartTmISO: '2020-02-12T12:00:00', sliceEndTmISO: '2020-02-12T12:01:00' },
        { type: 'STOPPAGE', sliceStartTmISO: '2020-02-12T12:01:00', sliceEndTmISO: '2020-02-12T12:06:00', commentId: 2 },
        { type: 'PRODUCT', sliceStartTmISO: '2020-02-12T12:06:00', sliceEndTmISO: '2020-02-12T12:07:00' },
        { type: 'PRODUCT', sliceStartTmISO: '2020-02-12T12:07:00', sliceEndTmISO: '2020-02-12T12:08:00' },
        { type: 'STOPPAGE', sliceStartTmISO: '2020-02-12T12:08:00', sliceEndTmISO: '2020-02-12T12:13:00', commentId: 2 },
        { type: 'PRODUCT', sliceStartTmISO: '2020-02-12T12:13:00', sliceEndTmISO: '2020-02-12T12:14:00' },
      ];
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia({}, { profile: { shiftviewStationUserRole: 'COMPANY_ADMIN' }, shiftviewTimeline: { timeline } })],
          mocks: { $route },
        },
      });

      const notifyInformation = vi.spyOn(wrapper.vm, 'notifyInformation');
      const openDialog = vi.spyOn(wrapper.vm, 'openDialog');

      await wrapper.vm.applyBarCodeComment(1);

      expect(notifyInformation).toHaveBeenCalledTimes(0);
      expect(openDialog).toHaveBeenCalledTimes(0);
      expect(saveComment).toHaveBeenCalledTimes(1);
      expect(saveComment).toHaveBeenCalledWith(12, 3, [{ startTimeISO: '2020-02-12T12:08:00', commentId: 1 }]);
    });

    test('with comment that has noteRequired and no note provided', async () => {
      const timeline = [
        { type: 'PRODUCT', sliceStartTmISO: '2020-02-12T12:00:00', sliceEndTmISO: '2020-02-12T12:01:00', duration: 60 },
        { type: 'STOPPAGE', sliceStartTmISO: '2020-02-12T12:01:00', sliceEndTmISO: '2020-02-12T12:06:00', commentId: 2, duration: 300 },
      ];
      const testComment = { id: 1, name: 'test comment 1', noteRequired: true, noteRequiredDuration: 0 };
      const commentsRealMap = new Map([[2, { id: 2, name: 'test comment 2' }], [1, testComment]]);
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia({}, {
            profile: { shiftviewStationUserRole: 'COMPANY_ADMIN' },
            shiftviewTimeline: { timeline },
            comment: { commentsRealMap },
          })],
          mocks: { $route },
        },
      });
      const selectSlice = vi.spyOn(wrapper.vm, 'selectSlice');
      const openDialog = vi.spyOn(wrapper.vm, 'openDialog');

      await wrapper.vm.applyBarCodeComment(1);
      expect(selectSlice).toHaveBeenCalledTimes(1);
      expect(selectSlice).toHaveBeenCalledWith({ type: 'STOPPAGE', sliceStartTmISO: '2020-02-12T12:01:00', sliceEndTmISO: '2020-02-12T12:06:00', commentId: 2, duration: 300 });
      expect(openDialog).toHaveBeenCalledTimes(1);
      expect(openDialog).toHaveBeenCalledWith({
        ...dialogConfigs.COMMENT_DOWNTIME,
        data: { commentId: 1 },
      });
    });

    test('with comment that has noteRequired and no note provided, but noteRequiredDuration is not exceeded', async () => {
      const timeline = [
        { type: 'PRODUCT', sliceStartTmISO: '2020-02-12T12:00:00', sliceEndTmISO: '2020-02-12T12:01:00', duration: 60 },
        { type: 'STOPPAGE', sliceStartTmISO: '2020-02-12T12:01:00', sliceEndTmISO: '2020-02-12T12:06:00', commentId: 0, duration: 300 },
      ];
      const testComment = { id: 1, name: 'test comment 1', noteRequired: true, noteRequiredDuration: 600 };
      const commentsRealMap = new Map([[2, { id: 2, name: 'test comment 2' }], [1, testComment]]);
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia({}, {
            profile: { shiftviewStationUserRole: 'COMPANY_ADMIN' },
            shiftviewTimeline: { timeline },
            comment: { commentsRealMap },
          })],
          mocks: { $route },
        },
      });
      const notifyInformation = vi.spyOn(wrapper.vm, 'notifyInformation');
      const openDialog = vi.spyOn(wrapper.vm, 'openDialog');

      await wrapper.vm.applyBarCodeComment(1);

      expect(notifyInformation).toHaveBeenCalledTimes(0);
      expect(openDialog).toHaveBeenCalledTimes(0);
      expect(saveComment).toHaveBeenCalledTimes(1);
      expect(saveComment).toHaveBeenCalledWith(12, 3, [{ startTimeISO: '2020-02-12T12:01:00', commentId: 1 }]);
    });

    test('with comment that has requirePosition and no position provided', async () => {
      const timeline = [
        { type: 'PRODUCT', sliceStartTmISO: '2020-02-12T12:00:00', sliceEndTmISO: '2020-02-12T12:01:00' },
        { type: 'STOPPAGE', sliceStartTmISO: '2020-02-12T12:01:00', sliceEndTmISO: '2020-02-12T12:06:00', commentId: 2 },
      ];
      const testComment = { id: 1, name: 'test comment 1', requirePosition: true };
      const commentsRealMap = new Map([[2, { id: 2, name: 'test comment 2' }], [1, testComment]]);
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia({}, {
            profile: { shiftviewStationUserRole: 'COMPANY_ADMIN' },
            shiftviewTimeline: { timeline },
            comment: { commentsRealMap },
          })],
          mocks: { $route },
        },
      });
      const selectSlice = vi.spyOn(wrapper.vm, 'selectSlice');
      const openDialog = vi.spyOn(wrapper.vm, 'openDialog');

      await wrapper.vm.applyBarCodeComment(1);
      expect(selectSlice).toHaveBeenCalledTimes(1);
      expect(selectSlice).toHaveBeenCalledWith({ type: 'STOPPAGE', sliceStartTmISO: '2020-02-12T12:01:00', sliceEndTmISO: '2020-02-12T12:06:00', commentId: 2 });
      expect(openDialog).toHaveBeenCalledTimes(1);
      expect(openDialog).toHaveBeenCalledWith({
        ...dialogConfigs.COMMENT_DOWNTIME,
        data: { commentId: 1 },
      });
    });
  });

  describe('shiftQueryInterval', () => {
    it('doesnt start shiftQueryInterval if shift is running', () => {
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia({ shift: { shift: { id: 1 }, currentShift: { id: 1 } } }, { shift: { isShiftRunning: true } })],
          mocks: { $route },
        },
      });

      expect(wrapper.vm.shiftQueryInterval).toBe(null);
    });

    it('doesnt start shiftQueryInterval if old shift is shown', () => {
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia({ shift: { shift: { id: 1 }, currentShift: { id: 2 } } }, { shift: { isShiftRunning: false } })],
          mocks: { $route },
        },
      });

      expect(wrapper.vm.shiftQueryInterval).toBe(null);
    });

    it('starts shiftQueryInterval if shift is not running and latest known shift is shown, but the shift has ended', () => {
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia({ shift: { shift: { id: 2 }, currentShift: { id: 2 } } }, { shift: { isShiftRunning: false } })],
          mocks: { $route },
        },
      });

      expect(wrapper.vm.shiftQueryInterval).not.toBe(null);
      expectTypeOf(wrapper.vm.shiftQueryInterval).toEqualTypeOf(new CustomInterval());
    });

    it('stops shiftQueryInterval when component is unMounted', () => {
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia({ shift: { shift: { id: 2 }, currentShift: { id: 2 } } }, { shift: { isShiftRunning: false } })],
          mocks: { $route },
        },
      });

      expect(wrapper.vm.shiftQueryInterval).not.toBe(null);
      expectTypeOf(wrapper.vm.shiftQueryInterval).toEqualTypeOf(new CustomInterval());

      wrapper.unmount();
      expect(wrapper.vm.shiftQueryInterval).toBe(null);
    });

    it('doesnt do anything if after checkCurrectshift current shift is the same as latest known shift', async () => {
      const pinia = createPinia({ shift: { shift: { id: 2 }, currentShift: { id: 2 } } }, { shift: { isShiftRunning: false } });
      useShiftStore(pinia).fetchCurrentShift = vi.fn(() => ({ id: 2 }));
      const push = vi.fn();
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [pinia],
          mocks: { $route, $router: { push } },
        },
      });

      await wrapper.vm.checkCurrentShift();
      expect(push).toHaveBeenCalledTimes(0);
    });

    it('redirects to current shift if current shift is not the same as latest known shift', async () => {
      const pinia = createPinia({ shift: { shift: { id: 2 }, currentShift: { id: 3 } } }, { shift: { isShiftRunning: false } });
      useShiftStore(pinia).fetchCurrentShift = vi.fn(() => ({ id: 3 }));
      const push = vi.fn();
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [pinia],
          mocks: { $route, $router: { push } },
        },
      });

      await wrapper.vm.checkCurrentShift();
      expect(push).toHaveBeenCalledTimes(1);
      expect(push).toHaveBeenCalledWith({ name: 'shiftview', params: { shiftId: 3, stationId: 12 } });
    });
  });

  describe('onNewMessage', () => {
    it('increases newMessagesCount and unreadMessagesCount and calls setMessagesNotificationText', async () => {
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia()],
          mocks: { $route },
        },
      });

      await flushPromises();

      const setMessagesNotificationTextSpy = vi.spyOn(wrapper.vm, 'setMessagesNotificationText');

      expect(wrapper.vm.newMessagesCount).toBe(0);
      expect(wrapper.vm.unreadMessagesCount).toBe(0);

      await wrapper.vm.onNewMessage();

      expect(wrapper.vm.newMessagesCount).toBe(1);
      expect(wrapper.vm.unreadMessagesCount).toBe(1);
      expect(setMessagesNotificationTextSpy).toHaveBeenCalled();
    });
  });

  describe('setMessagesNotificationText', () => {
    it('sets messagesNotificationText to correct value if newMessagesCount is 1', async () => {
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia()],
          mocks: { $route },
        },
      });

      await flushPromises();

      await wrapper.setData({ newMessagesCount: 1 });

      await wrapper.vm.setMessagesNotificationText();

      expect(wrapper.vm.messagesNotificationText).toBe('message subject');
    });

    it('sets messagesNotificationText to correct value if newMessagesCount is more than 1', async () => {
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia()],
          mocks: { $route },
        },
      });

      await flushPromises();

      await wrapper.setData({ newMessagesCount: 2 });

      await wrapper.vm.setMessagesNotificationText();

      expect(wrapper.vm.messagesNotificationText).toBe('New messages ({variable})');
    });
  });

  describe('getMessageNotificationBottomMargin', () => {
    it('returns correct margin if isChecklistNotificationVisible is true', async () => {
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia()],
          mocks: { $route },
        },
      });

      await flushPromises();
      await wrapper.setData({ isChecklistNotificationVisible: true });

      expect(wrapper.vm.getMessageNotificationBottomMargin).toBe('92px');
    });

    it('returns correct margin if isChecklistNotificationVisible is false', async () => {
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia()],
          mocks: { $route },
        },
      });

      await flushPromises();
      expect(wrapper.vm.getMessageNotificationBottomMargin).toBe('8px');
    });
  });
  describe('setOfflineDevices', () => {
    it('leaves offlineDevices empty if currentStationDevicesState is empty', async () => {
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia()],
          mocks: { $route },
        },
      });
      await wrapper.setData({ currentStationDevicesState: {} });
      await wrapper.vm.setOfflineDevices();
      expect(wrapper.vm.offlineDevices).toEqual([]);
    });

    it('leaves offlineDevices empty if currentStationDevicesState does not have lineviewStation devices', async () => {
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia()],
          mocks: { $route },
        },
      });
      await wrapper.setData({ currentStationDevicesState: { 1: { 12344: { lastSeen: '2021-12-12T12:00:00.000Z', offlineNotificationInterval: 720, serialNo: 12344 } } } });
      await wrapper.vm.setOfflineDevices();
      expect(wrapper.vm.offlineDevices).toEqual([]);
    });

    it('leaves offlineDevices empty if device has lastSeen diff from now less than offlineNotificationInterval', async () => {
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia()],
          mocks: { $route },
        },
      });
      await wrapper.setData({ currentStationDevicesState: { 12: { 12344: { lastSeen: new Date().toISOString(), offlineNotificationInterval: 720, serialNo: 12344 } } } });
      await wrapper.vm.setOfflineDevices();
      expect(wrapper.vm.offlineDevices).toEqual([]);
    });

    it('sets offlineDevices correctly if device has lastSeen diff from now more than offlineNotificationInterval', async () => {
      const wrapper = shallowMount(ShiftView, {
        global: {
          plugins: [createPinia()],
          mocks: { $route },
        },
      });
      const lastSeen = subSeconds(new Date(), 800).toISOString();
      await wrapper.setData({ currentStationDevicesState: { 12: { 12344: { lastSeen, offlineNotificationInterval: 720, serialNo: 12344 } } } });
      await wrapper.vm.setOfflineDevices();
      expect(wrapper.vm.offlineDevices).toEqual([{
        serialNo: 12344,
        lastSeen,
        offlineNotificationInterval: 720,
        lastSeenDuration: '13m 20s',
      }]);
    });
  });
});

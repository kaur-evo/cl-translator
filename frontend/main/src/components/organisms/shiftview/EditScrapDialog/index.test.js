import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { DateTime } from 'luxon';

import EditScrapDialog from './index.vue';

import {
  useShiftviewTimelineStore, useScrapReasonStore,
  useDeviceStore, useShiftviewSelectionStore,
  useConfirmDialogStore, useGenericNotificationStore, useGenericDialogStore,
} from '@/stores/index';
import scrapApi from '@/api/scrapReasonApi';
import { eventBus } from '@/eventBus';
import statisticsApi from '@/api/statisticsApi';
import { getUnitId } from '@/helpers/timeline/altUnitConversion';

vi.mock('@/api/statisticsApi');
const getPeriodScrapReasonsMock = vi.fn().mockReturnValue([{ entityId: 1 }, { entityId: 2 }, { entityId: 3 }]);
statisticsApi.getTopScrapReasons = getPeriodScrapReasonsMock;

vi.mock('@/eventBus');
eventBus.$emit = vi.fn();

const saveScrapMock = vi.fn().mockReturnValue({ success: true });
vi.mock('@/api/scrapReasonApi');
scrapApi.saveScrap = saveScrapMock;

vi.mock('@/helpers/timeline/altUnitConversion');
getUnitId.mockReturnValue('l');

const defaultTimeline = [
  {
    type: 'PRODUCT', sliceStartTmISO: '2020-12-12T14:50:00.000Z', sliceEndTmISO: '2020-12-12T14:51:00.000Z', batchId: 1, quantity: 1, scrapQty: 0, scrapReasonId: 1, scrapNotes: 'note 2',
  },
  {
    type: 'PRODUCT', sliceStartTmISO: '2020-12-12T14:51:00.000Z', sliceEndTmISO: '2020-12-12T14:52:00.000Z', batchId: 1, quantity: 1, scrapQty: 0, scrapReasonId: 1, scrapNotes: 'note 2',
  },
  {
    type: 'PRODUCT', sliceStartTmISO: '2020-12-12T14:52:00.000Z', sliceEndTmISO: '2020-12-12T14:53:00.000Z', batchId: 2, quantity: 1, scrapQty: 0, scrapReasonId: 0, scrapNotes: '',
  },
  {
    type: 'PRODUCT', sliceStartTmISO: '2020-12-12T14:53:00.000Z', sliceEndTmISO: '2020-12-12T14:54:00.000Z', batchId: 2, quantity: 1, scrapQty: 1, scrapReasonId: 1, scrapNotes: 'test note',
  },
  {
    type: 'PRODUCT', sliceStartTmISO: '2020-12-12T14:54:00.000Z', sliceEndTmISO: '2020-12-12T14:55:00.000Z', batchId: 2, quantity: 1, scrapQty: 0, scrapReasonId: 0, scrapNotes: '',
  },
  {
    type: 'PRODUCT', sliceStartTmISO: '2020-12-12T14:55:00.000Z', sliceEndTmISO: '2020-12-12T14:56:00.000Z', batchId: 2, quantity: 1, scrapQty: 1, scrapReasonId: 2, scrapNotes: '',
  },
  {
    type: 'PRODUCT', sliceStartTmISO: '2020-12-12T14:56:00.000Z', sliceEndTmISO: '2020-12-12T14:57:00.000Z', batchId: 2, quantity: 1, scrapQty: 0, scrapReasonId: 0, scrapNotes: '',
  },
  {
    type: 'PRODUCT', sliceStartTmISO: '2020-12-12T14:57:00.000Z', sliceEndTmISO: '2020-12-12T14:58:00.000Z', batchId: 2, quantity: 1, scrapQty: 0, scrapReasonId: 0, scrapNotes: '',
  },
  {
    type: 'PRODUCT', sliceStartTmISO: '2020-12-12T14:58:00.000Z', sliceEndTmISO: '2020-12-12T14:59:00.000Z', batchId: 2, quantity: 1, scrapQty: 1, scrapReasonId: 1, scrapNotes: 'note 1',
  },
  {
    type: 'PRODUCT', sliceStartTmISO: '2020-12-12T14:59:00.000Z', sliceEndTmISO: '2020-12-12T15:00:00.000Z', batchId: 2, quantity: 1, scrapQty: 1, scrapReasonId: 1, scrapNotes: 'note 1',
  },
  {
    type: 'PRODUCT', sliceStartTmISO: '2020-12-12T15:00:00.000Z', sliceEndTmISO: '2020-12-12T15:00:00.000Z', batchId: 2, quantity: 1, scrapQty: 1, scrapReasonId: 1, scrapNotes: 'note 2',
  },
  {
    type: 'PRODUCT', sliceStartTmISO: '2020-12-12T15:00:00.000Z', sliceEndTmISO: '2020-12-12T15:00:00.000Z', batchId: 2, quantity: 5, scrapQty: 2, scrapReasonId: 1, scrapNotes: 'note 2',
  },
];

const defaultBatches = new Map([
  [3, {
    startTimeISO: '2020-12-12T18:00:00.000Z',
    endTimeISO: null,
    id: 3,
    productName: 'test product',
    productSku: 'test sku',
    productId: 1,
    unitQty: 2,
    unitId: 'l',
    producedQty: 0,
  }],
  [2, {
    startTimeISO: '2020-12-12T14:55:00.000Z',
    endTimeISO: '2020-12-12T18:00.000Z',
    id: 2,
    productName: 'test product',
    productSku: 'test sku',
    productId: 1,
    unitQty: 2,
    unitId: 'l',
    producedQty: 222,
  }],
  [1, {
    id: 1,
    startTimeISO: '2020-12-12T14:50:00.000Z',
    endTimeISO: '2020-12-12T14:52:00.000Z',
    productName: 'last product',
    productSku: '',
    productId: 2,
    unitQty: 1,
    unitId: 'pcs',
    producedQty: 111,
  }],
]);

const defaultPiniaState = {
  station: { lineviewStation: { id: 4, factoryId: 2, zoneId: 'UTC' } },
  shift: { shift: { id: 5, startTimeISO: '2020-12-12T14:45:00.000Z', endTimeISO: '2020-12-12T20:45:00.000Z' } },
  shiftviewTimeline: { timeline: defaultTimeline, batches: defaultBatches },
  genericDialog: { dialogData: {}, previousState: {}, allowFullscreen: true },
  profile: { language: 'et' },
  userPreferences: { viewSettings: { usePrimaryUnit: true } },
};

const createPinia = (overrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: { ...defaultPiniaState, ...overrides },
  });

  const timelineStore = useShiftviewTimelineStore(pinia);
  timelineStore.currentBatch = overrides.shiftviewTimeline?.currentBatch ?? {
    startTimeISO: '2020-12-12T14:55:00.000Z', endTimeISO: null, id: 2, productName: 'test product', productSku: 'test sku', productId: 1, unitId: 'l',
  };

  const scrapReasonStore = useScrapReasonStore(pinia);
  scrapReasonStore.shiftviewStationScrapReasons = overrides.scrapReason?.shiftviewStationScrapReasons ?? [{ id: 1, name: 'test1', groupId: 1 }, { id: 2, name: 'test2', groupId: 2 }, { id: 3, name: 'test3', groupId: 2 }];
  scrapReasonStore.scrapReasonsRealMap = overrides.scrapReason?.scrapReasonsRealMap ?? new Map([[1, { id: 1, name: 'test1', groupId: 1 }], [2, { id: 2, name: 'test2', groupId: 2 }], [3, { id: 3, name: 'test3', groupId: 2 }]]);
  scrapReasonStore.scrapReasonGroupsWithOrdering = overrides.scrapReason?.scrapReasonGroupsWithOrdering ?? [{ id: 1, factoryIds: [2], local: true }, { id: 2, factoryIds: [2], local: true }];
  scrapReasonStore.scrapReasonGroupsRealMap = overrides.scrapReason?.scrapReasonGroupsRealMap ?? new Map([[1, { id: 1, factoryIds: [2], local: true }], [2, { id: 2, factoryIds: [2], local: true }]]);

  const deviceStore = useDeviceStore(pinia);
  deviceStore.showFullscreenDialogs = overrides.device?.showFullscreenDialogs ?? false;
  deviceStore.screenWidth = overrides.device?.screenWidth ?? 1600;
  deviceStore.screenHeight = overrides.device?.screenHeight ?? 929;
  deviceStore.isMobileView = overrides.device?.isMobileView ?? false;

  const selectionStore = useShiftviewSelectionStore(pinia);
  selectionStore.bracketSelectedSlices = overrides.shiftviewSelection?.bracketSelectedSlices ?? [];
  selectionStore.firstSelectedSlice = overrides.shiftviewSelection?.firstSelectedSlice ?? {};

  useConfirmDialogStore(pinia);
  useGenericNotificationStore(pinia);

  return pinia;
};

const createWrapper = (overrides = {}, options = {}) => {
  const pinia = createPinia(overrides);
  const wrapper = shallowMount(EditScrapDialog, {
    global: { plugins: [pinia] },
    ...options,
  });
  wrapper.pinia = pinia;
  return wrapper;
};

describe('EditScrapDialog', () => {
  let originalWindowInnerHeight;

  beforeEach(() => {
    originalWindowInnerHeight = window.innerHeight;
    window.innerHeight = 1000;
  });

  afterEach(() => {
    window.innerHeight = originalWindowInnerHeight;
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('that fetchScrapReasonGroups and fetchAllScrapReasons are called on mounted', async () => {
    const wrapper = createWrapper({ profile: { language: 'en' } });

    await flushPromises();

    const scrapReasonStore = useScrapReasonStore(wrapper.pinia);
    expect(scrapReasonStore.fetchScrapReasonGroups).toHaveBeenCalledWith({ lang: 'en' });
    expect(scrapReasonStore.fetchAllScrapReasons).toHaveBeenCalledWith({ lang: 'en' });
  });

  test('one circle without scrap selected', async () => {
    const selectedSlice = defaultTimeline[4];
    const wrapper = createWrapper({
      shiftviewSelection: { bracketSelectedSlices: [selectedSlice], firstSelectedSlice: selectedSlice },
    });

    await flushPromises();

    // mounting
    expect(wrapper.vm.dialogTitle).toBe('Uncommented 14:55');
    expect(wrapper.vm.formData.scrapQty).toBe(1);
    expect(wrapper.vm.formData.scrapReasonId).toBe(undefined);
    expect(wrapper.vm.formData.scrapNotes).toBe('');
    expect(wrapper.vm.scrapGroupId).toBe(1);
    expect(wrapper.vm.formData.unitId).toBe('l');

    // computed properties
    expect(wrapper.vm.selectedSlicesProperties).toEqual({
      scrapReasons: [], hasEmptyReason: true, scrapNotes: [], hasEmptyNote: true, scrapQty: 0, hasSliceWOScrap: true,
    });
    expect(wrapper.vm.maxMainQtyValue).toBe(1);
    expect(wrapper.vm.canDeleteScrap).toBe(false);

    // get methods
    expect(wrapper.vm.getPreviousQty()).toBe(0);
    expect(wrapper.vm.getScrapRanges()).toStrictEqual([{ startTimeISO: selectedSlice.sliceStartTmISO, endTimeISO: selectedSlice.sliceEndTmISO }]);

    // saving
    const newData = { scrapQty: 1, scrapNotes: 'abc', scrapReasonId: 2 };
    wrapper.setData({ formData: newData });
    expect(wrapper.vm.areValuesBeingOverwritten).toBe(false);
    wrapper.vm.saveScrap();
    expect(saveScrapMock).toHaveBeenCalledTimes(1);
    expect(saveScrapMock).toHaveBeenCalledWith(4, {
      scrapQty: 1,
      qtyType: 'delta',
      shiftId: 5,
      scrapNotes: newData.scrapNotes,
      scrapReasonId: newData.scrapReasonId,
      overwrite: true,
      scrapRanges: [{ startTimeISO: selectedSlice.sliceStartTmISO, endTimeISO: selectedSlice.sliceEndTmISO }],
      unitId: 'l',
    });
  });

  test('one circle with scrap selected', async () => {
    const selectedSlice = defaultTimeline[3];
    const wrapper = createWrapper({
      shiftviewSelection: { bracketSelectedSlices: [selectedSlice], firstSelectedSlice: selectedSlice },
    });

    await flushPromises();

    // mounting
    expect(wrapper.vm.dialogTitle).toBe(`test1 ${DateTime.fromISO(selectedSlice.sliceEndTmISO).setZone('UTC').toFormat('HH:mm')}`);
    expect(wrapper.vm.formData.scrapQty).toBe(selectedSlice.quantity);
    expect(wrapper.vm.formData.scrapReasonId).toBe(selectedSlice.scrapReasonId);
    expect(wrapper.vm.formData.scrapNotes).toBe(selectedSlice.scrapNotes);
    expect(wrapper.vm.formData.unitId).toBe('l');
    expect(wrapper.vm.scrapGroupId).toBe(1);

    // computed properties
    expect(wrapper.vm.selectedSlicesProperties).toEqual({
      scrapReasons: [1], hasEmptyReason: false, scrapNotes: ['test note'], hasEmptyNote: false, scrapQty: 1, hasSliceWOScrap: false,
    });
    expect(wrapper.vm.maxMainQtyValue).toBe(1);
    expect(wrapper.vm.canDeleteScrap).toBe(true);

    // get methods
    expect(wrapper.vm.getPreviousQty()).toBe(1);
    expect(wrapper.vm.getScrapRanges()).toStrictEqual([{ startTimeISO: selectedSlice.sliceStartTmISO, endTimeISO: selectedSlice.sliceEndTmISO }]);

    // saving
    const newData = { scrapQty: 1, scrapNotes: 'abc', scrapReasonId: 2 };
    wrapper.setData({ formData: newData });
    expect(wrapper.vm.areValuesBeingOverwritten).toBe(true);
    wrapper.vm.saveScrap();
    expect(saveScrapMock).toHaveBeenCalledTimes(1);
    expect(saveScrapMock).toHaveBeenCalledWith(4, {
      scrapQty: 0,
      qtyType: 'delta',
      shiftId: 5,
      scrapNotes: newData.scrapNotes,
      scrapReasonId: newData.scrapReasonId,
      overwrite: true,
      scrapRanges: [{ startTimeISO: selectedSlice.sliceStartTmISO, endTimeISO: selectedSlice.sliceEndTmISO }],
      unitId: 'l',
    });
  });

  test('one circle with partial scrap selected', async () => {
    const selectedSlice = defaultTimeline[11];
    const wrapper = createWrapper({
      shiftviewSelection: { bracketSelectedSlices: [selectedSlice], firstSelectedSlice: selectedSlice },
    });

    await flushPromises();

    // mounting
    expect(wrapper.vm.dialogTitle).toBe(`test1 ${
      DateTime.fromISO(selectedSlice.sliceEndTmISO).setZone('UTC').toFormat('HH:mm')
    }`);
    expect(wrapper.vm.formData.scrapQty).toBe(selectedSlice.scrapQty);
    expect(wrapper.vm.formData.scrapReasonId).toBe(selectedSlice.scrapReasonId);
    expect(wrapper.vm.formData.scrapNotes).toBe(selectedSlice.scrapNotes);
    expect(wrapper.vm.scrapGroupId).toBe(1);
    expect(wrapper.vm.formData.unitId).toBe('l');

    // computed properties
    expect(wrapper.vm.selectedSlicesProperties).toEqual({
      scrapReasons: [1], hasEmptyReason: false, scrapNotes: ['note 2'], hasEmptyNote: false, scrapQty: 2, hasSliceWOScrap: false,
    });
    expect(wrapper.vm.maxMainQtyValue).toBe(5);
    expect(wrapper.vm.canDeleteScrap).toBe(true);

    // get methods
    expect(wrapper.vm.getPreviousQty()).toBe(2);
    expect(wrapper.vm.getScrapRanges()).toStrictEqual([{ startTimeISO: selectedSlice.sliceStartTmISO, endTimeISO: selectedSlice.sliceEndTmISO }]);

    // saving
    const newData = { scrapQty: 1, scrapNotes: 'abc', scrapReasonId: 2 };
    wrapper.setData({ formData: newData });
    expect(wrapper.vm.areValuesBeingOverwritten).toBe(true);
    wrapper.vm.saveScrap();
    expect(saveScrapMock).toHaveBeenCalledTimes(1);
    expect(saveScrapMock).toHaveBeenCalledWith(4, {
      scrapQty: -1,
      qtyType: 'delta',
      shiftId: 5,
      scrapNotes: newData.scrapNotes,
      scrapReasonId: newData.scrapReasonId,
      overwrite: true,
      scrapRanges: [{ startTimeISO: selectedSlice.sliceStartTmISO, endTimeISO: selectedSlice.sliceEndTmISO }],
      unitId: 'l',
    });
  });
  test('multiple circles without scrap selected', async () => {
    const firstSlice = defaultTimeline[6];
    const secondSlice = defaultTimeline[7];
    const wrapper = createWrapper({
      station: { lineviewStation: { id: 5, defaultScrapReasonId: 3 } },
      shiftviewSelection: { bracketSelectedSlices: [firstSlice, secondSlice], firstSelectedSlice: firstSlice },
    });

    await flushPromises();

    // mounting
    expect(wrapper.vm.dialogTitle).toBe(`test3 ${
      DateTime.fromISO(firstSlice.sliceEndTmISO).setZone('UTC').toFormat('HH:mm')
    } - ${
      DateTime.fromISO(secondSlice.sliceEndTmISO).setZone('UTC').toFormat('HH:mm')
    }`);
    expect(wrapper.vm.formData.scrapQty).toBe(firstSlice.quantity + secondSlice.quantity);
    expect(wrapper.vm.formData.scrapReasonId).toBe(3);
    expect(wrapper.vm.formData.scrapNotes).toBe('');
    expect(wrapper.vm.scrapGroupId).toBe(2);
    expect(wrapper.vm.formData.unitId).toBe('l');

    // computed properties
    expect(wrapper.vm.selectedSlicesProperties).toEqual({
      scrapReasons: [], hasEmptyReason: true, scrapNotes: [], hasEmptyNote: true, scrapQty: 0, hasSliceWOScrap: true,
    });
    expect(wrapper.vm.maxMainQtyValue).toBe(2);
    expect(wrapper.vm.canDeleteScrap).toBe(false);

    // get methods
    expect(wrapper.vm.getPreviousQty()).toBe(0);
    expect(wrapper.vm.getScrapRanges()).toStrictEqual([{ startTimeISO: firstSlice.sliceStartTmISO, endTimeISO: secondSlice.sliceEndTmISO }]);

    // saving
    const newData = { scrapQty: 1, scrapNotes: 'abc', scrapReasonId: 2 };
    wrapper.setData({ formData: newData });
    expect(wrapper.vm.areValuesBeingOverwritten).toBe(false);
    await wrapper.vm.saveScrap();
    expect(saveScrapMock).toHaveBeenCalledTimes(1);
    expect(saveScrapMock).toHaveBeenCalledWith(5, {
      scrapQty: 1,
      qtyType: 'delta',
      shiftId: 5,
      scrapNotes: newData.scrapNotes,
      scrapReasonId: newData.scrapReasonId,
      overwrite: true,
      scrapRanges: [{ startTimeISO: firstSlice.sliceStartTmISO, endTimeISO: secondSlice.sliceEndTmISO }],
      unitId: 'l',
    });
  });

  test('multiple circles with same scrap properties selected', async () => {
    const firstSlice = defaultTimeline[8];
    const secondSlice = defaultTimeline[9];
    const wrapper = createWrapper({
      shiftviewSelection: { bracketSelectedSlices: [firstSlice, secondSlice], firstSelectedSlice: firstSlice },
    });

    await flushPromises();

    // mounting
    expect(wrapper.vm.dialogTitle).toBe(`test1 ${
      DateTime.fromISO(firstSlice.sliceEndTmISO).setZone('UTC').toFormat('HH:mm')
    } - ${
      DateTime.fromISO(secondSlice.sliceEndTmISO).setZone('UTC').toFormat('HH:mm')
    }`);
    expect(wrapper.vm.formData.scrapQty).toBe(firstSlice.quantity + secondSlice.quantity);
    expect(wrapper.vm.formData.scrapReasonId).toBe(firstSlice.scrapReasonId);
    expect(wrapper.vm.formData.scrapNotes).toBe(firstSlice.scrapNotes);
    expect(wrapper.vm.scrapGroupId).toBe(1);
    expect(wrapper.vm.formData.unitId).toBe('l');

    // computed properties
    expect(wrapper.vm.selectedSlicesProperties).toEqual({
      scrapReasons: [1], hasEmptyReason: false, scrapNotes: ['note 1'], hasEmptyNote: false, scrapQty: 2, hasSliceWOScrap: false,
    });
    expect(wrapper.vm.maxMainQtyValue).toBe(2);
    expect(wrapper.vm.canDeleteScrap).toBe(true);

    // get methods
    expect(wrapper.vm.getPreviousQty()).toBe(firstSlice.scrapQty + secondSlice.scrapQty);
    expect(wrapper.vm.getScrapRanges()).toStrictEqual([{ startTimeISO: firstSlice.sliceStartTmISO, endTimeISO: secondSlice.sliceEndTmISO }]);

    // saving
    const newData = { scrapQty: 1, scrapNotes: 'abc', scrapReasonId: 2 };
    wrapper.setData({ formData: newData });
    expect(wrapper.vm.areValuesBeingOverwritten).toBe(true);
    await wrapper.vm.saveScrap();
    expect(saveScrapMock).toHaveBeenCalledTimes(1);
    expect(saveScrapMock).toHaveBeenCalledWith(4, {
      scrapQty: 1 - (firstSlice.scrapQty + secondSlice.scrapQty),
      qtyType: 'delta',
      shiftId: 5,
      scrapNotes: newData.scrapNotes,
      scrapReasonId: newData.scrapReasonId,
      overwrite: true,
      scrapRanges: [{ startTimeISO: firstSlice.sliceStartTmISO, endTimeISO: secondSlice.sliceEndTmISO }],
      unitId: 'l',
    });
  });

  test('multiple circles with different scrap properties selected', async () => {
    const firstSlice = defaultTimeline[9];
    const secondSlice = defaultTimeline[10];
    const wrapper = createWrapper({
      shiftviewSelection: { bracketSelectedSlices: [firstSlice, secondSlice], firstSelectedSlice: firstSlice },
    });

    await flushPromises();

    // mounting
    expect(wrapper.vm.dialogTitle).toBe(`Uncommented ${
      DateTime.fromISO(firstSlice.sliceEndTmISO).setZone('UTC').toFormat('HH:mm')
    } - ${
      DateTime.fromISO(secondSlice.sliceEndTmISO).setZone('UTC').toFormat('HH:mm')
    }`);
    expect(wrapper.vm.formData.scrapQty).toBe(firstSlice.quantity + secondSlice.quantity);
    expect(wrapper.vm.formData.scrapReasonId).toBe(undefined);
    expect(wrapper.vm.formData.scrapNotes).toBe('');
    expect(wrapper.vm.scrapGroupId).toBe(1);
    expect(wrapper.vm.formData.unitId).toBe('l');

    // computed properties
    expect(wrapper.vm.selectedSlicesProperties).toEqual({
      scrapReasons: [1], hasEmptyReason: false, scrapNotes: ['note 1', 'note 2'], hasEmptyNote: false, scrapQty: 2, hasSliceWOScrap: false,
    });
    expect(wrapper.vm.maxMainQtyValue).toBe(2);
    expect(wrapper.vm.canDeleteScrap).toBe(false);

    // get methods
    expect(wrapper.vm.getPreviousQty()).toBe(firstSlice.scrapQty + secondSlice.scrapQty);
    expect(wrapper.vm.getScrapRanges()).toStrictEqual([{ startTimeISO: firstSlice.sliceStartTmISO, endTimeISO: secondSlice.sliceEndTmISO }]);

    // saving
    const newData = { scrapQty: 1, scrapNotes: 'abc', scrapReasonId: 2 };
    wrapper.setData({ formData: newData });
    expect(wrapper.vm.areValuesBeingOverwritten).toBe(true);
    await wrapper.vm.saveScrap();
    expect(saveScrapMock).toHaveBeenCalledTimes(1);
    expect(saveScrapMock).toHaveBeenCalledWith(4, {
      scrapQty: 1 - (firstSlice.scrapQty + secondSlice.scrapQty),
      qtyType: 'delta',
      shiftId: 5,
      scrapNotes: newData.scrapNotes,
      scrapReasonId: newData.scrapReasonId,
      overwrite: true,
      scrapRanges: [{ startTimeISO: firstSlice.sliceStartTmISO, endTimeISO: secondSlice.sliceEndTmISO }],
      unitId: 'l',
    });
  });

  test('multiple circles selected - some have scrap and some not', async () => {
    const firstSlice = defaultTimeline[7];
    const secondSlice = defaultTimeline[8];
    const thirdSlice = defaultTimeline[9];
    const wrapper = createWrapper({
      shiftviewSelection: { bracketSelectedSlices: [firstSlice, secondSlice, thirdSlice], firstSelectedSlice: firstSlice },
    });

    await flushPromises();

    // mounting
    expect(wrapper.vm.dialogTitle).toBe(`test1 ${
      DateTime.fromISO(firstSlice.sliceEndTmISO).setZone('UTC').toFormat('HH:mm')
    } - ${
      DateTime.fromISO(thirdSlice.sliceEndTmISO).setZone('UTC').toFormat('HH:mm')
    }`);
    expect(wrapper.vm.formData.scrapQty).toBe(firstSlice.quantity + secondSlice.quantity + thirdSlice.quantity);
    expect(wrapper.vm.formData.scrapReasonId).toBe(1);
    expect(wrapper.vm.formData.scrapNotes).toBe('note 1');
    expect(wrapper.vm.scrapGroupId).toBe(1);
    expect(wrapper.vm.formData.unitId).toBe('l');

    // computed properties
    expect(wrapper.vm.selectedSlicesProperties).toEqual({
      scrapReasons: [1], hasEmptyReason: true, scrapNotes: ['note 1'], hasEmptyNote: true, scrapQty: 2, hasSliceWOScrap: true,
    });
    expect(wrapper.vm.maxMainQtyValue).toBe(3);
    expect(wrapper.vm.canDeleteScrap).toBe(false);

    // get methods
    expect(wrapper.vm.getPreviousQty()).toBe(firstSlice.scrapQty + secondSlice.scrapQty + thirdSlice.scrapQty);
    expect(wrapper.vm.getScrapRanges()).toStrictEqual([{ startTimeISO: firstSlice.sliceStartTmISO, endTimeISO: thirdSlice.sliceEndTmISO }]);

    // saving
    const newData = { scrapQty: 3, scrapNotes: 'abc', scrapReasonId: 2 };
    wrapper.setData({ formData: newData });
    expect(wrapper.vm.areValuesBeingOverwritten).toBe(true);
    await wrapper.vm.saveScrap();
    expect(saveScrapMock).toHaveBeenCalledTimes(1);
    expect(saveScrapMock).toHaveBeenCalledWith(4, {
      scrapQty: 3 - (wrapper.vm.getPreviousQty()),
      qtyType: 'delta',
      shiftId: 5,
      scrapNotes: newData.scrapNotes,
      scrapReasonId: newData.scrapReasonId,
      overwrite: true,
      scrapRanges: [{ startTimeISO: firstSlice.sliceStartTmISO, endTimeISO: thirdSlice.sliceEndTmISO }],
      unitId: 'l',
    });
  });

  test('edit from overview', async () => {
    const selectedScrapBatch = {
      scrapRanges: [
        { startTimeISO: '2020-12-12T13:45:00.000Z', endTimeISO: '2020-12-12T13:50:00.000Z' },
        { startTimeISO: '2020-12-12T14:05:00.000Z', endTimeISO: '2020-12-12T14:50:00.000Z' },
        { startTimeISO: '2020-12-12T15:35:00.000Z', endTimeISO: '2020-12-12T15:37:00.000Z' },
      ],
      scrapQty: 7,
      batchId: 2,
      scrapReasonId: 2,
      scrapNotes: 'abc',
    };
    const wrapper = createWrapper({
      genericDialog: { dialogData: { selectedScrapBatch }, previousState: {}, allowFullscreen: true },
    });

    await flushPromises();

    // mounting
    expect(wrapper.vm.dialogTitle).toBe(`test2 ${
      DateTime.fromISO('2020-12-12T13:45:00.000Z').setZone('UTC').toFormat('HH:mm')
    } - ${
      DateTime.fromISO('2020-12-12T15:37:00.000Z').setZone('UTC').toFormat('HH:mm')
    }`);
    expect(wrapper.vm.formData.scrapQty).toBe(7);
    expect(wrapper.vm.formData.scrapReasonId).toBe(2);
    expect(wrapper.vm.formData.scrapNotes).toBe('abc');
    expect(wrapper.vm.scrapGroupId).toBe(2);
    expect(wrapper.vm.formData.unitId).toBe('l');

    // computed properties
    expect(wrapper.vm.maxMainQtyValue).toBe(14);
    expect(wrapper.vm.canDeleteScrap).toBe(true);

    // get methods
    expect(wrapper.vm.getPreviousQty()).toBe(selectedScrapBatch.scrapQty);
    expect(wrapper.vm.getBatchEmptyRanges(selectedScrapBatch.batchId)).toStrictEqual([
      { startTimeISO: '2020-12-12T14:52:00.000Z', endTimeISO: '2020-12-12T14:53:00.000Z' },
      { startTimeISO: '2020-12-12T14:54:00.000Z', endTimeISO: '2020-12-12T14:55:00.000Z' },
      { startTimeISO: '2020-12-12T14:56:00.000Z', endTimeISO: '2020-12-12T14:58:00.000Z' },
    ]);
    expect(wrapper.vm.getScrapRanges()).toEqual(selectedScrapBatch.scrapRanges.concat(wrapper.vm.getBatchEmptyRanges(selectedScrapBatch.batchId)));

    // saving
    const newData = { scrapQty: 10, scrapNotes: 'abc', scrapReasonId: 2 };
    wrapper.setData({ formData: newData });
    expect(wrapper.vm.areValuesBeingOverwritten).toBe(false);
    await wrapper.vm.saveScrap();
    expect(saveScrapMock).toHaveBeenCalledTimes(1);
    expect(saveScrapMock).toHaveBeenCalledWith(4, {
      scrapQty: newData.scrapQty - selectedScrapBatch.scrapQty,
      qtyType: 'delta',
      shiftId: 5,
      scrapNotes: newData.scrapNotes,
      scrapReasonId: newData.scrapReasonId,
      overwrite: true,
      scrapRanges: wrapper.vm.getScrapRanges(),
      unitId: 'l',
    });
  });

  test('add from overview', async () => {
    const wrapper = createWrapper();

    await flushPromises();

    // mounting
    expect(wrapper.vm.dialogTitle).toBe('Uncommented 14:52 - 15:00');
    expect(wrapper.vm.formData.scrapQty).toBe(2); // unitQty of selected product
    expect(wrapper.vm.formData.scrapReasonId).toBe(undefined);
    expect(wrapper.vm.formData.scrapNotes).toBe('');
    expect(wrapper.vm.scrapGroupId).toBe(1);
    expect(wrapper.vm.selectedBatchId).toBe(2);
    expect(wrapper.vm.formData.unitId).toBe('l');

    // computed properties
    expect(wrapper.vm.maxMainQtyValue).toBe(7); // good qty of selected batch
    expect(wrapper.vm.canDeleteScrap).toBe(false);

    // get methods
    expect(wrapper.vm.getPreviousQty()).toBe(0);
    expect(wrapper.vm.getScrapRanges()).toEqual([{ startTimeISO: '2020-12-12T14:52:00.000Z', endTimeISO: '2020-12-12T15:00:00.000Z' }]);

    // data edit
    await wrapper.setData({ selectedBatchId: 1 });
    expect(wrapper.vm.dialogTitle).toBe('Uncommented 14:50 - 14:52');
    expect(wrapper.vm.formData.scrapQty).toBe(1); // unitQty of selected product
    expect(wrapper.vm.maxMainQtyValue).toBe(2); // good qty of selected batch
    expect(wrapper.vm.canDeleteScrap).toBe(false);
    expect(wrapper.vm.getPreviousQty()).toBe(0);
    expect(wrapper.vm.getScrapRanges()).toEqual([{ startTimeISO: '2020-12-12T14:50:00.000Z', endTimeISO: '2020-12-12T14:52:00.000Z' }]);

    const newData = { scrapQty: 8, scrapNotes: 'abcd', scrapReasonId: 1 };
    await wrapper.setData({ formData: newData });
    expect(wrapper.vm.dialogTitle).toBe('test1 14:50 - 14:52');
    wrapper.setData({ formData: newData });
    expect(wrapper.vm.formData.scrapQty).toBe(8);
    expect(wrapper.vm.formData.scrapReasonId).toBe(1);
    expect(wrapper.vm.formData.scrapNotes).toBe('abcd');
    expect(wrapper.vm.scrapGroupId).toBe(1);

    // saving
    expect(wrapper.vm.areValuesBeingOverwritten).toBe(false);
    await wrapper.vm.saveScrap();
    expect(saveScrapMock).toHaveBeenCalledTimes(1);
    expect(saveScrapMock).toHaveBeenCalledWith(4, {
      scrapQty: newData.scrapQty,
      qtyType: 'delta',
      shiftId: 5,
      scrapNotes: newData.scrapNotes,
      scrapReasonId: newData.scrapReasonId,
      overwrite: false,
      scrapRanges: wrapper.vm.getScrapRanges(),
      unitId: 'pcs',
    });
  });

  test('adding scrap when alternativeUnit is defined', async () => {
    const selectedSlice = {
      type: 'PRODUCT', sliceStartTmISO: '2020-12-12T14:50:00.000Z', sliceEndTmISO: '2020-12-12T14:51:00.000Z', batchId: 3, quantity: 1, scrapQty: 0,
    };
    const batch = {
      startTimeISO: '2020-12-12T14:55:00.000Z',
      endTimeISO: null,
      id: 3,
      productName: 'test product',
      productSku: 'test sku',
      productId: 1,
      unitQty: 2,
      unitId: 'unit',
      alternativeUnitId: 'altunit',
      unitConversionType: 'ALT_TO_PRIMARY',
      unitConversion: 3,
    };
    getUnitId.mockReturnValue('unit');
    const wrapper = createWrapper({
      shiftviewTimeline: { timeline: [selectedSlice], batches: new Map([[batch.id, batch]]), currentBatch: batch },
      shiftviewSelection: { bracketSelectedSlices: [selectedSlice], firstSelectedSlice: selectedSlice },
    });

    await flushPromises();

    // mounting
    expect(wrapper.vm.formData.scrapQty).toBe(selectedSlice.quantity);
    expect(wrapper.vm.formData.unitId).toBe(batch.unitId);
    expect(wrapper.vm.isMainUnitSelected).toBe(true);
    expect(wrapper.vm.mainToAltUnitConversion).toBe(3);
    expect(wrapper.vm.units).toEqual([{ id: batch.unitId, name: batch.unitId }, { id: batch.alternativeUnitId, name: batch.alternativeUnitId }]);
    expect(wrapper.vm.maxMainQtyValue).toBe(1);
    expect(wrapper.vm.maxSelectedQtyValue).toBe(1);
    expect(wrapper.vm.unitMultiplier).toBe(1);

    await wrapper.setData({ formData: { unitId: batch.alternativeUnitId } });
    expect(wrapper.vm.isMainUnitSelected).toBe(false);
    expect(wrapper.vm.maxSelectedQtyValue).toBe(wrapper.vm.maxMainQtyValue * 3);
    expect(wrapper.vm.unitMultiplier).toBe(3);

    // saving
    const newData = { scrapQty: 1, scrapNotes: 'abc', scrapReasonId: 2 };
    wrapper.setData({ formData: newData });
    expect(wrapper.vm.areValuesBeingOverwritten).toBe(false);
    wrapper.vm.saveScrap();
    expect(saveScrapMock).toHaveBeenCalledTimes(1);
    expect(saveScrapMock).toHaveBeenCalledWith(4, {
      scrapQty: 1,
      qtyType: 'delta',
      shiftId: 5,
      scrapNotes: newData.scrapNotes,
      scrapReasonId: newData.scrapReasonId,
      overwrite: true,
      scrapRanges: [{ startTimeISO: selectedSlice.sliceStartTmISO, endTimeISO: selectedSlice.sliceEndTmISO }],
      unitId: batch.alternativeUnitId,
    });
  });

  test('editing scrap when alternativeUnit is defined', async () => {
    const selectedSlice = {
      type: 'PRODUCT', sliceStartTmISO: '2020-12-12T14:50:00.000Z', sliceEndTmISO: '2020-12-12T14:51:00.000Z', batchId: 3, quantity: 10, scrapQty: 1, scrapReasonId: 1,
    };
    const batch = {
      startTimeISO: '2020-12-12T14:55:00.000Z',
      endTimeISO: null,
      id: 3,
      productName: 'test product',
      productSku: 'test sku',
      productId: 1,
      unitQty: 2,
      unitId: 'unit',
      alternativeUnitId: 'altunit',
      unitConversionType: 'ALT_TO_PRIMARY',
      unitConversion: 3,
    };
    const wrapper = createWrapper({
      shiftviewTimeline: { timeline: [selectedSlice], batches: new Map([[batch.id, batch]]), currentBatch: batch },
      shiftviewSelection: { bracketSelectedSlices: [selectedSlice], firstSelectedSlice: selectedSlice },
    });

    await flushPromises();

    // mounting
    expect(wrapper.vm.formData.scrapQty).toBe(selectedSlice.scrapQty);
    expect(wrapper.vm.formData.unitId).toBe(batch.unitId);
    expect(wrapper.vm.isMainUnitSelected).toBe(true);
    expect(wrapper.vm.mainToAltUnitConversion).toBe(3);
    expect(wrapper.vm.units).toEqual([{ id: batch.unitId, name: batch.unitId }, { id: batch.alternativeUnitId, name: batch.alternativeUnitId }]);
    expect(wrapper.vm.maxMainQtyValue).toBe(10);
    expect(wrapper.vm.maxSelectedQtyValue).toBe(10);
    expect(wrapper.vm.unitMultiplier).toBe(1);

    await wrapper.setData({ formData: { unitId: batch.alternativeUnitId } });
    expect(wrapper.vm.isMainUnitSelected).toBe(false);
    expect(wrapper.vm.maxSelectedQtyValue).toBe(wrapper.vm.maxMainQtyValue * 3);
    expect(wrapper.vm.unitMultiplier).toBe(3);

    // saving
    const newData = { scrapQty: 6, scrapNotes: 'abc', scrapReasonId: 2 };
    wrapper.setData({ formData: newData });
    expect(wrapper.vm.areValuesBeingOverwritten).toBe(false);
    wrapper.vm.saveScrap();
    expect(saveScrapMock).toHaveBeenCalledTimes(1);
    expect(saveScrapMock).toHaveBeenCalledWith(4, {
      scrapQty: 3,
      qtyType: 'delta',
      shiftId: 5,
      scrapNotes: newData.scrapNotes,
      scrapReasonId: newData.scrapReasonId,
      overwrite: true,
      scrapRanges: [{ startTimeISO: selectedSlice.sliceStartTmISO, endTimeISO: selectedSlice.sliceEndTmISO }],
      unitId: batch.alternativeUnitId,
    });
  });

  describe('view elements', () => {
    test('no reasons for station defined', async () => {
      const reasons = [];
      const wrapper = createWrapper({
        scrapReason: { shiftviewStationScrapReasons: reasons, scrapReasonsRealMap: new Map(reasons.map((el) => [el.id, el])) },
      });

      await flushPromises();

      expect(wrapper.find('#scrap-group-selector').exists()).toBe(false);
      expect(wrapper.find('#scrap-reason-selector').exists()).toBe(false);
      expect(wrapper.find('#most-used-reasons').exists()).toBe(false);
      expect(wrapper.find('#scrap-reason-search').exists()).toBe(false);
    });

    test('4 reasons in 1 group', async () => {
      const reasons = [{ id: 1, groupId: 1 }, { id: 2, groupId: 1 }, { id: 3, groupId: 1 }, { id: 3, groupId: 1 }];
      const wrapper = createWrapper({
        scrapReason: { shiftviewStationScrapReasons: reasons, scrapReasonsRealMap: new Map(reasons.map((el) => [el.id, el])) },
      });

      await flushPromises();

      expect(wrapper.find('#scrap-group-selector').exists()).toBe(false);
      expect(wrapper.find('#scrap-reason-selector').exists()).toBe(true);
      expect(wrapper.find('#most-used-reasons').exists()).toBe(false);
      expect(wrapper.find('#scrap-reason-search').exists()).toBe(false);
    });

    test('11 reasons in 1 group', async () => {
      const reasons = [
        { id: 1, groupId: 1 }, { id: 2, groupId: 1 }, { id: 3, groupId: 1 }, { id: 4, groupId: 1 }, { id: 5, groupId: 1 },
        { id: 6, groupId: 1 }, { id: 7, groupId: 1 }, { id: 8, groupId: 1 }, { id: 9, groupId: 1 }, { id: 10, groupId: 1 }, { id: 11, groupId: 1 },
      ];
      const wrapper = createWrapper({
        scrapReason: { shiftviewStationScrapReasons: reasons, scrapReasonsRealMap: new Map(reasons.map((el) => [el.id, el])) },
      });

      await flushPromises();

      expect(wrapper.find('#scrap-group-selector').exists()).toBe(false);
      expect(wrapper.find('#scrap-reason-selector').exists()).toBe(true);
      expect(wrapper.find('#most-used-reasons').exists()).toBe(false);
      expect(wrapper.find('#scrap-reason-search').exists()).toBe(true);
    });

    test('10 reasons in 2 groups', async () => {
      const reasons = [
        { id: 1, groupId: 1 }, { id: 2, groupId: 1 }, { id: 3, groupId: 1 }, { id: 4, groupId: 1 }, { id: 5, groupId: 1 },
        { id: 6, groupId: 2 }, { id: 7, groupId: 2 }, { id: 8, groupId: 2 }, { id: 9, groupId: 2 }, { id: 10, groupId: 2 },
      ];
      const wrapper = createWrapper({
        scrapReason: { shiftviewStationScrapReasons: reasons, scrapReasonsRealMap: new Map(reasons.map((el) => [el.id, el])) },
      });

      await flushPromises();

      expect(wrapper.find('#scrap-group-selector').exists()).toBe(true);
      expect(wrapper.find('#scrap-reason-selector').exists()).toBe(true);
      expect(wrapper.find('#most-used-reasons').exists()).toBe(true);
      expect(wrapper.find('#scrap-reason-search').exists()).toBe(true);
    });

    test('10 reasons in 2 groups and most used reasons is empty', async () => {
      statisticsApi.getTopScrapReasons = vi.fn().mockReturnValue([]);
      const reasons = [
        { id: 1, groupId: 1 }, { id: 2, groupId: 1 }, { id: 3, groupId: 1 }, { id: 4, groupId: 1 }, { id: 5, groupId: 1 },
        { id: 6, groupId: 2 }, { id: 7, groupId: 2 }, { id: 8, groupId: 2 }, { id: 9, groupId: 2 }, { id: 10, groupId: 2 },
      ];
      const wrapper = createWrapper({
        scrapReason: { shiftviewStationScrapReasons: reasons, scrapReasonsRealMap: new Map(reasons.map((el) => [el.id, el])) },
      });

      await flushPromises();

      expect(wrapper.find('#scrap-group-selector').exists()).toBe(true);
      expect(wrapper.find('#scrap-reason-selector').exists()).toBe(true);
      expect(wrapper.find('#most-used-reasons').exists()).toBe(false);
      expect(wrapper.find('#scrap-reason-search').exists()).toBe(true);
    });

    test('4 reasons in 2 groups', async () => {
      const reasons = [{ id: 1, groupId: 1 }, { id: 2, groupId: 1 }, { id: 3, groupId: 1 }, { id: 4, groupId: 2 }];
      const wrapper = createWrapper({
        scrapReason: { shiftviewStationScrapReasons: reasons, scrapReasonsRealMap: new Map(reasons.map((el) => [el.id, el])) },
      });

      await flushPromises();

      expect(wrapper.find('#scrap-group-selector').exists()).toBe(true);
      expect(wrapper.find('#scrap-reason-selector').exists()).toBe(true);
      expect(wrapper.find('#most-used-reasons').exists()).toBe(false);
      expect(wrapper.find('#scrap-reason-search').exists()).toBe(false);
    });
  });

  describe('scrap qty validation', () => {
    it('shows correct error if input is 0', async () => {
      const wrapper = createWrapper();

      await flushPromises();
      await wrapper.setData({ formData: { scrapQty: 0 } });

      expect(wrapper.vm.qtyRule).toBe('Quantity cannot be 0');
      expect(wrapper.find('#scrap-qty-input').attributes('rules')).toBe('Quantity cannot be 0');
    });

    it('shows correct error if input is bigger than maxSelectedQtyValue and selection is done with brackets', async () => {
      const slice = defaultTimeline[8];
      const wrapper = createWrapper({
        shiftviewSelection: { bracketSelectedSlices: [slice], firstSelectedSlice: slice },
      }, {
        computed: {
          ...EditScrapDialog.computed,
          maxSelectedQtyValue() {
            return 10;
          },
        },
      });

      await flushPromises();
      await wrapper.setData({ formData: { scrapQty: 12 } });

      expect(wrapper.vm.qtyRule).toBe('Maximum quantity: {value} (use brackets to select more signals)');
      expect(wrapper.find('#scrap-qty-input').attributes('rules')).toBe('Maximum quantity: {value} (use brackets to select more signals)');
    });

    it('shows correct error if input is bigger than maxSelectedQtyValue and is adding from overview modal', async () => {
      const wrapper = createWrapper({}, {
        computed: {
          ...EditScrapDialog.computed,
          maxSelectedQtyValue() {
            return 10;
          },
          isAddFromOverview() {
            return true;
          },
        },
      });

      await flushPromises();
      await wrapper.setData({ formData: { scrapQty: 12 } });

      expect(wrapper.vm.qtyRule).toBe('Maximum quantity: {value}');
      expect(wrapper.find('#scrap-qty-input').attributes('rules')).toBe('Maximum quantity: {value}');
    });

    it('doesnt show error if input is valid (between 0 and maxSelectedQtyValue)', async () => {
      const wrapper = createWrapper({}, {
        computed: {
          ...EditScrapDialog.computed,
          maxSelectedQtyValue() {
            return 10;
          },
          isAddFromOverview() {
            return true;
          },
        },
      });

      await flushPromises();
      await wrapper.setData({ formData: { scrapQty: 9 } });

      expect(wrapper.vm.qtyRule).toBe(true);
      expect(wrapper.find('#scrap-qty-input').attributes('rules')).toBe('true');
    });
  });

  describe('onSave', () => {
    it('doesnt call saveScrap if areValuesBeingOverwritten is true, but opens confirm dialog', async () => {
      const wrapper = createWrapper({}, {
        computed: {
          ...EditScrapDialog.computed,
          areValuesBeingOverwritten() {
            return true;
          },
        },
      });

      await flushPromises();
      await wrapper.setData({ formData: { scrapReasonId: 1 } });
      wrapper.vm.$refs.form.validate = () => {
        wrapper.vm.valid = true;
      };

      await wrapper.vm.onSave();
      const confirmStore = useConfirmDialogStore(wrapper.pinia);
      expect(confirmStore.openConfirmDialog).toBeCalledTimes(1);
      const saveSpy = vi.spyOn(wrapper.vm, 'saveScrap');
      expect(saveSpy).toHaveBeenCalledTimes(0);
    });

    it('calls saveScrap if areValuesBeingOverwritten is false and doesnt open confirmDialog', async () => {
      const wrapper = createWrapper({}, {
        computed: {
          ...EditScrapDialog.computed,
          areValuesBeingOverwritten() {
            return false;
          },
        },
      });

      await flushPromises();
      await wrapper.setData({ formData: { scrapReasonId: 1 } });
      wrapper.vm.$refs.form.validate = () => {
        wrapper.vm.valid = true;
      };

      await wrapper.vm.onSave();
      const confirmStore = useConfirmDialogStore(wrapper.pinia);
      expect(confirmStore.openConfirmDialog).toBeCalledTimes(0);
      expect(saveScrapMock).toHaveBeenCalledTimes(1);
      const dialogStore = useGenericDialogStore(wrapper.pinia);
      expect(dialogStore.closeDialog).toHaveBeenCalledTimes(1);
    });
  });

  test('that unitPreference from localStorage is used to get unitId', async () => {
    localStorage.setItem('useAltUnitForScrap', 'true');
    const selectedSlice = defaultTimeline[4];
    createWrapper({
      shiftviewSelection: { bracketSelectedSlices: [selectedSlice], firstSelectedSlice: selectedSlice },
    });

    await flushPromises();

    expect(getUnitId).toHaveBeenCalledTimes(1);
    const batch = defaultBatches.get(selectedSlice.batchId);
    expect(getUnitId).toHaveBeenCalledWith(batch, true);
  });

  describe('isEditFromSignals', () => {
    it('returns true if all bracketSelectedSlices have scrap qty more than 0', () => {
      const wrapper = createWrapper({
        shiftviewSelection: {
          bracketSelectedSlices: [
            { scrapQty: 1, sliceStartTmISO: '2020-12-12T14:50:00.000Z', sliceEndTmISO: '2020-12-12T14:51:00.000Z' },
            { scrapQty: 2, sliceStartTmISO: '2020-12-12T14:52:00.000Z', sliceEndTmISO: '2020-12-12T14:53:00.000Z' },
          ],
        },
      });

      expect(wrapper.vm.isEditFromSignals).toBe(true);
    });

    it('returns false if some bracketSelectedSlices have scrap qty 0', () => {
      const wrapper = createWrapper({
        shiftviewSelection: {
          bracketSelectedSlices: [
            { scrapQty: 1, sliceStartTmISO: '2020-12-12T14:50:00.000Z', sliceEndTmISO: '2020-12-12T14:51:00.000Z' },
            { scrapQty: 0, sliceStartTmISO: '2020-12-12T14:52:00.000Z', sliceEndTmISO: '2020-12-12T14:53:00.000Z' },
          ],
        },
      });

      expect(wrapper.vm.isEditFromSignals).toBe(false);
    });
  });

  describe('isSameScrapReasonSelected', () => {
    it('returns false if bracketSelectedSlices array is empty and selectedScrapBatch is not present', () => {
      const wrapper = createWrapper();

      expect(wrapper.vm.bracketSelectedSlices.length).toBe(0);
      expect(wrapper.vm.dialogData.selectedScrapBatch).toBeUndefined();
      expect(wrapper.vm.isSameScrapReasonSelected).toBe(false);
    });

    it('returns false if bracketSelectedSlices array is not empty but slices have different scrapReasonId', () => {
      const wrapper = createWrapper({
        shiftviewSelection: {
          bracketSelectedSlices: [
            {
              scrapQty: 1, quantity: 1, sliceStartTmISO: '2020-12-12T14:50:00.000Z', sliceEndTmISO: '2020-12-12T14:51:00.000Z', scrapReasonId: 1, scrapNotes: 'note',
            },
            {
              scrapQty: 1, quantity: 1, sliceStartTmISO: '2020-12-12T14:52:00.000Z', sliceEndTmISO: '2020-12-12T14:53:00.000Z', scrapReasonId: 2, scrapNotes: 'note',
            },
          ],
        },
      });

      expect(wrapper.vm.isSameScrapReasonSelected).toBe(false);
    });

    it('returns true if the bracketSelectedSlices array is not empty and slices have the same scrapReasonId', async () => {
      const wrapper = createWrapper({
        shiftviewSelection: {
          bracketSelectedSlices: [
            {
              scrapQty: 1, quantity: 1, sliceStartTmISO: '2020-12-12T14:50:00.000Z', sliceEndTmISO: '2020-12-12T14:51:00.000Z', scrapReasonId: 1, scrapNotes: 'note',
            },
            {
              scrapQty: 1, quantity: 1, sliceStartTmISO: '2020-12-12T14:52:00.000Z', sliceEndTmISO: '2020-12-12T14:53:00.000Z', scrapReasonId: 1, scrapNotes: 'note',
            },
          ],
        },
      });

      await flushPromises();

      expect(wrapper.vm.isSameScrapReasonSelected).toBe(true);
    });

    it('returns false if selectedScrapBatch is present and has different scrapReasonId than selected scrapReasonId', () => {
      const selectedScrapBatch = {
        scrapRanges: [
          { startTimeISO: '2020-12-12T13:45:00.000Z', endTimeISO: '2020-12-12T13:50:00.000Z' },
          { startTimeISO: '2020-12-12T14:05:00.000Z', endTimeISO: '2020-12-12T14:50:00.000Z' },
          { startTimeISO: '2020-12-12T15:35:00.000Z', endTimeISO: '2020-12-12T15:37:00.000Z' },
        ],
        scrapReasonId: 1,
        batchId: 2,
        scrapQty: 0,
        productName: 'test product',
        productSku: 'test sku',
      };
      const wrapper = createWrapper({
        genericDialog: { dialogData: { selectedScrapBatch }, previousState: {}, allowFullscreen: true },
      });

      wrapper.vm.formData.scrapReasonId = 2;
      expect(wrapper.vm.isSameScrapReasonSelected).toBe(false);
    });

    it('returns true if selectedScrapBatch is present and has the same scrapReasonId as the selected scrapReasonId', async () => {
      const selectedScrapBatch = {
        scrapRanges: [
          { startTimeISO: '2020-12-12T13:45:00.000Z', endTimeISO: '2020-12-12T13:50:00.000Z' },
          { startTimeISO: '2020-12-12T14:05:00.000Z', endTimeISO: '2020-12-12T14:50:00.000Z' },
          { startTimeISO: '2020-12-12T15:35:00.000Z', endTimeISO: '2020-12-12T15:37:00.000Z' },
        ],
        scrapReasonId: 1,
        batchId: 2,
        scrapQty: 0,
        productName: 'test product',
        productSku: 'test sku',
      };
      const wrapper = createWrapper({
        genericDialog: { dialogData: { selectedScrapBatch }, previousState: {}, allowFullscreen: true },
      });

      await flushPromises();

      expect(wrapper.vm.isSameScrapReasonSelected).toBe(true);
    });
  });

  describe('isSaveBtnDisabled', () => {
    it('returns true if saveLoading is true', () => {
      const wrapper = createWrapper();
      wrapper.vm.saveLoading = true;
      expect(wrapper.vm.isSaveBtnDisabled).toBe(true);
    });

    it('returns true if formData.scrapQty is not set', () => {
      const wrapper = createWrapper();
      wrapper.vm.formData.scrapQty = null;
      expect(wrapper.vm.isSaveBtnDisabled).toBe(true);
    });

    it('returns true if shiftviewStationScrapReasons length is more than 0 and formData.scrapReasonId is not set', async () => {
      const wrapper = createWrapper({
        scrapReason: { shiftviewStationScrapReasons: [{ id: 1 }] },
      });

      await flushPromises();
      wrapper.vm.formData.scrapReasonId = null;
      expect(wrapper.vm.isSaveBtnDisabled).toBe(true);
    });

    it('returns false if formData.scrapReasonId is not equal to initial value', async () => {
      const wrapper = createWrapper({
        shiftviewSelection: {
          bracketSelectedSlices: [
            {
              scrapQty: 1, sliceStartTmISO: '2020-12-12T14:50:00.000Z', sliceEndTmISO: '2020-12-12T14:51:00.000Z', scrapReasonId: 1, scrapNotes: 'note',
            },
          ],
        },
      });

      await flushPromises();
      wrapper.vm.formData.scrapReasonId = 2;
      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });

    it('returns false if formData.scrapQty is not equal to initial value', async () => {
      const wrapper = createWrapper({
        shiftviewSelection: {
          bracketSelectedSlices: [
            {
              scrapQty: 1, sliceStartTmISO: '2020-12-12T14:50:00.000Z', sliceEndTmISO: '2020-12-12T14:51:00.000Z', scrapReasonId: 1, scrapNotes: 'note',
            },
          ],
        },
      });

      await flushPromises();
      wrapper.vm.formData.scrapQty = 2;
      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });

    it('returns false if formData.scrapNotes is not equal to initial value', async () => {
      const wrapper = createWrapper({
        shiftviewSelection: {
          bracketSelectedSlices: [
            {
              scrapQty: 1, sliceStartTmISO: '2020-12-12T14:50:00.000Z', sliceEndTmISO: '2020-12-12T14:51:00.000Z', scrapReasonId: 1, scrapNotes: 'note',
            },
          ],
        },
      });

      await flushPromises();
      wrapper.vm.formData.scrapNotes = 'new note';
      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });

    it('returns false if formData.unitId is not equal to initial value', async () => {
      getUnitId.mockReturnValue('pcs');
      const wrapper = createWrapper({
        shiftviewSelection: {
          bracketSelectedSlices: [
            {
              scrapQty: 1, sliceStartTmISO: '2020-12-12T14:50:00.000Z', sliceEndTmISO: '2020-12-12T14:51:00.000Z', scrapReasonId: 1, scrapNotes: 'note',
            },
          ],
        },
      });

      await flushPromises();
      wrapper.vm.formData.unitId = 'kg';
      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });

    it('returns false if is scrap edit with multiple slices, that do not have same scrapReasonId', async () => {
      getUnitId.mockReturnValue('pcs');
      const wrapper = createWrapper({
        station: { lineviewStation: { id: 4, factoryId: 2, zoneId: 'UTC', defaultScrapReasonId: 1 } },
        shiftviewSelection: {
          bracketSelectedSlices: [
            {
              scrapQty: 1, quantity: 1, sliceStartTmISO: '2020-12-12T14:50:00.000Z', sliceEndTmISO: '2020-12-12T14:51:00.000Z', scrapReasonId: 1, scrapNotes: 'note',
            },
            {
              scrapQty: 1, quantity: 1, sliceStartTmISO: '2020-12-12T14:52:00.000Z', sliceEndTmISO: '2020-12-12T14:53:00.000Z', scrapReasonId: 2, scrapNotes: 'note',
            },
          ],
          firstSelectedSlice: {
            scrapQty: 1, sliceStartTmISO: '2020-12-12T14:50:00.000Z', sliceEndTmISO: '2020-12-12T14:51:00.000Z', batchId: 1,
          },
        },
      });

      await flushPromises();
      expect(wrapper.vm.formData.scrapReasonId).toBe(1); // default scrap reason id
      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });

    it('returns true if is scrap edit and scrapReasonId, scrapQty, scrapNotes and unitId are equal to initial values', async () => {
      getUnitId.mockReturnValue('pcs');
      const wrapper = createWrapper({
        shiftviewSelection: {
          bracketSelectedSlices: [
            {
              scrapQty: 1, sliceStartTmISO: '2020-12-12T14:50:00.000Z', sliceEndTmISO: '2020-12-12T14:51:00.000Z', scrapReasonId: 1, scrapNotes: 'note',
            },
          ],
        },
      });

      await flushPromises();
      expect(wrapper.vm.formData.scrapReasonId).toBe(1);
      expect(wrapper.vm.formData.scrapQty).toBe(1);
      expect(wrapper.vm.formData.scrapNotes).toBe('note');
      expect(wrapper.vm.formData.unitId).toBe('pcs');
      expect(wrapper.vm.isSaveBtnDisabled).toBe(true);
    });

    it('returns true if is scrap edit with multiple slices, that have same scrapReasonId, scrapQty, scrapNotes and unitId', async () => {
      getUnitId.mockReturnValue('pcs');
      const wrapper = createWrapper({
        shiftviewSelection: {
          bracketSelectedSlices: [
            {
              scrapQty: 1, quantity: 1, sliceStartTmISO: '2020-12-12T14:50:00.000Z', sliceEndTmISO: '2020-12-12T14:51:00.000Z', scrapReasonId: 2, scrapNotes: 'note',
            },
            {
              scrapQty: 1, quantity: 1, sliceStartTmISO: '2020-12-12T14:52:00.000Z', sliceEndTmISO: '2020-12-12T14:53:00.000Z', scrapReasonId: 2, scrapNotes: 'note',
            },
          ],
          firstSelectedSlice: {
            scrapQty: 1, sliceStartTmISO: '2020-12-12T14:50:00.000Z', sliceEndTmISO: '2020-12-12T14:51:00.000Z', batchId: 1,
          },
        },
      });

      await flushPromises();
      expect(wrapper.vm.formData.scrapReasonId).toBe(2);
      expect(wrapper.vm.formData.scrapQty).toBe(2);
      expect(wrapper.vm.formData.scrapNotes).toBe('note');
      expect(wrapper.vm.formData.unitId).toBe('pcs');
      expect(wrapper.vm.isSaveBtnDisabled).toBe(true);
    });
  });

  test('that initialUnitId returns unit id', () => {
    getUnitId.mockReturnValue('mainUnit');
    const wrapper = createWrapper();

    expect(wrapper.vm.initialUnitId).toBe('mainUnit');
  });
});

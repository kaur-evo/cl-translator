import { flushPromises, shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { toRaw } from 'vue';

import EditSignalDialog from './index.vue';

import {
  useGenericDialogStore,
  useDeviceStore,
  useShiftviewSelectionStore,
  useShiftviewTimelineStore,
  useStationStore,
  useProfileStore,
  useConfirmDialogStore,
  useGenericNotificationStore,
} from '@/stores/index';
import timelineApi from '@/api/timelineApi';

vi.mock('@/api/timelineApi');
const saveMock = vi.fn().mockReturnValue({ success: true });
timelineApi.addProductionSignal = (val, val2) => saveMock(toRaw(val), JSON.parse(JSON.stringify(val2)));
const deleteMock = vi.fn().mockReturnValue([{ success: true }]);
timelineApi.deleteProductionSignals = deleteMock;

const createWrapper = ({ storeOverrides = {} } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const genericDialogStore = useGenericDialogStore(pinia);
  genericDialogStore.allowFullscreen = storeOverrides.allowFullscreen ?? true;

  const deviceStore = useDeviceStore(pinia);
  deviceStore.showFullscreenDialogs = storeOverrides.showFullscreenDialogs ?? true;
  deviceStore.isMobileView = storeOverrides.isMobileView ?? false;

  const selectionStore = useShiftviewSelectionStore(pinia);
  selectionStore.bracketRange = storeOverrides.bracketRange ?? { selectedRange: ['2021-04-19T12:15:50.000Z', '2021-04-19T12:16:10.000Z'] };
  selectionStore.firstSelectedSlice = storeOverrides.firstSelectedSlice ?? {
    type: 'PRODUCT', sliceStartTmISO: '2021-04-19T12:15:00.000Z', sliceEndTmISO: '2021-04-19T12:16:00.000Z', quantity: 3, signalNotes: 'note 123',
  };
  selectionStore.shiftviewSelectionType = storeOverrides.shiftviewSelectionType ?? 'PRODUCT';

  const timelineStore = useShiftviewTimelineStore(pinia);
  timelineStore.batches = storeOverrides.batches ?? new Map([[1, {
    id: 1, startTimeISO: '2021-04-19T12:00:00.000Z', endTimeISO: '2021-04-19T13:00:00.000Z', productName: 'test product 1', productSku: 'sku 1', unitQty: 1, unitId: 'kg',
  }], [2, {
    id: 2, startTimeISO: '2021-04-19T13:00:00.000Z', endTimeISO: '2021-04-19T14:00:00.000Z', productName: 'test product 2', productSku: 'sku 2', unitQty: 2, unitId: 'tk',
  }]]);

  const stationStore = useStationStore(pinia);
  stationStore.lineviewStation = storeOverrides.lineviewStation ?? { id: 123, deleteSliceAllowed: false, zoneId: 'UTC' };

  const profileStore = useProfileStore(pinia);
  profileStore.shiftviewStationRoleAllows = storeOverrides.shiftviewStationRoleAllows ?? (() => false);

  const confirmDialogStore = useConfirmDialogStore(pinia);
  const notificationStore = useGenericNotificationStore(pinia);

  const stores = {
    genericDialogStore,
    deviceStore,
    selectionStore,
    timelineStore,
    stationStore,
    profileStore,
    confirmDialogStore,
    notificationStore,
  };


  const wrapper = shallowMount(EditSignalDialog, {
    global: { plugins: [pinia] },
  });

  return { wrapper, stores, pinia };
};

describe('EditSignalDialog', () => {
  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders correctly when slice has changeover', async () => {
    const { wrapper } = createWrapper({
      storeOverrides: {
        shiftviewStationRoleAllows: () => true,
        firstSelectedSlice: {
          type: 'PRODUCT', sliceStartTmISO: '2021-04-19T12:15:00.000Z', sliceEndTmISO: '2021-04-19T12:16:00.000Z', quantity: 3, signalNotes: 'note 123', isProductChange: true,
        },
      },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('view elements', () => {
    describe('snapshots', () => {
      it('renders correctly if station has timeModeActive', () => {
        const { wrapper } = createWrapper({
          storeOverrides: { lineviewStation: { id: 123, timeModeActive: true, zoneId: 'UTC' } },
        });

        expect(wrapper.element).toMatchSnapshot();
      });

      it('renders correctly if station doesn not have timeModeActive', () => {
        const { wrapper } = createWrapper({
          storeOverrides: { lineviewStation: { id: 123, timeModeActive: false, zoneId: 'UTC' } },
        });

        expect(wrapper.element).toMatchSnapshot();
      });
    });
    it('renders correctly when shiftviewStationRoleAllows allows deleting signals', () => {
      const { wrapper } = createWrapper({
        storeOverrides: { shiftviewStationRoleAllows: (perm) => perm === 'editSignal' },
      });

      expect(wrapper.element).toMatchSnapshot();
    });

    it('renders correctly when shiftviewStationRoleAllows forbids deleting signals, but delete is allowed for station', () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          lineviewStation: { id: 123, deleteSliceAllowed: true, zoneId: 'UTC' },
          shiftviewStationRoleAllows: () => false,
        },
      });

      expect(wrapper.element).toMatchSnapshot();
    });

    test('renders correctly when shiftviewStationRoleAllows forbids deleting signals and delete is not allowed for station', () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          lineviewStation: { id: 123, deleteSliceAllowed: false, zoneId: 'UTC' },
          shiftviewStationRoleAllows: () => false,
        },
      });

      expect(wrapper.find('#signal-product-input').attributes('disabled')).toBe('true');
      expect(wrapper.find('#signal-qty-input').attributes('disabled')).toBe('true');
      expect(wrapper.find('#signal-notes-input').attributes('disabled')).toBe(undefined);
      expect(wrapper.find('#delete-button').exists()).toBe(true);
      expect(wrapper.find('#delete-button').attributes('disabled')).toBe('true');
    });
  });

  describe('data and saving', () => {
    test('signal edit', async () => {
      const { wrapper } = createWrapper();

      expect(wrapper.vm.formData.signalQty).toBe(3);
      expect(wrapper.vm.formData.notes).toBe('note 123');
      expect(wrapper.vm.productName).toBe('test product 1 (sku 1)');
      expect(wrapper.vm.title).toBe('Production signal 12:16:00');
      wrapper.vm.$refs.form.validate = () => {
        wrapper.vm.valid = true;
      };

      await wrapper.setData({ formData: { notes: 'new note', signalQty: 2 } });
      await wrapper.vm.onSave();
      expect(saveMock).toHaveBeenCalledTimes(1);
      expect(saveMock).toHaveBeenCalledWith(123, [{
        notes: 'new note', signalQty: -1, eventTimeISO: '2021-04-19T12:16:00.000Z', unitId: 'kg',
      }]);
    });

    test('adding signal in the middle of a stoppage', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'STOPPAGE',
          bracketRange: {
            selectedRange: ['2021-04-19T12:05:00.000Z', '2021-04-19T12:10:00.000Z'],
          },
          firstSelectedSlice: {
            type: 'STOPPAGE',
            sliceStartTmISO: '2021-04-19T12:09:00.000Z',
            sliceEndTmISO: '2021-04-19T12:17:00.000Z',
          },
        },
      });

      expect(wrapper.vm.formData.signalQty).toBe(1);
      expect(wrapper.vm.formData.notes).toBe('');
      expect(wrapper.vm.productName).toBe('test product 1 (sku 1)');
      expect(wrapper.vm.title).toBe('Production signal 12:10:00');
      wrapper.vm.$refs.form.validate = () => {
        wrapper.vm.valid = true;
      };

      await wrapper.setData({ formData: { notes: 'note 765', signalQty: 5 } });
      await wrapper.vm.onSave();
      expect(saveMock).toHaveBeenCalledTimes(1);
      expect(saveMock).toHaveBeenCalledWith(123, [{
        notes: 'note 765', signalQty: 5, eventTimeISO: '2021-04-19T12:10:00.000Z', unitId: 'kg',
      }]);
    });

    test('adding signal at the end of a stoppage', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'STOPPAGE',
          bracketRange: {
            selectedRange: ['2021-04-19T13:05:00.000Z', '2021-04-19T13:20:00.000Z'],
          },
          firstSelectedSlice: {
            type: 'STOPPAGE',
            sliceStartTmISO: '2021-04-19T13:09:00.000Z',
            sliceEndTmISO: '2021-04-19T13:17:00.000Z',
          },
        },
      });

      expect(wrapper.vm.formData.signalQty).toBe(2);
      expect(wrapper.vm.formData.notes).toBe('');
      expect(wrapper.vm.productName).toBe('test product 2 (sku 2)');
      expect(wrapper.vm.title).toBe('Production signal 13:17:00');
      wrapper.vm.$refs.form.validate = () => {
        wrapper.vm.valid = true;
      };

      await wrapper.setData({ formData: { notes: '', signalQty: 1 } });
      await wrapper.vm.onSave();
      expect(saveMock).toHaveBeenCalledTimes(1);
      expect(saveMock).toHaveBeenCalledWith(123, [{
        notes: '', signalQty: 0.5, eventTimeISO: '2021-04-19T13:17:00.000Z', unitId: 'tk',
      }]);
    });

    test('adding signal to yellow', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'SLOW',
          bracketRange: {
            selectedRange: ['2021-04-19T13:05:00.000Z', '2021-04-19T13:20:00.000Z'],
          },
        },
      });

      expect(wrapper.vm.formData.signalQty).toBe(2);
      expect(wrapper.vm.formData.notes).toBe('');
      expect(wrapper.vm.productName).toBe('test product 2 (sku 2)');
      expect(wrapper.vm.title).toBe('Production signal 13:20:00');
      wrapper.vm.$refs.form.validate = () => {
        wrapper.vm.valid = true;
      };

      await wrapper.setData({ formData: { notes: 'note', signalQty: 2 } });
      await wrapper.vm.onSave();
      expect(saveMock).toHaveBeenCalledTimes(1);
      expect(saveMock).toHaveBeenCalledWith(123, [{
        notes: 'note', signalQty: 1, eventTimeISO: '2021-04-19T13:20:00.000Z', unitId: 'tk',
      }]);
    });

    test('deleting signal', () => {
      const { wrapper } = createWrapper();

      wrapper.vm.deleteSignal();
      expect(deleteMock).toHaveBeenCalledTimes(1);
      expect(deleteMock).toHaveBeenCalledWith(123, ['2021-04-19T12:16:00.000Z']);
    });
  });

  describe('qtyRule', () => {
    it('returns true if formData.signalQty is null', () => {
      const { wrapper } = createWrapper();

      wrapper.vm.formData.signalQty = null;
      expect(wrapper.vm.qtyRule).toBe(true);
    });

    it('returns true if formData.signalQty is bigger than 0', () => {
      const { wrapper } = createWrapper();

      wrapper.vm.formData.signalQty = 1;
      expect(wrapper.vm.qtyRule).toBe(true);
    });

    it('returns error message if formData.signalQty is 0', () => {
      const { wrapper } = createWrapper();

      wrapper.vm.formData.signalQty = 0;
      expect(wrapper.vm.qtyRule).toBe('Quantity cannot be 0');
    });
  });

  describe('isSaveBtnDisabled', () => {
    it('returns true if formData.signalQty is null', () => {
      const { wrapper } = createWrapper();

      wrapper.vm.formData.signalQty = null;
      expect(wrapper.vm.isSaveBtnDisabled).toBe(true);
    });

    it('returns true if formData.signalQty is 0', () => {
      const { wrapper } = createWrapper();

      wrapper.vm.formData.signalQty = 0;
      expect(wrapper.vm.isSaveBtnDisabled).toBe(true);
    });

    it('returns true if saveLoading is true', () => {
      const { wrapper } = createWrapper();

      wrapper.vm.saveLoading = true;
      expect(wrapper.vm.isSaveBtnDisabled).toBe(true);
    });

    it('returns false if formData.signalQty is not equal to initialSignalQty', () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'PRODUCT',
          firstSelectedSlice: {
            type: 'PRODUCT',
            sliceStartTmISO: '2021-04-19T12:15:00.000Z',
            sliceEndTmISO: '2021-04-19T12:16:00.000Z',
            quantity: 3,
            signalNotes: 'note 123',
          },
        },
      });

      wrapper.vm.formData.signalQty = 4;
      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });

    it('returns false if formData.notes is not equal to selected slice signalNotes', () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          firstSelectedSlice: {
            type: 'PRODUCT',
            sliceStartTmISO: '2021-04-19T12:15:00.000Z',
            sliceEndTmISO: '2021-04-19T12:16:00.000Z',
            quantity: 3,
            signalNotes: 'note 123',
          },
        },
      });

      wrapper.vm.formData.notes = 'new note';
      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });

    it('returns false if formData.unitId is not equal to initialUnitId', () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          firstSelectedSlice: {
            type: 'PRODUCT',
            sliceStartTmISO: '2021-04-19T12:15:00.000Z',
            sliceEndTmISO: '2021-04-19T12:16:00.000Z',
            quantity: 3,
            signalNotes: 'note 123',
            unitId: 'kg',
          },
        },
      });

      wrapper.vm.formData.unitId = 'box';
      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });

    it('returns false when adding a new signal', () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'STOPPAGE',
          batches: new Map([[1, {
            id: 1,
            startTimeISO: '2021-04-19T12:00:00.000Z',
            endTimeISO: '2021-04-19T13:00:00.000Z',
            productName: 'test product 1',
            productSku: 'sku 1',
            unitQty: 3,
            unitId: 'kg',
          }]]),
          firstSelectedSlice: {
            type: 'STOPPAGE',
            sliceStartTmISO: '2021-04-19T12:15:00.000Z',
            sliceEndTmISO: '2021-04-19T12:16:00.000Z',
          },
        },
      });

      expect(wrapper.vm.isAddNew).toBe(true);
      expect(wrapper.vm.formData.signalQty).toBe(3);
      expect(wrapper.vm.formData.notes).toBe('');
      expect(wrapper.vm.formData.unitId).toBe('kg');
      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });

    it('returns true if it is signal edit and signalQty, notes and unitId are equal to initial values', () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'PRODUCT',
          firstSelectedSlice: {
            type: 'PRODUCT',
            sliceStartTmISO: '2021-04-19T12:15:00.000Z',
            sliceEndTmISO: '2021-04-19T12:16:00.000Z',
            quantity: 3,
            signalNotes: 'note 123',
            unitId: 'kg',
          },
        },
      });

      expect(wrapper.vm.isAddNew).toBe(false);
      expect(wrapper.vm.formData.signalQty).toBe(3);
      expect(wrapper.vm.formData.notes).toBe('note 123');
      expect(wrapper.vm.formData.unitId).toBe('kg');
      expect(wrapper.vm.isSaveBtnDisabled).toBe(true);
    });
  });

  describe('preferAltUnit', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('returns true if useAltUnitForSignal is set to true', () => {
      localStorage.setItem('useAltUnitForSignal', true);
      const { wrapper } = createWrapper();
      expect(wrapper.vm.preferAltUnit).toBe(true);
    });

    it('returns false if useAltUnitForSignal is set to false', () => {
      localStorage.setItem('useAltUnitForSignal', false);
      const { wrapper } = createWrapper();
      expect(wrapper.vm.preferAltUnit).toBe(false);
    });
  });

  describe('initialSignalQty', () => {
    beforeEach(() => {
      localStorage.clear();
    });
    it('calculates qty based on brackets duration if lineviewStation has timeModeActive', () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          lineviewStation: { id: 123, timeModeActive: true, zoneId: 'UTC' },
          bracketRange: { selectedRange: ['2021-04-19T12:15:50.000Z', '2021-04-19T12:16:20.000Z'] },
          shiftviewSelectionType: 'STOPPAGE',
          firstSelectedSlice: {
            type: 'STOPPAGE',
            sliceStartTmISO: '2021-04-19T12:15:00.000Z',
            sliceEndTmISO: '2021-04-19T12:16:00.000Z',
          },
        },
      });

      expect(wrapper.vm.initialSignalQty).toBe(0.5);
    });

    it('returns signal quantity from localStorage if shiftviewSelectionType is STOPPAGE', () => {
      localStorage.setItem('signalQtyValue', JSON.stringify({ 1: 5 }));
      const { wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'STOPPAGE',
          batches: new Map([[1, {
            id: 1,
            startTimeISO: '2021-04-19T12:00:00.000Z',
            endTimeISO: '2021-04-19T13:00:00.000Z',
            productName: 'test product 1',
            productSku: 'sku 1',
            unitQty: 1,
            unitId: 'kg',
          }]]),
          firstSelectedSlice: {
            type: 'STOPPAGE',
            sliceStartTmISO: '2021-04-19T12:15:00.000Z',
            sliceEndTmISO: '2021-04-19T12:16:00.000Z',
            quantity: 3,
            signalNotes: 'note 123',
          },
        },
      });

      expect(wrapper.vm.initialSignalQty).toBe(5);
    });

    it('returns signal quantity from the selected batch if shiftviewSelectionType is STOPPAGE and localStorage is empty', () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'STOPPAGE',
          batches: new Map([[1, {
            id: 1,
            startTimeISO: '2021-04-19T12:00:00.000Z',
            endTimeISO: '2021-04-19T13:00:00.000Z',
            productName: 'test product 1',
            productSku: 'sku 1',
            unitQty: 1,
            unitId: 'kg',
          }]]),
          firstSelectedSlice: {
            type: 'STOPPAGE',
            sliceStartTmISO: '2021-04-19T12:15:00.000Z',
            sliceEndTmISO: '2021-04-19T12:16:00.000Z',
            quantity: 3,
            signalNotes: 'note 123',
          },
        },
      });

      expect(wrapper.vm.initialSignalQty).toBe(1);
    });

    it('returns correct signal quantity from slice if shiftviewSelectionType is PRODUCT and preferAltUnit is false', () => {
      localStorage.setItem('useAltUnitForSignal', false);
      const { wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'PRODUCT',
          batches: new Map([[1, {
            id: 1,
            startTimeISO: '2021-04-19T12:00:00.000Z',
            endTimeISO: '2021-04-19T13:00:00.000Z',
            productName: 'test product 1',
            productSku: 'sku 1',
            unitConversion: 2,
            unitConversionType: 'PRIMARY_TO_ALT',
            unitQty: 1,
            unitId: 'kg',
            alternativeUnitId: 'box',
          }]]),
          firstSelectedSlice: {
            type: 'PRODUCT',
            sliceStartTmISO: '2021-04-19T12:15:00.000Z',
            sliceEndTmISO: '2021-04-19T12:16:00.000Z',
            quantity: 3,
            signalNotes: 'note 123',
          },
        },
      });

      expect(wrapper.vm.initialSignalQty).toBe(3);
    });

    it('returns signal quantity from slice multiplied by unit conversion if shiftviewSelectionType is PRODUCT, unitConversionType is ALT_TO_PRIMARY and preferAltUnit is true', () => {
      localStorage.setItem('useAltUnitForSignal', true);
      const { wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'PRODUCT',
          batches: new Map([[1, {
            id: 1,
            startTimeISO: '2021-04-19T12:00:00.000Z',
            endTimeISO: '2021-04-19T13:00:00.000Z',
            productName: 'test product 1',
            productSku: 'sku 1',
            unitConversion: 2,
            unitConversionType: 'ALT_TO_PRIMARY',
            unitQty: 1,
            unitId: 'kg',
            alternativeUnitId: 'box',
          }]]),
          firstSelectedSlice: {
            type: 'PRODUCT',
            sliceStartTmISO: '2021-04-19T12:15:00.000Z',
            sliceEndTmISO: '2021-04-19T12:16:00.000Z',
            quantity: 3,
            signalNotes: 'note 123',
          },
        },
      });

      expect(wrapper.vm.initialSignalQty).toBe(6);
    });

    it('returns signal quantity from slice divided by unit conversion if shiftviewSelectionType is PRODUCT, unitConversionType is PRIMARY_TO_ALT and preferAltUnit is true', () => {
      localStorage.setItem('useAltUnitForSignal', true);
      const { wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'PRODUCT',
          batches: new Map([[1, {
            id: 1,
            startTimeISO: '2021-04-19T12:00:00.000Z',
            endTimeISO: '2021-04-19T13:00:00.000Z',
            productName: 'test product 1',
            productSku: 'sku 1',
            unitConversion: 2,
            unitConversionType: 'PRIMARY_TO_ALT',
            unitQty: 1,
            unitId: 'kg',
            alternativeUnitId: 'box',
          }]]),
          firstSelectedSlice: {
            type: 'PRODUCT',
            sliceStartTmISO: '2021-04-19T12:15:00.000Z',
            sliceEndTmISO: '2021-04-19T12:16:00.000Z',
            quantity: 3,
            signalNotes: 'note 123',
          },
        },
      });

      expect(wrapper.vm.initialSignalQty).toBe(1.5);
    });
  });

  describe('initialUnitId', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('returns unitId from the batch if preferAltUnit is false', () => {
      localStorage.setItem('useAltUnitForSignal', false);
      const { wrapper } = createWrapper({
        storeOverrides: {
          batches: new Map([[1, {
            id: 1,
            startTimeISO: '2021-04-19T12:00:00.000Z',
            endTimeISO: '2021-04-19T13:00:00.000Z',
            productName: 'test product 1',
            productSku: 'sku 1',
            unitQty: 1,
            unitId: 'kg',
            alternativeUnitId: 'box',
          }]]),
          firstSelectedSlice: {
            type: 'PRODUCT',
            sliceStartTmISO: '2021-04-19T12:15:00.000Z',
            sliceEndTmISO: '2021-04-19T12:16:00.000Z',
            quantity: 3,
            signalNotes: 'note 123',
          },
        },
      });

      expect(wrapper.vm.initialUnitId).toBe('kg');
    });

    it('returns alternativeUnitId from the batch if preferAltUnit is true', () => {
      localStorage.setItem('useAltUnitForSignal', true);
      const { wrapper } = createWrapper({
        storeOverrides: {
          batches: new Map([[1, {
            id: 1,
            startTimeISO: '2021-04-19T12:00:00.000Z',
            endTimeISO: '2021-04-19T13:00:00.000Z',
            productName: 'test product 1',
            productSku: 'sku 1',
            unitQty: 1,
            unitId: 'kg',
            alternativeUnitId: 'box',
          }]]),
          firstSelectedSlice: {
            type: 'PRODUCT',
            sliceStartTmISO: '2021-04-19T12:15:00.000Z',
            sliceEndTmISO: '2021-04-19T12:16:00.000Z',
            quantity: 3,
            signalNotes: 'note 123',
          },
        },
      });

      expect(wrapper.vm.initialUnitId).toBe('box');
    });
  });
});

import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ScrapOverviewDialog from './index.vue';

import {
  useProfileStore, useDeviceStore, useScrapReasonStore, useShiftviewTimelineStore,
} from '@/stores/index';
import editScrapDialogConfig from '@/constants/shiftviewDialogConfigs/editScrapDialogConfig';

const defaultPiniaState = {
  genericDialog: { allowFullscreen: true },
  station: { lineviewStation: { id: 1 } },
  shift: { shift: {}, statisticsRaw: {} },
  shiftviewTimeline: { timeline: [], batches: [] },
  userPreferences: { viewSettings: { usePrimaryUnit: true } },
};

const createPinia = (overrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: { ...defaultPiniaState, ...overrides },
  });

  const profileStore = useProfileStore(pinia);
  profileStore.isReadOnly = overrides.profile?.isReadOnly ?? false;

  const deviceStore = useDeviceStore(pinia);
  deviceStore.showFullscreenDialogs = overrides.device?.showFullscreenDialogs ?? false;
  deviceStore.screenWidth = overrides.device?.screenWidth ?? 1600;
  deviceStore.isMobileView = overrides.device?.isMobileView ?? false;

  const scrapReasonStore = useScrapReasonStore(pinia);
  scrapReasonStore.scrapReasonsRealMap = overrides.scrapReason?.scrapReasonsRealMap ?? new Map([[0, { id: 0, name: 'uncommented' }], [1, { id: 1, name: 'test scrap reason 1' }], [2, { id: 2, name: 'test scrap reason 2' }]]);

  const shiftviewTimelineStore = useShiftviewTimelineStore(pinia);
  shiftviewTimelineStore.slicesByType = overrides.shiftviewTimeline?.slicesByType ?? {};

  return pinia;
};

const createWrapper = (overrides = {}, options = {}) => shallowMount(ScrapOverviewDialog, {
  global: { plugins: [createPinia(overrides)] },
  ...options,
});

describe('ScrapOverviewDialog', () => {
  test('that it renders correctly if there is no groupedScrap', async () => {
    const wrapper = createWrapper({}, {
      computed: {
        ...ScrapOverviewDialog.computed,
        groupedScrap() {
          return [];
        },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that addScrap calls openDialog with correct conf', async () => {
    const wrapper = createWrapper({}, {
      computed: {
        ...ScrapOverviewDialog.computed,
        groupedScrap() {
          return [];
        },
      },
    });
    const spy = vi.spyOn(wrapper.vm, 'openDialog');
    wrapper.vm.addScrap();
    expect(spy).toHaveBeenCalledWith(editScrapDialogConfig);
  });

  test('that editScrap calls openDialog with correct conf', async () => {
    const wrapper = createWrapper({}, {
      computed: {
        ...ScrapOverviewDialog.computed,
        groupedScrap() {
          return [];
        },
      },
    });
    const spy = vi.spyOn(wrapper.vm, 'openDialog');
    wrapper.vm.editScrap({ id: 'test scrap' }, 23);
    expect(spy).toHaveBeenCalledWith({
      ...editScrapDialogConfig,
      data: {
        selectedScrapBatch: { id: 'test scrap', batchId: 23 },
      },
    });
  });

  test('that canAddScrap is false if all timeline slices already have scrap', () => {
    const wrapper = createWrapper(
      { shiftviewTimeline: { timeline: [{ scrapQty: 1 }, { scrapQty: 2 }, { scrapQty: 1 }, { scrapQty: 1 }, { scrapQty: 2 }], batches: [] } },
      {
        computed: {
          ...ScrapOverviewDialog.computed,
          groupedScrap() {
            return [];
          },
        },
      },
    );
    expect(wrapper.vm.canAddScrap).toBe(false);
  });

  test('that canAddScrap is true if at least one timeline slices doesnt have scrap', () => {
    const wrapper = createWrapper(
      { shiftviewTimeline: { timeline: [{ scrapQty: 1 }, { scrapQty: 0 }, { scrapQty: 1 }, { scrapQty: 1 }, { scrapQty: 2 }], batches: [] } },
      {
        computed: {
          ...ScrapOverviewDialog.computed,
          groupedScrap() {
            return [];
          },
        },
      },
    );
    expect(wrapper.vm.canAddScrap).toBe(true);
  });

  it('renders correctly when alternative unit is used', () => {
    const batchesMap = new Map([
      [1, {
        id: 1, productName: 'product 1', productSku: '12-34-56', alternativeUnitId: 'altUnit', unitId: 'unit', unitConversionType: 'ALT_TO_PRIMARY', unitConversion: 12,
      }],
      [2, {
        id: 2, productName: 'product 2', unitId: 'pcs',
      }],
    ]);
    const wrapper = createWrapper(
      { userPreferences: { viewSettings: { usePrimaryUnit: false } } },
      {
        computed: {
          ...ScrapOverviewDialog.computed,
          groupedScrap() {
            return {
              1: {
                '1,': {
                  scrapNotes: '', scrapQty: 1, scrapRanges: [], scrapReasonId: 1,
                },
              },
              2: {
                '1,': {
                  scrapNotes: '', scrapQty: 1, scrapRanges: [], scrapReasonId: 1,
                },
              },
              3: {
                '0, note 2': {
                  scrapNotes: 'note 2', scrapQty: 10, scrapRanges: [], scrapReasonId: 0,
                },
                '2, note 44': {
                  scrapNotes: 'note 44', scrapQty: 10, scrapRanges: [], scrapReasonId: 2,
                },
              },
            };
          },
          scrapBatches() {
            return {
              1: { scrapQty: 1, qty: 12 },
              2: { scrapQty: 1, qty: 10 },
              3: { scrapQty: 20, qty: 22 },
            };
          },
          batchesWithScrap() {
            return Array.from(batchesMap.values());
          },
        },
      },
    );

    expect(wrapper.element).toMatchSnapshot();
  });
});

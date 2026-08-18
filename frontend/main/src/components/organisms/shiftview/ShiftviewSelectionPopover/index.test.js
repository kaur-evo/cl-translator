import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { format, addHours, subDays } from 'date-fns';

import ShiftviewSelectionPopover from './index.vue';

import {
  useShiftviewSelectionStore,
  useShiftviewTimelineStore,
  useCommentStore,
  usePerfCommentStore,
  useStationStore,
  useProfileStore,
  useFeatureStore,
  useChecklistTemplateStore,
  useGenericDialogStore,
  useDeviceStore,
  useUserPreferencesStore,
  useShiftStore,
} from '@/stores/index';
import timelineApi from '@/api/timelineApi';

vi.mock('@/api/timelineApi');
timelineApi.deleteProductionSignals = vi.fn();

const currentShift = { id: 1, endTime: format(addHours(new Date(), 2), "yyyy-MM-dd'T'HH:mm:ss") };
const oldShift = { id: 1, endTime: format(subDays(new Date(), 8), "yyyy-MM-dd'T'HH:mm:ss") };

const setupDefaultStores = (pinia, storeOverrides = {}) => {
  const selectionStore = useShiftviewSelectionStore(pinia);
  selectionStore.shiftviewSelectionType = storeOverrides.shiftviewSelectionType ?? '';
  selectionStore.bracketRange = storeOverrides.bracketRange ?? {};
  selectionStore.firstSelectedSlice = storeOverrides.firstSelectedSlice ?? {};
  selectionStore.sliceSelection = storeOverrides.sliceSelection ?? [];
  selectionStore.canMoveLeft = storeOverrides.canMoveLeft ?? true;
  selectionStore.canMoveRight = storeOverrides.canMoveRight ?? true;

  const timelineStore = useShiftviewTimelineStore(pinia);
  timelineStore.timeline = storeOverrides.timeline ?? [];
  timelineStore.batches = storeOverrides.batches ?? new Map([[1, {
    id: 1,
    productName: 'test product',
    productSku: 'sku-123',
    unitId: 'pcs',
    productId: 3,
    alternativeUnitId: 'tk',
    unitConversionType: 'PRIMARY_TO_ALT',
    unitConversion: 2,
  }]]);
  timelineStore.yellowRanges = storeOverrides.yellowRanges ?? [];

  const commentStore = useCommentStore(pinia);
  commentStore.commentsRealMap = storeOverrides.commentsRealMap ?? new Map([[0, { id: 0, name: 'Uncommented' }], [1, { id: 1, name: 'test downtime' }]]);

  const perfCommentStore = usePerfCommentStore(pinia);
  perfCommentStore.perfCommentsRealMap = storeOverrides.perfCommentsRealMap ?? new Map([[0, { id: 0, name: 'Uncommented' }], [1, { id: 1, name: 'test speedloss' }]]);

  const stationStore = useStationStore(pinia);
  stationStore.lineviewStation = storeOverrides.lineviewStation ?? { deleteSliceAllowed: true, zoneId: 'UTC' };

  const profileStore = useProfileStore(pinia);
  profileStore.shiftviewStationRoleAllows = storeOverrides.shiftviewStationRoleAllows ?? (() => true);

  const featureStore = useFeatureStore(pinia);
  featureStore.qualityYieldEnabled = storeOverrides.qualityYieldEnabled ?? false;

  const checklistTemplateStore = useChecklistTemplateStore(pinia);
  checklistTemplateStore.shiftviewStationManualTemplates = storeOverrides.shiftviewStationManualTemplates ?? [{ frequency: { productIds: [] } }];

  const genericDialogStore = useGenericDialogStore(pinia);
  genericDialogStore.isDialogOpened = storeOverrides.isDialogOpened ?? false;

  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = storeOverrides.isMobileView ?? false;

  const userPreferencesStore = useUserPreferencesStore(pinia);
  userPreferencesStore.viewSettings = storeOverrides.viewSettings ?? { usePrimaryUnit: true };

  const shiftStore = useShiftStore(pinia);
  shiftStore.shift = storeOverrides.shift ?? currentShift;

  return {
    selectionStore,
    timelineStore,
    commentStore,
    perfCommentStore,
    stationStore,
    profileStore,
    featureStore,
    checklistTemplateStore,
    genericDialogStore,
    deviceStore,
    userPreferencesStore,
    shiftStore,
  };
};

const createWrapper = ({ storeOverrides = {} } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });
  const stores = setupDefaultStores(pinia, storeOverrides);
  const wrapper = shallowMount(ShiftviewSelectionPopover, {
    global: { plugins: [pinia] },
  });
  return { wrapper, stores, pinia };
};

describe('ShiftviewSelectionPopover - circles selection', () => {
  describe('one circle with scrap selected as COMPANY_ADMIN', () => {
    const slice = {
      id: 1, type: 'PRODUCT', scrapQty: 2, scrapReasonId: 1, quantity: 10, sliceStartTmISO: '2020-02-02T12:00:00.000Z', sliceEndTmISO: '2020-02-02T12:02:00.000Z', batchId: 1,
    };
    let wrapper;

    beforeEach(() => {
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'PRODUCT',
          firstSelectedSlice: slice,
          sliceSelection: [slice],
        },
      }));
    });

    it('shows arrows', () => {
      expect(wrapper.vm.arrowsVisible).toBe(true);
    });
    it('has correct dotColor', () => {
      expect(wrapper.vm.dotColor).toBe('lw-orange');
    });
    it('has correct subtitle', () => {
      expect(wrapper.vm.subtitleTime).toBe('12:02:00');
      expect(wrapper.vm.subtitlePrimaryValue).toBe('8');
      expect(wrapper.vm.subtitleSecondaryValue).toBe('2pcs');
    });
    it('has correct subtitle if alternative unit is used', () => {
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'PRODUCT',
          firstSelectedSlice: slice,
          sliceSelection: [slice],
          viewSettings: { usePrimaryUnit: false },
        },
      }));
      expect(wrapper.vm.subtitleTime).toBe('12:02:00');
      expect(wrapper.vm.subtitlePrimaryValue).toBe('4');
      expect(wrapper.vm.subtitleSecondaryValue).toBe('1tk');
    });
    it('has correct title', () => {
      expect(wrapper.vm.title).toBe('test product (sku-123)');
    });
    it('has 5 items in menu - add changeover, edit scrap, edit signal, delete signal and start checklist', () => {
      const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(items.length).toBe(5);
      expect(items[0].text).toBe('Add changeover');
      expect(items[1].text).toBe('Edit scrap');
      expect(items[2].text).toBe('Edit signal');
      expect(items[3].text).toBe('Delete signal');
      expect(items[4].text).toBe('Start checklist');
    });
    it('has 4 items in menu - add changeover, edit scrap, edit signal and delete signal when shift is older than 7 days', () => {
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'PRODUCT',
          firstSelectedSlice: slice,
          sliceSelection: [slice],
          shift: oldShift,
        },
      }));

      const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(items.length).toBe(4);
      expect(items[0].text).toBe('Add changeover');
      expect(items[1].text).toBe('Edit scrap');
      expect(items[2].text).toBe('Edit signal');
      expect(items[3].text).toBe('Delete signal');
    });
  });

  describe('one circle selected as COMPANY_ADMIN', () => {
    const slice = {
      id: 1, type: 'PRODUCT', scrapQty: 0, scrapReasonId: 0, quantity: 10, sliceStartTmISO: '2020-02-02T12:00:00.000Z', sliceEndTmISO: '2020-02-02T12:02:00.000Z', batchId: 1,
    };
    let wrapper;

    beforeEach(() => {
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'PRODUCT',
          firstSelectedSlice: slice,
          sliceSelection: [slice],
        },
      }));
    });

    it('shows arrows', () => {
      expect(wrapper.vm.arrowsVisible).toBe(true);
    });
    it('has correct dotColor', () => {
      expect(wrapper.vm.dotColor).toBe('quaternary-dark-2');
    });
    it('has correct subtitle', () => {
      expect(wrapper.vm.subtitleTime).toBe('12:02:00');
      expect(wrapper.vm.subtitlePrimaryValue).toBe('10 pcs');
      expect(wrapper.vm.subtitleSecondaryValue).toBe('');
    });
    it('has correct subtitle if alternative unit is used', () => {
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'PRODUCT',
          firstSelectedSlice: slice,
          sliceSelection: [slice],
          viewSettings: { usePrimaryUnit: false },
        },
      }));
      expect(wrapper.vm.subtitleTime).toBe('12:02:00');
      expect(wrapper.vm.subtitlePrimaryValue).toBe('5 tk');
      expect(wrapper.vm.subtitleSecondaryValue).toBe('');
    });
    it('has correct title', () => {
      expect(wrapper.vm.title).toBe('test product (sku-123)');
    });
    it('has 5 items in menu - add changeover, add scrap, edit signal, delete signal and start checklist', () => {
      const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(items.length).toBe(5);
      expect(items[0].text).toBe('Add changeover');
      expect(items[1].text).toBe('Add scrap');
      expect(items[2].text).toBe('Edit signal');
      expect(items[3].text).toBe('Delete signal');
      expect(items[4].text).toBe('Start checklist');
    });
    it('has 4 items in menu - add changeover, add scrap, edit signal and delete signal when shift is older than 7 days', () => {
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'PRODUCT',
          firstSelectedSlice: slice,
          sliceSelection: [slice],
          shift: oldShift,
        },
      }));

      const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(items.length).toBe(4);
      expect(items[0].text).toBe('Add changeover');
      expect(items[1].text).toBe('Add scrap');
      expect(items[2].text).toBe('Edit signal');
      expect(items[3].text).toBe('Delete signal');
    });
  });

  test('menu items for one circle with changeover selected as COMPANY_ADMIN', () => {
    const slice = {
      id: 1, type: 'PRODUCT', scrapQty: 0, scrapReasonId: 0, quantity: 10, sliceStartTmISO: '2020-02-02T12:00:00.000Z', sliceEndTmISO: '2020-02-02T12:02:00.000Z', batchId: 1, isProductChange: true,
    };
    const { wrapper } = createWrapper({
      storeOverrides: {
        shiftviewSelectionType: 'PRODUCT',
        firstSelectedSlice: slice,
        sliceSelection: [slice],
      },
    });
    const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
    expect(items.length).toBe(4);
    expect(items[0].text).toBe('Edit changeover');
    expect(items[1].text).toBe('Add scrap');
    expect(items[2].text).toBe('Edit signal');
    expect(items[3].text).toBe('Start checklist');
  });

  describe('multiple circles selected with scrap as COMPANY_ADMIN', () => {
    const slice1 = {
      id: 1, type: 'PRODUCT', scrapQty: 2, scrapReasonId: 1, quantity: 10, sliceStartTmISO: '2020-02-02T14:00:00.000Z', sliceEndTmISO: '2020-02-02T14:02:00.000Z', batchId: 1,
    };
    const slice2 = {
      id: 2, type: 'PRODUCT', scrapQty: 0, scrapReasonId: 0, quantity: 1, sliceStartTmISO: '2020-02-02T14:02:00.000Z', sliceEndTmISO: '2020-02-02T14:03:00.000Z', batchId: 1,
    };
    let wrapper;

    beforeEach(() => {
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'PRODUCT',
          firstSelectedSlice: slice1,
          sliceSelection: [slice1, slice2],
        },
      }));
    });

    it('doesnt show arrows', () => {
      expect(wrapper.vm.arrowsVisible).toBe(false);
    });
    it('has correct dotColor', () => {
      expect(wrapper.vm.dotColor).toBe('lw-orange');
    });
    it('has correct subtitle', () => {
      expect(wrapper.vm.subtitleTime).toBe('14:02:00 - 14:03:00');
      expect(wrapper.vm.subtitlePrimaryValue).toBe('9');
      expect(wrapper.vm.subtitleSecondaryValue).toBe('2pcs');
    });
    it('has correct subtitle if alternative unit is used', () => {
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'PRODUCT',
          firstSelectedSlice: slice1,
          sliceSelection: [slice1, slice2],
          viewSettings: { usePrimaryUnit: false },
        },
      }));
      expect(wrapper.vm.subtitleTime).toBe('14:02:00 - 14:03:00');
      expect(wrapper.vm.subtitlePrimaryValue).toBe('4,5');
      expect(wrapper.vm.subtitleSecondaryValue).toBe('1tk');
    });
    it('has correct title', () => {
      expect(wrapper.vm.title).toBe('test product (sku-123)');
    });
    it('has 2 items visible in menu - add scrap and delete signals', () => {
      const visibleItems = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(visibleItems.length).toBe(2);
      expect(visibleItems[0].text).toBe('Add scrap');
      expect(visibleItems[1].text).toBe('Delete signals');
    });
  });

  describe('multiple circles selected as COMPANY_ADMIN', () => {
    const slice1 = {
      id: 1, type: 'PRODUCT', scrapQty: 0, scrapReasonId: 0, quantity: 10, sliceStartTmISO: '2020-02-02T12:00:00.000Z', sliceEndTmISO: '2020-02-02T12:02:00.000Z', batchId: 1,
    };
    const slice2 = {
      id: 2, type: 'PRODUCT', scrapQty: 0, scrapReasonId: 0, quantity: 1, sliceStartTmISO: '2020-02-02T12:02:00.000Z', sliceEndTmISO: '2020-02-02T12:03:00.000Z', batchId: 1,
    };
    let wrapper;

    beforeEach(() => {
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'PRODUCT',
          firstSelectedSlice: slice1,
          sliceSelection: [slice1, slice2],
        },
      }));
    });

    it('doesnt show arrows', () => {
      expect(wrapper.vm.arrowsVisible).toBe(false);
    });
    it('has correct dotColor', () => {
      expect(wrapper.vm.dotColor).toBe('quaternary-dark-2');
    });
    it('has correct subtitle', () => {
      expect(wrapper.vm.subtitleTime).toBe('12:02:00 - 12:03:00');
      expect(wrapper.vm.subtitlePrimaryValue).toBe('11 pcs');
      expect(wrapper.vm.subtitleSecondaryValue).toBe('');
    });
    it('has correct subtitle if alternative unit is used', () => {
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'PRODUCT',
          firstSelectedSlice: slice1,
          sliceSelection: [slice1, slice2],
          viewSettings: { usePrimaryUnit: false },
        },
      }));
      expect(wrapper.vm.subtitleTime).toBe('12:02:00 - 12:03:00');
      expect(wrapper.vm.subtitlePrimaryValue).toBe('5,5 tk');
      expect(wrapper.vm.subtitleSecondaryValue).toBe('');
    });
    it('has correct title', () => {
      expect(wrapper.vm.title).toBe('test product (sku-123)');
    });
    it('has 2 items visible in menu - add scrap and delete signals', () => {
      const visibleItems = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(visibleItems.length).toBe(2);
      expect(visibleItems[0].text).toBe('Add scrap');
      expect(visibleItems[1].text).toBe('Delete signals');
    });
  });

  describe('one cirlce selected without delete permission, delete allowed for station', () => {
    const slice = {
      id: 1, type: 'PRODUCT', scrapQty: 0, scrapReasonId: 0, quantity: 10, sliceStartTmISO: '2020-02-02T12:00:00.000Z', sliceEndTmISO: '2020-02-02T12:02:00.000Z', batchId: 1,
    };
    let wrapper;

    beforeEach(() => {
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'PRODUCT',
          firstSelectedSlice: slice,
          sliceSelection: [slice],
          shiftviewStationRoleAllows: () => false,
        },
      }));
    });

    it('has 5 items in menu - add changeover, add scrap, edit signal, delete signal and start checklist', () => {
      const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(items.length).toBe(5);
      expect(items[0].text).toBe('Add changeover');
      expect(items[1].text).toBe('Add scrap');
      expect(items[2].text).toBe('Edit signal');
      expect(items[3].text).toBe('Delete signal');
      expect(items[4].text).toBe('Start checklist');
    });
    it('has 4 items in menu - add changeover, add scrap, edit signal and delete signal when shift is older than 7 days', () => {
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'PRODUCT',
          firstSelectedSlice: slice,
          sliceSelection: [slice],
          shiftviewStationRoleAllows: () => false,
          shift: oldShift,
        },
      }));

      const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(items.length).toBe(4);
      expect(items[0].text).toBe('Add changeover');
      expect(items[1].text).toBe('Add scrap');
      expect(items[2].text).toBe('Edit signal');
      expect(items[3].text).toBe('Delete signal');
    });
  });

  describe('one circle selected without edit permission', () => {
    const slice = {
      id: 1, type: 'PRODUCT', scrapQty: 2, scrapReasonId: 1, quantity: 10, sliceStartTmISO: '2020-02-02T12:00:00.000Z', sliceEndTmISO: '2020-02-02T12:02:00.000Z', batchId: 1,
    };
    let wrapper;

    beforeEach(() => {
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'PRODUCT',
          firstSelectedSlice: slice,
          sliceSelection: [slice],
          shiftviewStationRoleAllows: () => false,
        },
      }));
    });

    it('has 5 items in menu - add changeover, edit scrap, edit signal, delete signal and start checklist', () => {
      const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(items.length).toBe(5);
      expect(items[0].text).toBe('Add changeover');
      expect(items[1].text).toBe('Edit scrap');
      expect(items[2].text).toBe('Edit signal');
      expect(items[3].text).toBe('Delete signal');
      expect(items[4].text).toBe('Start checklist');
    });
    it('has 4 items in menu - add changeover, edit scrap, edit signal and delete signal when shift is older than 7 days', () => {
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'PRODUCT',
          firstSelectedSlice: slice,
          sliceSelection: [slice],
          shiftviewStationRoleAllows: () => false,
          shift: oldShift,
        },
      }));

      const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(items.length).toBe(4);
      expect(items[0].text).toBe('Add changeover');
      expect(items[1].text).toBe('Edit scrap');
      expect(items[2].text).toBe('Edit signal');
      expect(items[3].text).toBe('Delete signal');
    });
  });

  describe('one cirlce selected without edit permission, deleting not allowed for station', () => {
    const slice = {
      id: 1, type: 'PRODUCT', scrapQty: 0, scrapReasonId: 0, quantity: 10, sliceStartTmISO: '2020-02-02T12:00:00.000Z', sliceEndTmISO: '2020-02-02T12:02:00.000Z', batchId: 1,
    };
    let wrapper;

    beforeEach(() => {
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'PRODUCT',
          firstSelectedSlice: slice,
          sliceSelection: [slice],
          shiftviewStationRoleAllows: () => false,
          lineviewStation: { deleteSliceAllowed: false, zoneId: 'UTC' },
        },
      }));
    });

    it('has 4 items in menu - add changeover, add scrap, edit signal and start checklist', () => {
      const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(items.length).toBe(4);
      expect(items[0].text).toBe('Add changeover');
      expect(items[1].text).toBe('Add scrap');
      expect(items[2].text).toBe('Edit signal');
      expect(items[3].text).toBe('Start checklist');
    });
    it('has 3 items in menu - add changeover, add scrap and edit signal when shift is older than 7 days', () => {
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'PRODUCT',
          firstSelectedSlice: slice,
          sliceSelection: [slice],
          shiftviewStationRoleAllows: () => false,
          lineviewStation: { deleteSliceAllowed: false, zoneId: 'UTC' },
          shift: oldShift,
        },
      }));

      const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(items.length).toBe(3);
      expect(items[0].text).toBe('Add changeover');
      expect(items[1].text).toBe('Add scrap');
      expect(items[2].text).toBe('Edit signal');
    });
  });

  describe('multiple cirlces selected without edit persmission, deleting allowed for station', () => {
    const slice1 = {
      id: 1, type: 'PRODUCT', scrapQty: 2, scrapReasonId: 1, quantity: 10, sliceStartTmISO: '2020-02-02T14:00:00.000Z', sliceEndTmISO: '2020-02-02T14:02:00.000Z', batchId: 1,
    };
    const slice2 = {
      id: 2, type: 'PRODUCT', scrapQty: 0, scrapReasonId: 0, quantity: 1, sliceStartTmISO: '2020-02-02T14:02:00.000Z', sliceEndTmISO: '2020-02-02T14:03:00.000Z', batchId: 1,
    };

    it('has 2 items in menu - add scrap and delete signals', () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'PRODUCT',
          firstSelectedSlice: slice1,
          sliceSelection: [slice1, slice2],
          shiftviewStationRoleAllows: () => false,
        },
      });
      const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(items.length).toBe(2);
      expect(items[0].text).toBe('Add scrap');
      expect(items[1].text).toBe('Delete signals');
    });
  });

  describe('multiple cirlces selected without edit permission, deleting not allowed for station', () => {
    const slice1 = {
      id: 1, type: 'PRODUCT', scrapQty: 2, scrapReasonId: 1, quantity: 10, sliceStartTmISO: '2020-02-02T14:00:00.000Z', sliceEndTmISO: '2020-02-02T14:02:00.000Z', batchId: 1,
    };
    const slice2 = {
      id: 2, type: 'PRODUCT', scrapQty: 0, scrapReasonId: 0, quantity: 1, sliceStartTmISO: '2020-02-02T14:02:00.000Z', sliceEndTmISO: '2020-02-02T14:03:00.000Z', batchId: 1,
    };

    it('has 1 item in menu - add scrap', () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'PRODUCT',
          firstSelectedSlice: slice1,
          sliceSelection: [slice1, slice2],
          shiftviewStationRoleAllows: () => false,
          lineviewStation: { deleteSliceAllowed: false, zoneId: 'UTC' },
        },
      });
      const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(items.length).toBe(1);
      expect(items[0].text).toBe('Add scrap');
    });
  });

  describe('empty selection', () => {
    let wrapper;

    beforeEach(() => {
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'PRODUCT',
          sliceSelection: [],
          bracketRange: { selectedRange: ['2020-02-02T12:00:00.000Z', '2020-02-02T14:00:00.000Z'] },
        },
      }));
    });

    it('doesnt show arrows', () => {
      expect(wrapper.vm.arrowsVisible).toBe(false);
    });
    it('has correct dotColor', () => {
      expect(wrapper.vm.dotColor).toBe('quaternary-dark-2');
    });
    it('has correct subtitle', () => {
      expect(wrapper.vm.subtitleTime).toBe('12:00 - 14:00');
      expect(wrapper.vm.subtitlePrimaryValue).toBe('');
      expect(wrapper.vm.subtitleSecondaryValue).toBe('');
    });
    it('has correct title', () => {
      expect(wrapper.vm.title).toBe('This area does not include selected event ({variable})');
    });
    it('has 3 items in menu - changeover, scrap, signal delete and popover is disabled', () => {
      const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(items.length).toBe(3);
      expect(items[0].text).toBe('Add changeover');
      expect(items[1].text).toBe('Edit scrap');
      expect(items[2].text).toBe('Delete signal');
      expect(wrapper.vm.disabled).toBe(true);
    });
  });
});

describe('ShiftviewSelectionPopover - stoppages selection', () => {
  describe('one stoppage selected as COMPANY_ADMIN', () => {
    const slice = {
      id: 1, type: 'STOPPAGE', sliceStartTmISO: '2020-02-02T12:00:00.000Z', sliceEndTmISO: '2020-02-02T12:22:00.000Z', batchId: 1, commentId: 1,
    };
    let wrapper;

    beforeEach(() => {
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'STOPPAGE',
          firstSelectedSlice: slice,
          sliceSelection: [slice],
          bracketRange: { selectedRange: ['2020-02-02T12:10:00.000Z', '2020-02-02T12:20:00.000Z'] },
        },
      }));
    });

    it('shows arrows', () => {
      expect(wrapper.vm.arrowsVisible).toBe(true);
    });
    it('has correct dotColor', () => {
      expect(wrapper.vm.dotColor).toBe('lw-red');
    });
    it('has correct subtitle', () => {
      expect(wrapper.vm.subtitleTime).toBe('12:10 - 12:20');
      expect(wrapper.vm.subtitlePrimaryValue).toBe('10m');
      expect(wrapper.vm.subtitleSecondaryValue).toBe('');
    });
    it('has correct title', () => {
      expect(wrapper.vm.title).toBe('test downtime');
    });
    it('has 4 items in menu - edit reason, add changeover, add signal and start checklist', () => {
      const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(items.length).toBe(4);
      expect(items[0].text).toBe('Edit reason');
      expect(items[1].text).toBe('Add changeover');
      expect(items[2].text).toBe('Add signal');
      expect(items[3].text).toBe('Start checklist');
    });
    it('has 3 items in menu - edit reason, add changeover and add signal when shift is older than 7 days', () => {
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'STOPPAGE',
          firstSelectedSlice: slice,
          sliceSelection: [slice],
          bracketRange: { selectedRange: ['2020-02-02T12:10:00.000Z', '2020-02-02T12:20:00.000Z'] },
          shift: oldShift,
        },
      }));

      const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(items.length).toBe(3);
      expect(items[0].text).toBe('Edit reason');
      expect(items[1].text).toBe('Add changeover');
      expect(items[2].text).toBe('Add signal');
    });
    test('that if stoppage doesnt have joinId then areAllSlicesInSameJoin returns false', () => {
      expect(wrapper.vm.areAllSlicesInSameJoin).toBe(false);
    });
  });

  describe('one stoppage selected as COMPANY_ADMIN if station has timeModeActive', () => {
    const slice = {
      id: 1, type: 'STOPPAGE', sliceStartTmISO: '2020-02-02T12:00:00.000Z', sliceEndTmISO: '2020-02-02T12:22:00.000Z', batchId: 1, commentId: 1,
    };

    it('has 4 items in menu - edit reason, add changeover, change to production and start checklist', () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'STOPPAGE',
          firstSelectedSlice: slice,
          sliceSelection: [slice],
          bracketRange: { selectedRange: ['2020-02-02T12:10:00.000Z', '2020-02-02T12:20:00.000Z'] },
          lineviewStation: { timeModeActive: true },
        },
      });
      const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(items.length).toBe(4);
      expect(items[0].text).toBe('Edit reason');
      expect(items[1].text).toBe('Add changeover');
      expect(items[2].text).toBe('Change to production');
      expect(items[3].text).toBe('Start checklist');
    });
  });

  describe('one stoppage selected without edit permission', () => {
    const slice = {
      id: 1, type: 'STOPPAGE', sliceStartTmISO: '2020-02-02T12:00:00.000Z', sliceEndTmISO: '2020-02-02T12:22:00.000Z', batchId: 1, commentId: 1,
    };
    let wrapper;

    beforeEach(() => {
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'STOPPAGE',
          firstSelectedSlice: slice,
          sliceSelection: [slice],
          bracketRange: { selectedRange: ['2020-02-02T12:10:00.000Z', '2020-02-02T12:20:00.000Z'] },
          shiftviewStationRoleAllows: () => false,
        },
      }));
    });

    it('has 3 items in menu - edit reason, add changeover and start checklist', () => {
      const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(items.length).toBe(3);
      expect(items[0].text).toBe('Edit reason');
      expect(items[1].text).toBe('Add changeover');
      expect(items[2].text).toBe('Start checklist');
    });
    it('has 2 items in menu - edit reason and add changeover when shift is older than 7 days', () => {
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'STOPPAGE',
          firstSelectedSlice: slice,
          sliceSelection: [slice],
          bracketRange: { selectedRange: ['2020-02-02T12:10:00.000Z', '2020-02-02T12:20:00.000Z'] },
          shiftviewStationRoleAllows: () => false,
          shift: oldShift,
        },
      }));

      const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(items.length).toBe(2);
      expect(items[0].text).toBe('Edit reason');
      expect(items[1].text).toBe('Add changeover');
    });
  });

  describe('one stoppage selected without edit permission when station has timeModeActive', () => {
    const slice = {
      id: 1, type: 'STOPPAGE', sliceStartTmISO: '2020-02-02T12:00:00.000Z', sliceEndTmISO: '2020-02-02T12:22:00.000Z', batchId: 1, commentId: 1,
    };

    it('has 4 items in menu - edit reason, add changeover and start checklist', () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'STOPPAGE',
          firstSelectedSlice: slice,
          sliceSelection: [slice],
          bracketRange: { selectedRange: ['2020-02-02T12:10:00.000Z', '2020-02-02T12:20:00.000Z'] },
          lineviewStation: { timeModeActive: true },
          shiftviewStationRoleAllows: () => false,
        },
      });
      const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(items.length).toBe(4);
      expect(items[0].text).toBe('Edit reason');
      expect(items[1].text).toBe('Add changeover');
      expect(items[2].text).toBe('Change to production');
      expect(items[3].text).toBe('Start checklist');
    });
  });

  describe('one stoppage selected without edit permission', () => {
    const slice = {
      id: 1, type: 'STOPPAGE', sliceStartTmISO: '2020-02-02T12:00:00.000Z', sliceEndTmISO: '2020-02-02T12:22:00.000Z', batchId: 1, commentId: 1,
    };

    it('has 3 items in menu - edit reason, add changeover and start checklist', () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'STOPPAGE',
          firstSelectedSlice: slice,
          sliceSelection: [slice],
          bracketRange: { selectedRange: ['2020-02-02T12:10:00.000Z', '2020-02-02T12:20:00.000Z'] },
          shiftviewStationRoleAllows: () => false,
        },
      });
      const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(items.length).toBe(3);
      expect(items[0].text).toBe('Edit reason');
      expect(items[1].text).toBe('Add changeover');
      expect(items[2].text).toBe('Start checklist');
    });
  });

  describe('one stoppage selected as COMPANY_ADMIN, but brackets start earlier than stoppage', () => {
    const slice = {
      id: 1, type: 'STOPPAGE', sliceStartTmISO: '2020-02-02T12:00:00.000Z', sliceEndTmISO: '2020-02-02T12:22:00.000Z', duration: 22 * 60, batchId: 1, commentId: 1,
    };
    let wrapper;

    beforeEach(() => {
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'STOPPAGE',
          firstSelectedSlice: slice,
          sliceSelection: [slice],
          bracketRange: { selectedRange: ['2020-02-02T11:50:00.000Z', '2020-02-02T12:20:00.000Z'] },
        },
      }));
    });

    it('shows arrows', () => {
      expect(wrapper.vm.arrowsVisible).toBe(true);
    });
    it('has correct dotColor', () => {
      expect(wrapper.vm.dotColor).toBe('lw-red');
    });
    it('has correct subtitle', () => {
      expect(wrapper.vm.subtitleTime).toBe('11:50 - 12:20');
      expect(wrapper.vm.subtitlePrimaryValue).toBe('20m');
      expect(wrapper.vm.subtitleSecondaryValue).toBe('');
    });
    it('has correct title', () => {
      expect(wrapper.vm.title).toBe('test downtime');
    });
    it('has 4 items in menu - edit reason, add changeover, add signal and start checklist', () => {
      const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(items.length).toBe(4);
      expect(items[0].text).toBe('Edit reason');
      expect(items[1].text).toBe('Add changeover');
      expect(items[2].text).toBe('Add signal');
      expect(items[3].text).toBe('Start checklist');
    });
    it('has 3 items in menu - edit reason, add changeover and add signal when shift is older than 7 days', () => {
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'STOPPAGE',
          firstSelectedSlice: slice,
          sliceSelection: [slice],
          bracketRange: { selectedRange: ['2020-02-02T11:50:00.000Z', '2020-02-02T12:20:00.000Z'] },
          shift: oldShift,
        },
      }));

      const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(items.length).toBe(3);
      expect(items[0].text).toBe('Edit reason');
      expect(items[1].text).toBe('Add changeover');
      expect(items[2].text).toBe('Add signal');
    });
  });

  describe('multiple with same comments selected', () => {
    const firstSlice = {
      id: 1, type: 'STOPPAGE', sliceStartTmISO: '2020-02-02T12:00:00.000Z', sliceEndTmISO: '2020-02-02T12:22:00.000Z', batchId: 1, commentId: 1, duration: 22 * 60,
    };
    const secondSlice = {
      id: 5, type: 'STOPPAGE', sliceStartTmISO: '2020-02-02T13:00:00.000Z', sliceEndTmISO: '2020-02-02T13:05:00.000Z', batchId: 1, commentId: 1, duration: 5 * 60,
    };
    let wrapper;

    beforeEach(() => {
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'STOPPAGE',
          firstSelectedSlice: firstSlice,
          sliceSelection: [firstSlice, secondSlice],
          bracketRange: { selectedRange: ['2020-02-02T12:01:00.000Z', '2020-02-02T13:02:00.000Z'] },
        },
      }));
    });

    it('doesnt show arrows', () => {
      expect(wrapper.vm.arrowsVisible).toBe(false);
    });
    it('has correct dotColor', () => {
      expect(wrapper.vm.dotColor).toBe('lw-red');
    });
    it('has correct subtitle', () => {
      expect(wrapper.vm.subtitleTime).toBe('12:01 - 13:02');
      expect(wrapper.vm.subtitlePrimaryValue).toBe('23m');
      expect(wrapper.vm.subtitleSecondaryValue).toBe('');
    });
    it('has correct title', () => {
      expect(wrapper.vm.title).toBe('test downtime (2)');
    });
    it('has one item in menu - edit reason', () => {
      const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(items.length).toBe(1);
      expect(items[0].text).toBe('Edit reason');
    });
    test('that if stoppages have same joinId then areAllSlicesInSameJoin returns true', () => {
      const firstSliceCopy = { ...firstSlice, joinId: '123-asd' };
      const secondSliceCopy = { ...secondSlice, joinId: '123-asd' };
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'STOPPAGE',
          firstSelectedSlice: firstSliceCopy,
          sliceSelection: [firstSliceCopy, secondSliceCopy],
          bracketRange: { selectedRange: ['2020-02-02T12:01:00.000Z', '2020-02-02T13:02:00.000Z'] },
        },
      }));

      expect(wrapper.vm.areAllSlicesInSameJoin).toBe(true);
    });
    test('that if stoppages have different joinId then areAllSlicesInSameJoin returns false', () => {
      const firstSliceCopy = { ...firstSlice, joinId: '123-asd' };
      const secondSliceCopy = { ...secondSlice, joinId: '456-fgh' };
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'STOPPAGE',
          firstSelectedSlice: firstSliceCopy,
          sliceSelection: [firstSliceCopy, secondSliceCopy],
          bracketRange: { selectedRange: ['2020-02-02T12:01:00.000Z', '2020-02-02T13:02:00.000Z'] },
        },
      }));

      expect(wrapper.vm.areAllSlicesInSameJoin).toBe(false);
    });
    test('that if one stoppage has joinId and other doesnt then areAllSlicesInSameJoin returns false', () => {
      const firstSliceCopy = { ...firstSlice, joinId: '123-asd' };
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'STOPPAGE',
          firstSelectedSlice: firstSliceCopy,
          sliceSelection: [firstSliceCopy, secondSlice],
          bracketRange: { selectedRange: ['2020-02-02T12:01:00.000Z', '2020-02-02T13:02:00.000Z'] },
        },
      }));

      expect(wrapper.vm.areAllSlicesInSameJoin).toBe(false);
    });
    test('that if both stoppages doesnt have joinId then areAllSlicesInSameJoin returns false', () => {
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'STOPPAGE',
          firstSelectedSlice: firstSlice,
          sliceSelection: [firstSlice, secondSlice],
          bracketRange: { selectedRange: ['2020-02-02T12:01:00.000Z', '2020-02-02T13:02:00.000Z'] },
        },
      }));

      expect(wrapper.vm.areAllSlicesInSameJoin).toBe(false);
    });
  });

  describe('multiple with different comments selected', () => {
    const firstSlice = {
      id: 1, type: 'STOPPAGE', sliceStartTmISO: '2020-02-02T12:00:00.000Z', sliceEndTmISO: '2020-02-02T12:22:00.000Z', batchId: 1, commentId: 1, duration: 22 * 60,
    };
    const secondSlice = {
      id: 6, type: 'STOPPAGE', sliceStartTmISO: '2020-02-02T14:00:00.000Z', sliceEndTmISO: '2020-02-02T14:07:00.000Z', batchId: 1, commentId: 0, duration: 7 * 60,
    };
    let wrapper;

    beforeEach(() => {
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'STOPPAGE',
          firstSelectedSlice: firstSlice,
          sliceSelection: [firstSlice, secondSlice],
          bracketRange: { selectedRange: ['2020-02-02T12:02:00.000Z', '2020-02-02T14:02:00.000Z'] },
        },
      }));
    });

    it('doesnt show arrows', () => {
      expect(wrapper.vm.arrowsVisible).toBe(false);
    });
    it('has correct dotColor', () => {
      expect(wrapper.vm.dotColor).toBe('lw-red');
    });
    it('has correct subtitle', () => {
      expect(wrapper.vm.subtitleTime).toBe('12:02 - 14:02');
      expect(wrapper.vm.subtitlePrimaryValue).toBe('22m');
      expect(wrapper.vm.subtitleSecondaryValue).toBe('');
    });
    it('has correct title', () => {
      expect(wrapper.vm.title).toBe('Downtime (2)');
    });
    it('has one item in menu - add reason', () => {
      const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(items.length).toBe(1);
      expect(items[0].text).toBe('Add reason');
    });
    test('that areAllSlicesInSameJoin returns false, because stoppages with different comments are selected', () => {
      expect(wrapper.vm.areAllSlicesInSameJoin).toBe(false);
    });
  });

  describe('multiple selected with clicking (no brackets)', () => {
    const firstSlice = {
      id: 1, type: 'STOPPAGE', sliceStartTmISO: '2020-02-02T12:00:00.000Z', sliceEndTmISO: '2020-02-02T12:22:00.000Z', batchId: 1, commentId: 1, duration: 22 * 60,
    };
    const secondSlice = {
      id: 6, type: 'STOPPAGE', sliceStartTmISO: '2020-02-02T14:00:00.000Z', sliceEndTmISO: '2020-02-02T14:07:00.000Z', batchId: 1, commentId: 0, duration: 7 * 60,
    };
    let wrapper;

    beforeEach(() => {
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'STOPPAGE',
          firstSelectedSlice: firstSlice,
          sliceSelection: [firstSlice, secondSlice],
        },
      }));
    });

    it('doesnt show arrows', () => {
      expect(wrapper.vm.arrowsVisible).toBe(false);
    });
    it('has correct dotColor', () => {
      expect(wrapper.vm.dotColor).toBe('lw-red');
    });
    it('has correct subtitle', () => {
      expect(wrapper.vm.subtitleTime).toBe('12:00 - 14:07');
      expect(wrapper.vm.subtitlePrimaryValue).toBe('29m');
      expect(wrapper.vm.subtitleSecondaryValue).toBe('');
    });
    it('has correct title', () => {
      expect(wrapper.vm.title).toBe('Downtime (2)');
    });
    it('has one item in menu - add reason', () => {
      const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(items.length).toBe(1);
      expect(items[0].text).toBe('Add reason');
    });
  });

  describe('empty selection', () => {
    let wrapper;

    beforeEach(() => {
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'STOPPAGE',
          sliceSelection: [],
          bracketRange: { selectedRange: ['2020-02-02T12:10:00.000Z', '2020-02-02T12:20:00.000Z'] },
        },
      }));
    });

    it('doesnt show arrows', () => {
      expect(wrapper.vm.arrowsVisible).toBe(false);
    });
    it('has correct dotColor', () => {
      expect(wrapper.vm.dotColor).toBe('lw-red');
    });
    it('has correct subtitle', () => {
      expect(wrapper.vm.subtitleTime).toBe('12:10 - 12:20');
      expect(wrapper.vm.subtitlePrimaryValue).toBe('');
      expect(wrapper.vm.subtitleSecondaryValue).toBe('');
    });
    it('has correct title', () => {
      expect(wrapper.vm.title).toBe('This area does not include selected event ({variable})');
    });
    it('has 2 items in menu - edit reason and add changeover and popover is disabled', () => {
      const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(items.length).toBe(2);
      expect(items[0].text).toBe('Edit reason');
      expect(items[1].text).toBe('Add changeover');
      expect(wrapper.vm.disabled).toBe(true);
    });
  });
});

describe('ShiftviewSelectionPopover - yellow selection', () => {
  describe('one yellow selected as COMPANY_ADMIN', () => {
    const yellowSlice = {
      perfLossCommentId: 1, sliceStartTmISO: '2020-02-02T12:00:00.000Z', sliceEndTmISO: '2020-02-02T12:10:00.000Z', quantity: 5, cycleTimeGood: 60, duration: 600, yellowDuration: 300, batchId: 1,
    };
    let wrapper;

    beforeEach(() => {
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'SLOW',
          bracketRange: { selectedRange: ['2020-02-02T12:00:00.000Z', '2020-02-02T12:05:00.000Z'] },
          sliceSelection: [yellowSlice],
        },
      }));
    });

    it('doesnt show arrows', () => {
      expect(wrapper.vm.arrowsVisible).toBe(false);
    });
    it('has correct dotColor', () => {
      expect(wrapper.vm.dotColor).toBe('lw-yellow');
    });
    it('has correct subtitle', () => {
      expect(wrapper.vm.subtitleTime).toBe('12:00 - 12:05');
      expect(wrapper.vm.subtitlePrimaryValue).toBe('5m');
      expect(wrapper.vm.subtitleSecondaryValue).toBe('');
    });
    it('has correct title', () => {
      expect(wrapper.vm.title).toBe('test speedloss');
    });
    it('has 3 items in menu - edit reason, add signal and start checklist', () => {
      const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(items.length).toBe(3);
      expect(items[0].text).toBe('Edit reason');
      expect(items[1].text).toBe('Add signal');
      expect(items[2].text).toBe('Start checklist');
    });
    it('has 2 items in menu - edit reason and add signal when shift is older than 7 days', () => {
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'SLOW',
          bracketRange: { selectedRange: ['2020-02-02T12:00:00.000Z', '2020-02-02T12:05:00.000Z'] },
          sliceSelection: [yellowSlice],
          shift: oldShift,
        },
      }));

      const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(items.length).toBe(2);
      expect(items[0].text).toBe('Edit reason');
      expect(items[1].text).toBe('Add signal');
    });
  });

  describe('one yellow selected without edit permission', () => {
    const yellowSlice = {
      perfLossCommentId: 1, sliceStartTmISO: '2020-02-02T12:00:00.000Z', sliceEndTmISO: '2020-02-02T12:10:00.000Z', quantity: 5, cycleTimeGood: 60, duration: 600, yellowDuration: 300, batchId: 1,
    };
    let wrapper;

    beforeEach(() => {
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'SLOW',
          bracketRange: { selectedRange: ['2020-02-02T12:00:00.000Z', '2020-02-02T12:05:00.000Z'] },
          sliceSelection: [yellowSlice],
          shiftviewStationRoleAllows: () => false,
        },
      }));
    });

    it('has 2 items in menu - edit reason and start checklist', () => {
      const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(items.length).toBe(2);
      expect(items[0].text).toBe('Edit reason');
      expect(items[1].text).toBe('Start checklist');
    });
    it('has 1 item in menu - edit reason when shift is older than 7 days', () => {
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'SLOW',
          bracketRange: { selectedRange: ['2020-02-02T12:00:00.000Z', '2020-02-02T12:05:00.000Z'] },
          sliceSelection: [yellowSlice],
          shiftviewStationRoleAllows: () => false,
          shift: oldShift,
        },
      }));

      const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(items.length).toBe(1);
      expect(items[0].text).toBe('Edit reason');
    });
  });

  describe('one yellow selected without edit permission (duplicate)', () => {
    const yellowSlice = {
      perfLossCommentId: 1, sliceStartTmISO: '2020-02-02T12:00:00.000Z', sliceEndTmISO: '2020-02-02T12:10:00.000Z', quantity: 5, cycleTimeGood: 60, duration: 600, yellowDuration: 300, batchId: 1,
    };
    let wrapper;

    beforeEach(() => {
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'SLOW',
          bracketRange: { selectedRange: ['2020-02-02T12:00:00.000Z', '2020-02-02T12:05:00.000Z'] },
          sliceSelection: [yellowSlice],
          shiftviewStationRoleAllows: () => false,
        },
      }));
    });

    it('has 2 items in menu - edit reason and start checklist', () => {
      const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(items.length).toBe(2);
      expect(items[0].text).toBe('Edit reason');
      expect(items[1].text).toBe('Start checklist');
    });
    it('has 1 item in menu - edit reason when shift is older than 7 days', () => {
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'SLOW',
          bracketRange: { selectedRange: ['2020-02-02T12:00:00.000Z', '2020-02-02T12:05:00.000Z'] },
          sliceSelection: [yellowSlice],
          shiftviewStationRoleAllows: () => false,
          shift: oldShift,
        },
      }));

      const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(items.length).toBe(1);
      expect(items[0].text).toBe('Edit reason');
    });
  });

  describe('multiple with different comments selected', () => {
    let wrapper;

    beforeEach(() => {
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'SLOW',
          bracketRange: { selectedRange: ['2020-02-02T12:00:00.000Z', '2020-02-02T12:55:00.000Z'] },
          sliceSelection: [
            {
              perfLossCommentId: 1, sliceStartTmISO: '2020-02-02T12:00:00.000Z', sliceEndTmISO: '2020-02-02T12:10:00.000Z', quantity: 10, cycleTimeGood: 30, duration: 600, yellowDuration: 300, batchId: 1,
            },
            {
              perfLossCommentId: 0, sliceStartTmISO: '2020-02-02T12:15:00.000Z', sliceEndTmISO: '2020-02-02T12:17:00.000Z', quantity: 3, cycleTimeGood: 30, duration: 120, yellowDuration: 30, batchId: 1,
            },
          ],
        },
      }));
    });

    it('doesnt show arrows', () => {
      expect(wrapper.vm.arrowsVisible).toBe(false);
    });
    it('has correct dotColor', () => {
      expect(wrapper.vm.dotColor).toBe('lw-yellow');
    });
    it('has correct subtitle', () => {
      expect(wrapper.vm.subtitleTime).toBe('12:00 - 12:55');
      expect(wrapper.vm.subtitlePrimaryValue).toBe('5m 30s');
      expect(wrapper.vm.subtitleSecondaryValue).toBe('');
    });
    it('has correct title', () => {
      expect(wrapper.vm.title).toBe('Speed loss (2)');
    });
    it('has one item in menu - add reason', () => {
      const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(items.length).toBe(1);
      expect(items[0].text).toBe('Add reason');
    });
  });

  describe('multiple with same comments selected', () => {
    let wrapper;

    beforeEach(() => {
      ({ wrapper } = createWrapper({
        storeOverrides: {
          shiftviewSelectionType: 'SLOW',
          bracketRange: { selectedRange: ['2020-02-02T12:00:00.000Z', '2020-02-02T12:55:00.000Z'] },
          sliceSelection: [
            {
              perfLossCommentId: 1, sliceStartTmISO: '2020-02-02T12:00:00.000Z', sliceEndTmISO: '2020-02-02T12:10:00.000Z', quantity: 5, cycleTimeGood: 60, duration: 600, yellowDuration: 300, batchId: 1,
            },
            {
              perfLossCommentId: 1, sliceStartTmISO: '2020-02-02T12:15:00.000Z', sliceEndTmISO: '2020-02-02T12:17:00.000Z', quantity: 1, cycleTimeGood: 60, duration: 120, yellowDuration: 60, batchId: 1,
            },
          ],
        },
      }));
    });

    it('doesnt show arrows', () => {
      expect(wrapper.vm.arrowsVisible).toBe(false);
    });
    it('has correct dotColor', () => {
      expect(wrapper.vm.dotColor).toBe('lw-yellow');
    });
    it('has correct subtitle', () => {
      expect(wrapper.vm.subtitleTime).toBe('12:00 - 12:55');
      expect(wrapper.vm.subtitlePrimaryValue).toBe('6m');
      expect(wrapper.vm.subtitleSecondaryValue).toBe('');
    });
    it('has correct title', () => {
      expect(wrapper.vm.title).toBe('test speedloss (2)');
    });
    it('has one item in menu - edit reason', () => {
      const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(items.length).toBe(1);
      expect(items[0].text).toBe('Edit reason');
    });
  });
});

describe('ShiftviewSelectionPopover - mobile view', () => {
  describe('circle selection', () => {
    const slice = {
      id: 0, type: 'PRODUCT', scrapQty: 0, sliceStartTmISO: '2020-02-02T12:00:00.000Z', sliceEndTmISO: '2020-02-02T12:02:00.000Z',
    };

    const createMobileWrapper = () => createWrapper({
      storeOverrides: {
        isMobileView: true,
        shiftviewSelectionType: 'PRODUCT',
        sliceSelection: [slice],
        firstSelectedSlice: slice,
      },
    });

    it('has correct event label', () => {
      const { wrapper } = createMobileWrapper();
      expect(wrapper.vm.getEventLabel(slice)).toBe('12:02:00');
    });
    test('that getEventDots returns correct value if slice scrap quantity is more than 0', () => {
      const { wrapper } = createMobileWrapper();
      const currentSlice = { ...slice, scrapQty: 2 };
      expect(wrapper.vm.getEventDots(currentSlice)).toEqual(['scrap']);
    });
    test('that getEventDots returns correct value if slice has a signal note', () => {
      const { wrapper } = createMobileWrapper();
      const currentSlice = { ...slice, signalNotes: 'Test note' };
      expect(wrapper.vm.getEventDots(currentSlice)).toEqual(['signal']);
    });
    it('has 4 items in menu - add changeover, add scrap, edit signal and delete signal', () => {
      const { wrapper } = createMobileWrapper();
      const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(items.length).toBe(4);
      expect(items[0].text).toBe('Add changeover');
      expect(items[1].text).toBe('Add scrap');
      expect(items[2].text).toBe('Edit signal');
      expect(items[3].text).toBe('Delete signal');
    });
  });

  describe('stoppage selection', () => {
    const slice = {
      id: 0, type: 'STOPPAGE', commentId: 0, sliceStartTmISO: '2020-02-02T12:00:00.000Z', sliceEndTmISO: '2020-02-02T12:02:00.000Z',
    };

    const createMobileWrapper = () => createWrapper({
      storeOverrides: {
        isMobileView: true,
        shiftviewSelectionType: 'STOPPAGE',
        sliceSelection: [slice],
        firstSelectedSlice: slice,
      },
    });

    it('has correct event label', () => {
      const { wrapper } = createMobileWrapper();
      expect(wrapper.vm.getEventLabel(slice)).toBe('12:00 - 12:02');
    });
    test('that getEventDots returns correct value', () => {
      const { wrapper } = createMobileWrapper();
      expect(wrapper.vm.getEventDots(slice)).toEqual(['downtime']);
    });
    test('that getEventDots returns correct values if it is product change', () => {
      const { wrapper } = createMobileWrapper();
      const currentSlice = { ...slice, isProductChange: true };
      expect(wrapper.vm.getEventDots(currentSlice)).toEqual(['changeover', 'downtime']);
    });
    it('has 3 items in menu - add reason, add changeover, add signal', () => {
      const { wrapper } = createMobileWrapper();
      const items = Object.values(wrapper.vm.items).filter((item) => item.isVisible);
      expect(items.length).toBe(3);
      expect(items[0].text).toBe('Add reason');
      expect(items[1].text).toBe('Add changeover');
      expect(items[2].text).toBe('Add signal');
    });
  });
});

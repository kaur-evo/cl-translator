import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ReportsTableHeader from './index.vue';

import { useReportsConfigStore, useBookmarkStore, useProfileStore, useDeviceStore } from '@/stores';
import {
  SPEEDLOSS, SCRAPREASON, QUANTITY, OEE,
} from '@/stores/reportsConfig/constants/configType';

const defaultPiniaState = {
  filterbar: {
    requestFilterState: {
      visibleColumns: [
        'comment', 'commentgroup', 'station', 'stationgroup', 'stoptype', 'stoplocation', 'product', 'productgroup', 'shifttemplate', 'operator',
        'stopcount', 'notescount', 'stopduration', 'stoppctplannedtime', 'avgduration',
      ],
    },
  },
};

const applyReportsConfigGetters = (pinia, overrides = {}) => {
  const reportsConfigStore = useReportsConfigStore(pinia);
  reportsConfigStore.configType = 'DOWNTIME';
  reportsConfigStore.activeHeaders = (list) => list;
  reportsConfigStore.notesTableActiveHeaders = (list) => list;
  reportsConfigStore.granularity = 'total';
  reportsConfigStore.groupBy = ['entityId'];
  Object.assign(reportsConfigStore, overrides);
};

const applyBookmarkGetters = (pinia) => {
  useBookmarkStore(pinia).bookmarkPresetsMap = {
    DOWNTIME: { name: 'downtime' },
    SPEEDLOSS: { name: 'speedloss' },
    SCRAPREASON: { name: 'scrapreason' },
    QUANTITY: { name: 'quantity' },
    OEE: { name: 'oee' },
  };
};

const createPinia = ({ initialOverrides = {}, reportsConfigOverrides = {}, isMobileView = false } = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    initialState: {
      ...defaultPiniaState,
      ...initialOverrides,
    },
  });
  applyReportsConfigGetters(pinia, reportsConfigOverrides);
  applyBookmarkGetters(pinia);
  useDeviceStore(pinia).isMobileView = isMobileView;
  const profileStore = useProfileStore(pinia);
  profileStore.language = undefined;
  profileStore.reportsDurationFormat = undefined;
  return pinia;
};

describe('ReportsTableHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly in mobile', () => {
    const wrapper = shallowMount(ReportsTableHeader, {
      global: { plugins: [createPinia({ isMobileView: true })] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with multiple export options if configType is DOWNTIME', () => {
    const wrapper = shallowMount(ReportsTableHeader, {
      global: { plugins: [createPinia()] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with multiple export options if configType is SPEEDLOSS', () => {
    const wrapper = shallowMount(ReportsTableHeader, {
      global: { plugins: [createPinia({ reportsConfigOverrides: { configType: SPEEDLOSS } })] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with one export option if configType is SCRAPREASON', () => {
    const wrapper = shallowMount(ReportsTableHeader, {
      global: { plugins: [createPinia({ reportsConfigOverrides: { configType: SCRAPREASON } })] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('showDurationFormatSelection', () => {
    it('returns true if configType is DOWNTIME and is not mobile view', () => {
      const wrapper = shallowMount(ReportsTableHeader, {
        global: { plugins: [createPinia({ isMobileView: false })] },
      });

      expect(wrapper.vm.showDurationFormatSelection).toBe(true);
    });

    it('returns false if configType is DOWNTIME and is mobile view', () => {
      const wrapper = shallowMount(ReportsTableHeader, {
        global: { plugins: [createPinia({ isMobileView: true })] },
      });

      expect(wrapper.vm.showDurationFormatSelection).toBe(false);
    });

    it('returns false if configType is QUANTITY', () => {
      const wrapper = shallowMount(ReportsTableHeader, {
        global: { plugins: [createPinia({ reportsConfigOverrides: { configType: QUANTITY } })] },
      });

      expect(wrapper.vm.showDurationFormatSelection).toBe(false);
    });

    it('returns true if configType is OEE', () => {
      const wrapper = shallowMount(ReportsTableHeader, {
        global: { plugins: [createPinia({ reportsConfigOverrides: { configType: OEE } })] },
      });

      expect(wrapper.vm.showDurationFormatSelection).toBe(true);
    });
  });

  test('visibleHeaders', () => {
    const pinia = createPinia({
      initialOverrides: {
        filterbar: {
          requestFilterState: {
            visibleColumns: [
              'comment',
              'commentgroup',
              'station',
              'stationgroup',
              'stoptype',
              'stoplocation',
              'product',
              'productgroup',
              'shifttemplate',
              'operator',
              'stopcount',
              'notescount',
              'stopduration',
              'stoppctplannedtime',
              'avgduration',
            ],
          },
        },
      },
      reportsConfigOverrides: {
        activeHeaders: () => [
          { secondaryId: 'singleOperator', id: 'singleoperator' },
          { id: 'comment', secondaryId: 'entityId' },
          { id: 'commentgroup', secondaryId: 'entityGroupId' },
          { secondaryId: 'stationId', id: 'station' },
          { secondaryId: 'stationGroupId', id: 'stationgroup' },
          { id: 'stoplocation', secondaryId: 'positionId' },
          { id: 'sku' },
          { id: 'shifttemplate', secondaryId: 'shiftTemplate' },
          { id: 'operator' },
          { id: 'avgduration' },
        ],
        granularity: 'total',
        groupBy: ['singleOperator'],
      },
    });

    const wrapper = shallowMount(ReportsTableHeader, {
      global: { plugins: [pinia] },
    });

    expect(wrapper.vm.visibleHeaders).toEqual([
      'singleoperator',
      'comment',
      'commentgroup',
      'station',
      'stationgroup',
      'stoplocation',
      'shifttemplate',
      'operator',
      'avgduration',
    ]);
  });

  test('that openViewSettings calls openDialog with correct params', () => {
    const wrapper = shallowMount(ReportsTableHeader, {
      global: { plugins: [createPinia()] },
    });

    const openDialogSpy = vi.spyOn(wrapper.vm, 'openDialog');

    wrapper.vm.openViewSettings();

    expect(openDialogSpy).toHaveBeenCalledWith({
      allowFullscreen: true,
      component: expect.any(Object),
    });
  });
});

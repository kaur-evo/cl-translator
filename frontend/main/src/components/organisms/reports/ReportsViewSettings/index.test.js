import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';

import ReportsViewSettings from './index.vue';

import { useReportsConfigStore, useDeviceStore, useFilterbarStore, useProfileStore, useGenericDialogStore } from '@/stores';
import ConfigType from '@/stores/reportsConfig/constants/configType';

const defaultVisibleColumns = [
  'comment', 'commentgroup', 'station', 'stationgroup', 'stoptype', 'stoplocation', 'product', 'productgroup', 'shifttemplate', 'operator',
  'stopcount', 'notescount', 'stopduration', 'stoppctplannedtime', 'avgduration',
];

const createPinia = ({
  configType = ConfigType.DOWNTIME,
  activeHeaders = (list) => list,
  granularity = 'total',
  groupBy = ['entityId'],
  visibleColumns = defaultVisibleColumns,
  language = 'en',
  reportsDurationFormat = 'MINUTES',
  isMobileView = true,
} = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
    initialState: {
      device: {
        screen: { width: 400, height: 800 },
        isBrowserTabActive: true,
      },
      filterbar: {
        requestFilterState: {
          type: configType,
          granularity,
          groupBy,
          visibleColumns,
        },
      },
      genericDialog: {
        allowFullscreen: false,
      },
      profile: {
        currentUser: { reportingTimeFormat: reportsDurationFormat === 'MINUTES' ? 'MINUTES' : reportsDurationFormat },
        language,
      },
    },
  });
  const reportsConfigStore = useReportsConfigStore(pinia);
  reportsConfigStore.activeHeaders = vi.fn(activeHeaders);
  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = isMobileView;
  return pinia;
};

describe('ReportsViewSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = shallowMount(ReportsViewSettings, {
      global: {
        plugins: [createPinia()],
        stubs: { 'dialog-template': false },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', async () => {
    const wrapper = shallowMount(ReportsViewSettings, {
      global: {
        plugins: [createPinia()],
        stubs: { 'dialog-template': false },
      },
    });

    await nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  test('that activeTableHeaders returns correct headers from activeHeaders store function', () => {
    const pinia = createPinia({
      activeHeaders: () => [
        { secondaryId: 'singleOperator', id: 'singleoperator' },
        { id: 'comment', secondaryId: 'entityId' },
        { id: 'commentgroup', secondaryId: 'entityGroupId' },
        { secondaryId: 'stationId', id: 'station' },
        { secondaryId: 'stationGroupId', id: 'stationgroup', isHidden: true },
        { id: 'stoplocation', secondaryId: 'positionId' },
        { id: 'sku' },
        { id: 'shifttemplate', secondaryId: 'shiftTemplate' },
        { id: 'operator' },
        { id: 'avgduration', isHidden: true },
      ],
    });
    const wrapper = shallowMount(ReportsViewSettings, {
      global: { plugins: [pinia] },
    });

    expect(wrapper.vm.activeTableHeaders).toEqual([
      { secondaryId: 'singleOperator', id: 'singleoperator' },
      { id: 'comment', secondaryId: 'entityId' },
      { id: 'commentgroup', secondaryId: 'entityGroupId' },
      { secondaryId: 'stationId', id: 'station' },
      { id: 'stoplocation', secondaryId: 'positionId' },
      { id: 'sku' },
      { id: 'shifttemplate', secondaryId: 'shiftTemplate' },
      { id: 'operator' },
    ]);
  });

  describe('visibleHeaders', () => {
    it('always includes the first column from activeTableHeaders', () => {
      const pinia = createPinia({
        visibleColumns: ['station', 'stationgroup'],
        activeHeaders: () => [
          { id: 'date' },
          { id: 'station', secondaryId: 'stationId' },
          { id: 'stationgroup', secondaryId: 'stationGroupId' },
        ],
      });
      const wrapper = shallowMount(ReportsViewSettings, {
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.visibleHeaders).toEqual(['date', 'station', 'stationgroup']);
    });

    it('includes columns from visibleColumns that exist in activeTableHeaders', () => {
      const pinia = createPinia({
        visibleColumns: ['comment', 'station', 'nonexistent'],
        activeHeaders: () => [
          { id: 'date' },
          { id: 'comment', secondaryId: 'entityId' },
          { id: 'station', secondaryId: 'stationId' },
        ],
      });
      const wrapper = shallowMount(ReportsViewSettings, {
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.visibleHeaders).toEqual(['date', 'comment', 'station']);
    });

    it('does not force-include columns matching groupBy that are not in visibleColumns', () => {
      const pinia = createPinia({
        visibleColumns: ['comment'],
        groupBy: ['stationId'],
        activeHeaders: () => [
          { id: 'date' },
          { id: 'comment', secondaryId: 'entityId' },
          { id: 'station', secondaryId: 'stationId' },
        ],
      });
      const wrapper = shallowMount(ReportsViewSettings, {
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.visibleHeaders).not.toContain('station');
      expect(wrapper.vm.visibleHeaders).toEqual(['date', 'comment']);
    });

    it('includes first column even when visibleColumns is empty', () => {
      const pinia = createPinia({
        visibleColumns: [],
        activeHeaders: () => [
          { id: 'productionSpeedRange' },
          { id: 'station', secondaryId: 'stationId' },
        ],
      });
      const wrapper = shallowMount(ReportsViewSettings, {
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.visibleHeaders).toEqual(['productionSpeedRange']);
    });

    it('does not duplicate the first column if it is already in visibleColumns', () => {
      const pinia = createPinia({
        visibleColumns: ['date', 'station'],
        activeHeaders: () => [
          { id: 'date' },
          { id: 'station', secondaryId: 'stationId' },
        ],
      });
      const wrapper = shallowMount(ReportsViewSettings, {
        global: { plugins: [pinia] },
      });

      expect(wrapper.vm.visibleHeaders).toEqual(['date', 'station']);
    });
  });

  describe('showDurationFormatSelection', () => {
    it('returns true if configType is DOWNTIME', () => {
      const wrapper = shallowMount(ReportsViewSettings, {
        global: { plugins: [createPinia({ configType: ConfigType.DOWNTIME })] },
      });

      expect(wrapper.vm.showDurationFormatSelection).toBe(true);
    });

    it('returns true if configType is SPEEDLOSS', () => {
      const wrapper = shallowMount(ReportsViewSettings, {
        global: { plugins: [createPinia({ configType: ConfigType.SPEEDLOSS })] },
      });

      expect(wrapper.vm.showDurationFormatSelection).toBe(true);
    });

    it('returns true if configType is SCRAPREASON', () => {
      const wrapper = shallowMount(ReportsViewSettings, {
        global: { plugins: [createPinia({ configType: ConfigType.SCRAPREASON })] },
      });

      expect(wrapper.vm.showDurationFormatSelection).toBe(true);
    });

    it('returns false if configType is OEE', () => {
      const wrapper = shallowMount(ReportsViewSettings, {
        global: { plugins: [createPinia({ configType: ConfigType.OEE })] },
      });

      expect(wrapper.vm.showDurationFormatSelection).toBe(false);
    });

    it('returns false if configType is QUANTITY', () => {
      const wrapper = shallowMount(ReportsViewSettings, {
        global: { plugins: [createPinia({ configType: ConfigType.QUANTITY })] },
      });

      expect(wrapper.vm.showDurationFormatSelection).toBe(false);
    });

    it('returns true if configType is TIME_USAGE', () => {
      const wrapper = shallowMount(ReportsViewSettings, {
        global: { plugins: [createPinia({ configType: ConfigType.TIME_USAGE })] },
      });

      expect(wrapper.vm.showDurationFormatSelection).toBe(true);
    });

    it('returns true if configType is CHECKLIST', () => {
      const wrapper = shallowMount(ReportsViewSettings, {
        global: { plugins: [createPinia({ configType: ConfigType.CHECKLIST })] },
      });

      expect(wrapper.vm.showDurationFormatSelection).toBe(true);
    });
  });

  test('that onCloseDialog calls closeDialog store method', () => {
    const pinia = createPinia();
    const genericDialogStore = useGenericDialogStore(pinia);
    const wrapper = shallowMount(ReportsViewSettings, {
      global: { plugins: [pinia] },
    });

    wrapper.vm.onCloseDialog();
    expect(genericDialogStore.closeDialog).toHaveBeenCalled();
  });

  test('that onApply calls store data update and closeDialog methods', () => {
    const pinia = createPinia({
      visibleColumns: ['comment', 'commentgroup'],
      activeHeaders: () => [
        { id: 'comment', secondaryId: 'entityId' },
        { id: 'commentgroup', secondaryId: 'entityGroupId' },
        { id: 'station', secondaryId: 'stationId' },
      ],
    });
    const filterbarStore = useFilterbarStore(pinia);
    const profileStore = useProfileStore(pinia);
    const genericDialogStore = useGenericDialogStore(pinia);
    const wrapper = shallowMount(ReportsViewSettings, {
      global: { plugins: [pinia] },
    });

    wrapper.vm.onApply();
    expect(filterbarStore.updateFilterValue).toHaveBeenCalledWith({ visibleColumns: ['comment', 'commentgroup'] });
    expect(filterbarStore.triggerDataRequest).toHaveBeenCalled();
    expect(profileStore.updateCurrentUser).toHaveBeenCalledWith({ reportingTimeFormat: 'MINUTES' });
    expect(genericDialogStore.closeDialog).toHaveBeenCalled();
  });
});

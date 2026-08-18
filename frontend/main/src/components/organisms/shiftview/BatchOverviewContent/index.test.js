import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import BatchOverviewContent from './index.vue';

import {
  useConfigurationStore,
  useShiftviewTimelineStore,
  useShiftViewStore,
  useUserPreferencesStore,
  useShiftStore,
  useFeatureStore,
} from '@/stores/index';

vi.mock('@/helpers/batch/batchHelpers', () => ({
  formatBatchEstimatedTime: vi.fn(() => '2h 30m'),
  formatBatchTargetDisplay: vi.fn(() => '100 pcs'),
  getBatchCardTitle: vi.fn(() => '13:23 — 10.03.2023 — PO-1'),
  getBatchQuantityParts: vi.fn(() => ({ goodQty: '95', scrapQty: '5', plannedQty: '100', unitId: 'pcs' })),
}));

const batch1 = { id: 1, productionOrder: 'PO-001', productSku: 'SKU-1', productName: 'Product 1', endTime: '2023-03-10T10:00:00.000Z' };
const batch2 = { id: 2, productionOrder: 'PO-002', productSku: 'SKU-2', productName: 'Product 2', endTime: '2023-03-10T12:00:00.000Z' };

// currentBatch getter returns first value from batches Map — insert currentBatch first.
const defaultBatches = () => new Map([[2, batch2], [1, batch1]]);

const createWrapper = ({
  props = {},
  productChangeTabs = ['products'],
  batches = defaultBatches(),
  orders = [],
  viewSettings = { usePrimaryUnit: true },
} = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const configurationStore = useConfigurationStore(pinia);
  configurationStore.configuration = { productChangeTabs: productChangeTabs.join(',') };

  const featureStore = useFeatureStore(pinia);
  featureStore.productionOrders = productChangeTabs.includes('orders');

  const timelineStore = useShiftviewTimelineStore(pinia);
  timelineStore.batches = batches;

  const shiftViewStore = useShiftViewStore(pinia);
  shiftViewStore.orders = orders;

  const userPreferencesStore = useUserPreferencesStore(pinia);
  userPreferencesStore.viewSettings = viewSettings;

  const shiftStore = useShiftStore(pinia);
  shiftStore.shift = { startTime: '2023-03-10T06:00:00.000Z' };

  return shallowMount(BatchOverviewContent, {
    props,
    global: { plugins: [pinia] },
  });
};

describe('BatchOverviewContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with orders enabled', () => {
    const wrapper = createWrapper({ productChangeTabs: ['products', 'orders'] });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('tabs', () => {
    it('returns 2 tabs when orders are not enabled', () => {
      const wrapper = createWrapper();

      expect(wrapper.vm.tabs).toEqual([
        { key: 'completed', name: 'Completed batches', titleTextKey: expect.any(Function), subtitleItemsProps: expect.any(Function), items: expect.any(Array) },
        { key: 'current', name: 'Current batch', titleTextKey: expect.any(Function), subtitleItemsProps: expect.any(Function), items: expect.any(Array) },
      ]);
    });

    it('returns 3 tabs when orders are enabled', () => {
      const wrapper = createWrapper({ productChangeTabs: ['products', 'orders'] });

      expect(wrapper.vm.tabs).toEqual([
        { key: 'completed', name: 'Completed batches', titleTextKey: expect.any(Function), subtitleItemsProps: expect.any(Function), items: expect.any(Array) },
        { key: 'current', name: 'Current batch', titleTextKey: expect.any(Function), subtitleItemsProps: expect.any(Function), items: expect.any(Array) },
        { key: 'upcoming', name: 'Upcoming batches', titleTextKey: 'productionOrder', subtitleItemsProps: expect.any(Function), items: expect.any(Array) },
      ]);
    });
  });

  describe('isTabDisabled', () => {
    it('marks completed tab as not disabled when there are completed batches', () => {
      // batch1 and batch2 in batches; currentBatch is batch2, so batch1 is a completed batch
      const wrapper = createWrapper();

      const completedTab = wrapper.vm.tabs.find((tab) => tab.key === 'completed');
      expect(wrapper.vm.isTabDisabled(completedTab)).toBe(false);
    });

    it('marks completed tab as disabled when there is only the current batch', () => {
      const wrapper = createWrapper({
        batches: new Map([[2, batch2]]),
      });

      const completedTab = wrapper.vm.tabs.find((tab) => tab.key === 'completed');
      expect(wrapper.vm.isTabDisabled(completedTab)).toBe(true);
    });

    it('marks upcoming tab as disabled when there are no orders', () => {
      const wrapper = createWrapper({ productChangeTabs: ['products', 'orders'], orders: [] });

      const upcomingTab = wrapper.vm.tabs.find((tab) => tab.key === 'upcoming');
      expect(wrapper.vm.isTabDisabled(upcomingTab)).toBe(true);
    });

    it('marks upcoming tab as not disabled when there are orders', () => {
      const wrapper = createWrapper({
        productChangeTabs: ['products', 'orders'],
        orders: [{ id: 10, productionOrder: 'PO-010', productSku: 'SKU-10', productName: 'Product 10' }],
      });

      const upcomingTab = wrapper.vm.tabs.find((tab) => tab.key === 'upcoming');
      expect(wrapper.vm.isTabDisabled(upcomingTab)).toBe(false);
    });
  });

  describe('tab items', () => {
    test('that completed tab items contains all batches except the current one', () => {
      const wrapper = createWrapper();

      const completedTab = wrapper.vm.tabs.find((tab) => tab.key === 'completed');
      expect(completedTab.items).toHaveLength(1);
      expect(completedTab.items).toEqual([{
        id: 1, productionOrder: 'PO-001', productSku: 'SKU-1', productName: 'Product 1', endTime: '2023-03-10T10:00:00.000Z',
        quantityPrimary: '95', quantitySecondary: '5', quantityTertiary: '/ 100 pcs',
      }]);
    });

    test('that current tab items contains the current batch with estimatedTimeDisplay', () => {
      const wrapper = createWrapper();

      const currentTab = wrapper.vm.tabs.find((tab) => tab.key === 'current');
      expect(currentTab.items).toHaveLength(1);
      expect(currentTab.items).toEqual([{
        id: 2, productionOrder: 'PO-002', productSku: 'SKU-2', productName: 'Product 2', endTime: '2023-03-10T12:00:00.000Z',
        estimatedTimeDisplay: '2h 30m', quantityPrimary: '95', quantitySecondary: '5', quantityTertiary: '/ 100 pcs',
      }]);
    });

    test('that upcoming tab items contains orders with targetDisplay added', () => {
      const wrapper = createWrapper({
        productChangeTabs: ['products', 'orders'],
        orders: [{ id: 10, productionOrder: 'PO-010', productSku: 'SKU-10', productName: 'Product 10' }],
      });

      const upcomingTab = wrapper.vm.tabs.find((tab) => tab.key === 'upcoming');
      expect(upcomingTab.items).toHaveLength(1);
      expect(upcomingTab.items).toEqual([{ id: 10, productionOrder: 'PO-010', productSku: 'SKU-10', productName: 'Product 10', targetDisplay: '100 pcs' }]);
    });
  });

  test('that completedSubtitleProps returns correct fields', () => {
    const wrapper = createWrapper();
    const item = { productSku: 'SKU-1', productName: 'Product 1', productionOrder: 'PO-1', quantityPrimary: '95 pcs', lotCode: 'LOT-123', notes: 'Urgent' };

    const result = wrapper.vm.completedSubtitleProps(item);

    expect(result).toEqual([
      { text: 'Product code', valueKey: 'productSku' },
      { text: 'Product', valueKey: 'productName', isVisible: expect.any(Function) },
      {
        text: 'quantity',
        valueKey: 'quantityPrimary',
        primaryValueClass: 'text-primary',
        secondaryValueKey: 'quantitySecondary',
        secondaryValueClass: 'text-lw-orange',
        tertiaryValueKey: 'quantityTertiary',
        isVisible: true,
      },
      { text: 'LOT/Batch', valueKey: 'lotCode' },
      { text: 'Extra note', valueKey: 'notes' },
    ]);
  });

  test('that currentSubtitleProps returns correct fields', () => {
    const wrapper = createWrapper();
    const item = { productSku: 'SKU-1', productName: 'Product 1', productionOrder: 'PO-1', quantityPrimary: '95 pcs', estimatedTimeDisplay: '2h 30m', lotCode: 'LOT-123', notes: 'Urgent' };

    const result = wrapper.vm.currentSubtitleProps(item);

    expect(result).toEqual([
      { text: 'Product code', valueKey: 'productSku' },
      { text: 'Product', valueKey: 'productName', isVisible: expect.any(Function) },
      {
        text: 'quantity',
        valueKey: 'quantityPrimary',
        primaryValueClass: 'text-primary',
        secondaryValueKey: 'quantitySecondary',
        secondaryValueClass: 'text-lw-orange',
        tertiaryValueKey: 'quantityTertiary',
        isVisible: true,
      },
      { text: 'Estimated time', valueKey: 'estimatedTimeDisplay' },
      { text: 'LOT/Batch', valueKey: 'lotCode' },
      { text: 'Extra note', valueKey: 'notes' },
    ]);
  });

  test('that upcomingSubtitleProps returns correct fields', () => {
    const wrapper = createWrapper();
    const item = { productSku: 'SKU-10', productName: 'Product 10', productionOrder: 'PO-010', targetDisplay: '100 pcs', estimatedTimeDisplay: '2h 30m', lotCode: 'LOT-123', notes: 'Urgent' };

    const result = wrapper.vm.upcomingSubtitleProps(item);

    expect(result).toEqual([
      { text: 'Product code', valueKey: 'productSku' },
      { text: 'Product', valueKey: 'productName' },
      { text: 'Target', valueKey: 'targetDisplay' },
    ]);
  });

  describe('active tab selection', () => {
    it('defaults to completed tab (index 0) when no tab prop is given', () => {
      const wrapper = createWrapper();

      expect(wrapper.vm.activeTabIndex).toBe(0);
    });

    it('opens the current tab when tab prop is "current"', () => {
      const wrapper = createWrapper({ props: { tab: 'current' } });

      expect(wrapper.vm.activeTabIndex).toBe(1);
    });

    it('updates the active tab when the tab prop changes', async () => {
      const wrapper = createWrapper({ props: { tab: 'completed' } });

      await wrapper.setProps({ tab: 'current' });

      expect(wrapper.vm.activeTabIndex).toBe(1);
    });
  });
});

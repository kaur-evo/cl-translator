import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ShiftviewChangeoverDialog from './index.vue';

import {
  useShiftviewSelectionStore,
  useShiftviewTimelineStore,
  useStationStore,
  useConfigurationStore,
  useFeatureStore,
  useDeviceStore,
  useUserPreferencesStore,
  useGenericDialogStore,
  useGenericNotificationStore,
  useConfirmDialogStore,
  useProfileStore,
  useProductStore,
} from '@/stores/index';
import productApi from '@/api/productApi';
import routesApi from '@/api/routesApi';
import { defaultNumberFormattingOptions } from '@/constants/formattingConstants';
import { altUnitConversion, getUnitId } from '@/helpers/timeline/altUnitConversion';

vi.mock('@/api/productApi');
const getProductsMock = vi.fn(() => [{ id: 1 }, { id: 2 }]);
const getOrdersMock = vi.fn(() => [
  { id: 11 },
  {
    id: 22, productId: 77, orderNumber: 'order-number', lotCode: 'testlot',
  },
]);
const getProductByIdMock = vi.fn(() => ({ id: 12, name: 'Product1' }));
const getRoutesMock = vi.fn(() => [{ id: 1, name: 'Route1', unitQty: 10 }]);

productApi.getProducts = getProductsMock;
productApi.getOrders = getOrdersMock;
productApi.getProductGroups = () => [{ id: 1 }];
productApi.changeProduct = vi.fn();
productApi.getProduct = getProductByIdMock;

vi.mock('@/api/routesApi');
routesApi.getRoutes = getRoutesMock;

vi.mock('@/helpers/timeline/altUnitConversion');

vi.mock('@/helpers/localStorage/getItemsFromLocalStorageArray', () => ({
  default: vi.fn(() => []),
}));

const createWrapper = ({ storeOverrides = {} } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const shiftviewSelectionStore = useShiftviewSelectionStore(pinia);
  shiftviewSelectionStore.bracketRange = storeOverrides.bracketRange ?? {};
  shiftviewSelectionStore.firstSelectedSlice = storeOverrides.firstSelectedSlice ?? {
    sliceStartTmISO: '2021-01-01T12:00:00.000Z',
    sliceEndTmISO: '2021-01-01T12:01:00.000Z',
    isProductChange: true,
    batchId: 1,
  };

  const shiftviewTimelineStore = useShiftviewTimelineStore(pinia);
  shiftviewTimelineStore.batches = storeOverrides.batches ?? new Map([{
    id: 1, productId: 12, startTimeISO: '2021-01-01T12:00:00.000Z', unitId: 'tk',
  }].map(((batch) => [batch.id, batch])));

  const stationStore = useStationStore(pinia);
  stationStore.lineviewStation = storeOverrides.lineviewStation ?? {
    id: 1, showUnitQty: false, zoneId: 'UTC', requireLotBatch: false, requireChangeoverNote: false,
  };

  const deviceStore = useDeviceStore(pinia);
  deviceStore.showFullscreenDialogs = storeOverrides.showFullscreenDialogs ?? false;
  deviceStore.screenWidth = storeOverrides.screenWidth ?? 1600;
  deviceStore.screenHeight = storeOverrides.screenHeight ?? 929;
  deviceStore.isMobileView = storeOverrides.isMobileView ?? false;

  const configurationStore = useConfigurationStore(pinia);
  configurationStore.productChangeTabs = storeOverrides.productChangeTabs ?? ['orders'];

  const featureStore = useFeatureStore(pinia);
  featureStore.productionOrdersEnabled = storeOverrides.productionOrdersEnabled ?? true;

  const productStore = useProductStore(pinia);
  productStore.jobs = storeOverrides.jobs ?? [
    {
      id: 99, productId: 100, unitId: 'tk', alternativeUnitId: 'box',
    },
    {
      id: 100, productId: 123, unitId: 'tk', alternativeUnitId: 'box',
    },
  ];

  const genericDialogStore = useGenericDialogStore(pinia);
  genericDialogStore.allowFullscreen = storeOverrides.allowFullscreen ?? false;

  const genericNotificationStore = useGenericNotificationStore(pinia);

  const profileStore = useProfileStore(pinia);
  profileStore.numberFormattingOptions = storeOverrides.numberFormattingOptions ?? defaultNumberFormattingOptions;

  const userPreferencesStore = useUserPreferencesStore(pinia);

  const confirmDialogStore = useConfirmDialogStore(pinia);

  const stores = {
    shiftviewSelectionStore,
    shiftviewTimelineStore,
    stationStore,
    deviceStore,
    configurationStore,
    featureStore,
    productStore,
    genericDialogStore,
    genericNotificationStore,
    profileStore,
    userPreferencesStore,
    confirmDialogStore,
  };


  const wrapper = shallowMount(ShiftviewChangeoverDialog, {
    global: { plugins: [pinia] },
  });

  return { wrapper, stores, pinia };
};

describe('ShiftviewChangeoverDialog', () => {
  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();

    Object.defineProperty(window, 'localStorage', {
      value: { getItem: vi.fn().mockReturnValue(null) },
      writable: true,
    });

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2021-01-01T12:00:00.000Z'));
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('renders', async () => {
    const { wrapper } = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly when is not product change', () => {
    const { wrapper } = createWrapper({
      storeOverrides: {
        firstSelectedSlice: { isProductChange: false },
        bracketRange: { selectedRange: ['2021-01-01T12:00:00.000Z', '2021-01-01T12:01:00.000Z'] },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when is product change', () => {
    const { wrapper } = createWrapper({
      storeOverrides: { bracketRange: { selectedRange: ['2021-01-01T12:00:00.000Z', '2021-01-01T12:01:00.000Z'] } },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with unit qty', () => {
    const { wrapper } = createWrapper({
      storeOverrides: { lineviewStation: { id: 1, showUnitQty: true, zoneId: 'UTC' } },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile view on product tab', () => {
    const { wrapper } = createWrapper({
      storeOverrides: {
        isMobileView: true,
        productChangeTabs: ['products'],
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile view on orders tab', () => {
    const { wrapper } = createWrapper({
      storeOverrides: {
        isMobileView: true,
        productChangeTabs: ['orders'],
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when lineviewStation has timeModeActive', () => {
    const { wrapper } = createWrapper({
      storeOverrides: {
        lineviewStation: {
          id: 1, showUnitQty: true, zoneId: 'UTC', timeModeActive: true,
        },
        productChangeTabs: ['products'],
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('isTimeModeActive', () => {
    it('returns false if station timeModeActive is false', () => {
      const { wrapper } = createWrapper({
        storeOverrides: { lineviewStation: {
          id: 1, showUnitQty: true, zoneId: 'UTC', timeModeActive: false,
        } },
      });

      expect(wrapper.vm.isTimeModeActive).toBe(false);
    });

    it('returns true if station timeModeActive is true', () => {
      const { wrapper } = createWrapper({
        storeOverrides: { lineviewStation: {
          id: 1, showUnitQty: true, zoneId: 'UTC', timeModeActive: true,
        } },
      });

      expect(wrapper.vm.isTimeModeActive).toBe(true);
    });
  });

  test('that modal loads when selected job is deactivated', async () => {
    const { wrapper } = createWrapper();
    await flushPromises();

    expect(wrapper.vm.loading).toBe(false);
  });

  test('if product tab is active then products are loaded with correct params', async () => {
    createWrapper({
      storeOverrides: { productChangeTabs: ['products'] },
    });
    await flushPromises();
    expect(getProductsMock).toHaveBeenCalledTimes(1);
    expect(getProductsMock).toHaveBeenCalledWith({ stationId: 1, limit: 300 });
  });

  test('if product tab is active then products are set as searchItems', async () => {
    const { wrapper } = createWrapper({
      storeOverrides: { productChangeTabs: ['products'] },
    });
    await flushPromises();
    expect(wrapper.vm.searchItems.length).toBe(2);
    expect(wrapper.vm.searchItems).toEqual([{ id: 1 }, { id: 2 }]);
  });

  test('if orders tab is active then orders are loaded with correct params', async () => {
    createWrapper();
    await flushPromises();
    expect(getOrdersMock).toHaveBeenCalledTimes(1);
    expect(getOrdersMock).toHaveBeenCalledWith({ stationId: 1, limit: 300 });
  });

  test('if product tab is active then orders are set as searchItems', async () => {
    const { wrapper } = createWrapper();
    await flushPromises();
    expect(wrapper.vm.searchItems.length).toBe(2);
    expect(wrapper.vm.searchItems).toEqual(getOrdersMock());
  });

  test('if product tab is active and item is selected from search that is not in products list, then it is added there', async () => {
    const { wrapper } = createWrapper({
      storeOverrides: { productChangeTabs: ['products'] },
    });
    await flushPromises();
    expect(wrapper.vm.searchItems.length).toBe(2);
    expect(wrapper.vm.searchItems).toEqual([{ id: 1 }, { id: 2 }]);
    wrapper.vm.onItemSelectedFromSearch({ id: 3 });
    expect(wrapper.vm.searchItems.length).toBe(3);
    expect(wrapper.vm.searchItems).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
  });

  test('if orders tab is active and item is selected from search that is not in orders list, then it is added there', async () => {
    const { wrapper } = createWrapper();
    await flushPromises();
    expect(wrapper.vm.searchItems.length).toBe(2);
    expect(wrapper.vm.searchItems).toEqual(getOrdersMock());
    wrapper.vm.onItemSelectedFromSearch({ id: 33 });
    expect(wrapper.vm.searchItems.length).toBe(3);
    expect(wrapper.vm.searchItems).toEqual([...getOrdersMock(), { id: 33 }]);
  });

  test('if orders tab is active and is not product change then selectedGroupId is undefined and productGroups is empty', async () => {
    const { wrapper } = createWrapper({
      storeOverrides: { firstSelectedSlice: { isProductChange: false, batchId: 1 } },
    });
    await flushPromises();
    expect(wrapper.vm.productGroups).toStrictEqual([]);
    expect(wrapper.vm.selectedGroupId).toBeUndefined();
  });

  test('if products tab is active and is not product change then selectedGroupId is first product group id', async () => {
    const { wrapper } = createWrapper({
      storeOverrides: {
        productChangeTabs: ['products'],
        firstSelectedSlice: { isProductChange: false, batchId: 1 },
      },
    });
    await flushPromises();
    expect(wrapper.vm.productGroups).toStrictEqual([{ id: 1 }]);
    expect(wrapper.vm.selectedGroupId).toBe(1);
  });

  test('if tabs change changes the searchItems', async () => {
    const { wrapper } = createWrapper({
      storeOverrides: { productChangeTabs: ['products', 'orders'] },
    });
    await flushPromises();
    expect(wrapper.vm.searchItems).toEqual([{ id: 1 }, { id: 2 }]);
    await wrapper.setData({ tab: 1 });
    expect(wrapper.vm.searchItems).toEqual(getOrdersMock());
    await wrapper.setData({ tab: 0 });
    expect(wrapper.vm.searchItems).toEqual([{ id: 1 }, { id: 2 }]);
  });

  test('that onSearch queries products with correct params if product tab is active', async () => {
    const { wrapper } = createWrapper({
      storeOverrides: { productChangeTabs: ['products'] },
    });
    await flushPromises();
    wrapper.vm.onSearch('test');
    expect(getProductsMock).toHaveBeenCalledWith({ stationId: 1, limit: 300, term: 'test' });
  });

  test('that onSearch queries orders with correct params if orders tab is active', async () => {
    const { wrapper } = createWrapper({
      storeOverrides: {
        productChangeTabs: ['orders'],
        productionOrdersEnabled: true,
      },
    });
    await flushPromises();
    wrapper.vm.onSearch('test');
    expect(getOrdersMock).toHaveBeenCalledWith({ stationId: 1, limit: 300, term: 'test' });
  });

  test('that setDialogData calls selectItemById when product tab is active', async () => {
    const { wrapper } = createWrapper({
      storeOverrides: { productChangeTabs: ['products'] },
    });
    await flushPromises();

    const spy = vi.spyOn(wrapper.vm, 'selectItemById');
    wrapper.vm.setDialogData();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(12);
  });

  test('that setDialogData calls selectJobByOrderNumber when orders tab is active', async () => {
    const { wrapper } = createWrapper({
      storeOverrides: { batches: new Map([{ id: 1, productionOrder: 'order-number' }]
        .map(((batch) => [batch.id, batch]))) },
    });
    await flushPromises();

    const spy = vi.spyOn(wrapper.vm, 'selectJobByOrderNumber');
    wrapper.vm.setDialogData();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('order-number');
  });

  test('that selectJobByOrderNumber updates form data jobId, productId and lotCode and calls fetchRoute with productId if job with orderNumber exists', async () => {
    const { wrapper } = createWrapper();
    await flushPromises();

    const spy = vi.spyOn(wrapper.vm, 'fetchRoute');
    expect(wrapper.vm.formData.jobId).toBe(11);
    wrapper.vm.selectJobByOrderNumber('order-number');

    expect(wrapper.vm.formData.jobId).toBe(22);
    expect(wrapper.vm.formData.productId).toBe(undefined);
    expect(wrapper.vm.formData.lotCode).toBe('testlot');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(77);
  });

  test('that selectJobByOrderNumber does not update form data jobId and does not call fetchRoute with productId if job with orderNumber not exists', async () => {
    const { wrapper } = createWrapper();
    await flushPromises();

    const spy = vi.spyOn(wrapper.vm, 'fetchRoute');
    expect(wrapper.vm.formData.jobId).toBe(11);
    wrapper.vm.selectJobByOrderNumber('order-number-not-exists');

    expect(wrapper.vm.formData.jobId).toBe(11);
    expect(spy).toHaveBeenCalledTimes(0);
  });

  describe('fetchRoute', () => {
    beforeEach(() => {
      getRoutesMock.mockClear();
    });

    it('should not call getRoutes if productId is null', async () => {
      const { wrapper } = createWrapper();

      await wrapper.vm.fetchRoute(null);
      expect(getRoutesMock).not.toHaveBeenCalled();
    });

    it('should not call getRoutes if showUnitQty is false and isTimeModeActive is false', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: { lineviewStation: {
          id: 1, showUnitQty: false, zoneId: 'UTC', timeModeActive: false,
        } },
      });

      await wrapper.vm.fetchRoute(789);
      expect(getRoutesMock).not.toHaveBeenCalled();
    });

    it('should call getRoutes if isTimeModeActive is true and showUnitQty is false', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: { lineviewStation: {
          id: 1, showUnitQty: false, zoneId: 'UTC', timeModeActive: true,
        } },
      });

      await wrapper.vm.fetchRoute(123);
      expect(getRoutesMock).toHaveBeenCalledWith({ stationId: 1, productId: 123 });
    });

    it('should call getRoutes if showUnitQty is true and isTimeModeActive is false', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: { lineviewStation: {
          id: 1, showUnitQty: true, zoneId: 'UTC', timeModeActive: false,
        } },
      });

      await wrapper.vm.fetchRoute(456);
      expect(getRoutesMock).toHaveBeenCalledWith({ stationId: 1, productId: 456 });
    });

    it('should call getRoutes if showUnitQty is true and isTimeModeActive is true', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: { lineviewStation: {
          id: 1, showUnitQty: true, zoneId: 'UTC', timeModeActive: true,
        } },
      });

      await wrapper.vm.fetchRoute(789);
      expect(getRoutesMock).toHaveBeenCalledWith({ stationId: 1, productId: 789 });
    });
  });

  test('that if changeoverTime is left bracket time if comment is selected', () => {
    const leftBracketTime = '2020-02-02T15:05:00.000Z';
    const { wrapper } = createWrapper({
      storeOverrides: {
        firstSelectedSlice: { type: 'STOPPAGE', isProductChange: false, batchId: 1 },
        bracketRange: { selectedRange: [leftBracketTime, '2020-02-02T16:05:00.000Z'] },
      },
    });
    expect(wrapper.vm.changeoverTime).toEqual(leftBracketTime);
  });

  test('that changeoverTime is sliceStartTm if PRODUCT slice is selected', () => {
    const leftBracketTime = '2020-02-02T15:05:00.000Z';
    const { wrapper } = createWrapper({
      storeOverrides: {
        firstSelectedSlice: { type: 'PRODUCT', isProductChange: false, batchId: 1, sliceStartTmISO: '2020-02-02T15:04:00.000Z' },
        bracketRange: { selectedRange: [leftBracketTime, '2020-02-02T16:05:00.000Z'] },
      },
    });
    expect(wrapper.vm.changeoverTime).toEqual('2020-02-02T15:04:00.000Z');
  });

  test('that delete button is not visible if firstSelectedSlice is not productChange', () => {
    const { wrapper } = createWrapper({
      storeOverrides: { firstSelectedSlice: { type: 'STOPPAGE', isProductChange: false, batchId: 1 } },
    });
    expect(wrapper.find('#delete-button').exists()).toBe(false);
  });

  test('that delete button is visible if firstSelectedSlice is productChange', () => {
    const { wrapper } = createWrapper({
      storeOverrides: { firstSelectedSlice: { type: 'STOPPAGE', isProductChange: true, batchId: 1 } },
    });
    expect(wrapper.find('#delete-button').exists()).toBe(true);
  });

  describe('dialogTitle', () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    it('returns Add changeover + changeover time if product tab is active, product is not selected and firsSelectedSlice is not productChange', () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          productChangeTabs: ['products', 'orders'],
          firstSelectedSlice: { isProductChange: false },
        },
      });

      expect(wrapper.vm.dialogTitle).toBe('Add changeover 12:00');
    });

    it('returns Add changeover + changeover time if orders tab is active, job is not selected and firsSelectedSlice is not productChange', () => {
      const { wrapper } = createWrapper({
        storeOverrides: { firstSelectedSlice: { isProductChange: false } },
      });

      expect(wrapper.vm.dialogTitle).toBe('Add changeover 12:00');
    });

    it('returns Edit changeover + changeover time if product tab is active, product is not selected and firsSelectedSlice is productChange', () => {
      const { wrapper } = createWrapper({
        storeOverrides: { productChangeTabs: ['products', 'orders'] },
      });

      expect(wrapper.vm.dialogTitle).toBe('Edit changeover 12:00');
    });

    it('returns Edit changeover + changeover time if orders tab is active, job is not selected and firsSelectedSlice is productChange', () => {
      const { wrapper } = createWrapper();

      expect(wrapper.vm.dialogTitle).toBe('Edit changeover 12:00');
    });

    it('returns product name + changeover time if product tab is active and product is selected', async () => {
      productApi.getProduct.mockReturnValueOnce({ id: 32, name: 'Test product', groupId: 1 });

      const { wrapper } = createWrapper({
        storeOverrides: {
          productChangeTabs: ['products', 'orders'],
          batches: new Map([{
            id: 1, productId: 32, startTimeISO: '2021-01-01T16:00:00.000Z', unitId: 'tk',
          }].map(((batch) => [batch.id, batch]))),
        },
      });

      await flushPromises();
      await wrapper.setData({ formData: { productId: 32 } });
      expect(wrapper.vm.dialogTitle).toBe('Test product 12:00');
    });

    it('returns job order number + changeover time if orders tab is active and job is selected', async () => {
      const { wrapper } = createWrapper();

      await flushPromises();
      await wrapper.setData({ formData: { jobId: 22 } });
      expect(wrapper.vm.dialogTitle).toBe('order-number 12:00');
    });
  });

  test('that when selected group ID is updated then productApi.getProducts are called', async () => {
    const { wrapper } = createWrapper();
    await flushPromises();
    wrapper.vm.selectedGroupId = 14;

    await flushPromises();
    expect(getProductsMock).toHaveBeenCalledTimes(1);
    expect(getProductsMock).toHaveBeenCalledWith({ stationId: 1, limit: 300, groupId: 14 });
  });

  test('that preference for alternative unit usage is taken from localStorage', async () => {
    window.localStorage.getItem.mockReturnValue('true');

    const { wrapper } = createWrapper();
    await flushPromises();
    getUnitId.mockReturnValue('box');

    expect(wrapper.vm.preferAltUnit).toBe(true);
    expect(getUnitId).toHaveBeenCalledWith(expect.any(Object), true);
  });

  describe('getItemSku', () => {
    it('returns sku if product tab is active and sku and name are not equal', () => {
      const { wrapper } = createWrapper({
        storeOverrides: { productChangeTabs: ['products', 'orders'] },
      });

      wrapper.setData({ tab: 0 });

      expect(wrapper.vm.getItemSku({ sku: 'sku', name: 'name' })).toBe('sku');
    });

    it('returns empty string if product tab is active and sku and name are equal', () => {
      const { wrapper } = createWrapper({
        storeOverrides: { productChangeTabs: ['products', 'orders'] },
      });

      wrapper.setData({ tab: 0 });

      expect(wrapper.vm.getItemSku({ sku: 'string', name: 'string' })).toBe('');
    });

    it('returns productSku if orders tab is visible', () => {
      const { wrapper } = createWrapper({
        storeOverrides: { productChangeTabs: ['products', 'orders'] },
      });

      wrapper.setData({ tab: 1 });

      expect(wrapper.vm.getItemSku({ productSku: 'sku' })).toBe('sku');
    });
  });

  test('productsWithSkuModifications when selectedProduct is in search result', async () => {
    const { wrapper } = createWrapper({
      storeOverrides: { productChangeTabs: ['products', 'orders'] },
    });

    await wrapper.setData({
      searchItems: [
        { id: 1, name: 'product 1', sku: '' },
        { id: 2, name: 'product 2', sku: 'product 2' },
        { id: 3, name: 'product 1', sku: '009663' },
        { id: 4, name: 'product 4' },
      ],
      selectedProduct: { id: 3, name: 'product 1', sku: '009663' },
    });

    expect(wrapper.vm.productsWithSkuModifications).toEqual([
      { id: 1, name: 'product 1', sku: '' },
      { id: 2, name: 'product 2', sku: '' },
      { id: 3, name: 'product 1', sku: '009663' },
      { id: 4, name: 'product 4', sku: '' },
    ]);
  });

  test('productsWithSkuModifications when selectedProduct is not in search result', async () => {
    const { wrapper } = createWrapper({
      storeOverrides: { productChangeTabs: ['products', 'orders'] },
    });

    await wrapper.setData({
      searchItems: [
        { id: 1, name: 'product 1', sku: '' },
        { id: 2, name: 'product 2', sku: 'product 2' },
        { id: 3, name: 'product 1', sku: '009663' },
        { id: 4, name: 'product 4' },
      ],
      selectedProduct: { id: 5, name: 'product 5', sku: '5555' },
    });

    expect(wrapper.vm.productsWithSkuModifications).toEqual([
      { id: 1, name: 'product 1', sku: '' },
      { id: 2, name: 'product 2', sku: '' },
      { id: 3, name: 'product 1', sku: '009663' },
      { id: 4, name: 'product 4', sku: '' },
      { id: 5, name: 'product 5', sku: '5555' },
    ]);
  });

  test('that selectedProduct is set on mount when editing changeover', async () => {
    const { wrapper } = createWrapper({
      storeOverrides: {
        firstSelectedSlice: {
          isProductChange: true, productId: 2, batchId: 1,
        },
        productChangeTabs: ['products'],
      },
    });

    await flushPromises();

    expect(wrapper.vm.selectedProduct).toEqual({ id: 12, name: 'Product1' });
  });

  describe('getSelectedProduct', () => {
    it('does not call getProductById if product exists in products array, but just returns it', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          productChangeTabs: ['products'],
          firstSelectedSlice: { isProductChange: false, batchId: 7 },
        },
      });

      await flushPromises();
      await wrapper.setData({ products: [{ id: 1, name: 'product 1' }, { id: 2, name: 'product 2' }], formData: { productId: 2 } });

      await flushPromises();
      const getProductById = vi.spyOn(wrapper.vm, 'getProductById');
      const selectedProduct = await wrapper.vm.getSelectedProduct();
      expect(selectedProduct).toEqual({ id: 2, name: 'product 2' });
      expect(getProductById).toHaveBeenCalledTimes(0);
    });

    it('does not call getProductById if product exists in searchItems array, but just returns it', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          productChangeTabs: ['products'],
          firstSelectedSlice: { isProductChange: false, batchId: 7 },
        },
      });

      await flushPromises();

      await wrapper.setData({ products: [], searchItems: [{ id: 1, name: 'product 1' }, { id: 2, name: 'product 2' }], formData: { productId: 2 } });

      await flushPromises();

      const getProductById = vi.spyOn(wrapper.vm, 'getProductById');
      const selectedProduct = await wrapper.vm.getSelectedProduct();
      expect(selectedProduct).toEqual({ id: 2, name: 'product 2' });
      expect(getProductById).toHaveBeenCalledTimes(0);
    });

    it('queries the product if it does not exist in the products array and then returns it', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          productChangeTabs: ['products'],
          firstSelectedSlice: { isProductChange: false, batchId: 7 },
        },
      });

      await wrapper.setData({
        products: [{ id: 1, name: 'product 1' }, { id: 2, name: 'product 2' }],
        searchItems: [],
        formData: { productId: 3 },
      });

      const getProductById = vi.spyOn(wrapper.vm, 'getProductById');
      getProductById.mockReturnValueOnce({ id: 3, name: 'product 3' });

      await flushPromises();

      const calledTimes = getProductById.mock.calls.length;
      const selectedProduct = await wrapper.vm.getSelectedProduct();
      expect(selectedProduct).toEqual({ id: 3, name: 'product 3' });
      expect(getProductById).toHaveBeenCalledTimes(calledTimes + 1);
      expect(getProductById).toHaveBeenLastCalledWith(3);
    });
  });

  describe('conditional validation', () => {
    it('disables save button if requireLotBatch is true and lotCode is empty', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: { lineviewStation: {
          id: 1, requireLotBatch: true,
        } },
      });
      await flushPromises();

      await wrapper.setData({ formData: { lotCode: '' } });
      expect(wrapper.vm.isSaveBtnDisabled).toBe(true);

      await wrapper.setData({ formData: { lotCode: 'some-lot' } });
      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });

    it('disables save button if requireChangeoverNote is true and notes is empty', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: { lineviewStation: {
          id: 1, requireChangeoverNote: true,
        } },
      });
      await flushPromises();

      await wrapper.setData({ formData: { notes: '' } });
      expect(wrapper.vm.isSaveBtnDisabled).toBe(true);

      await wrapper.setData({ formData: { notes: 'some-note' } });
      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });

    it('enables save button if requirements are met', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: { lineviewStation: {
          id: 1, requireLotBatch: true, requireChangeoverNote: true,
        } },
      });
      await flushPromises();

      await wrapper.setData({ formData: { lotCode: 'lot1', notes: 'note1' } });
      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });

    it('does not require lotCode when requireLotBatch is false', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: { lineviewStation: {
          id: 1, requireLotBatch: false,
        } },
      });
      await flushPromises();

      await wrapper.setData({ formData: { lotCode: '', notes: 'some-note' } });
      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });

    it('does not require notes when requireChangeoverNote is false', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: { lineviewStation: {
          id: 1, requireChangeoverNote: false,
        } },
      });
      await flushPromises();

      await wrapper.setData({ formData: { notes: '', lotCode: 'some-lot' } });
      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });
  });

  describe('selectedBatch', () => {
    it('returns empty object if batches map does not have selected slice batchId', () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          firstSelectedSlice: { batchId: 99 },
          batches: new Map([[1, {
            id: 1, productId: 12, startTimeISO: '2021-01-01T12:00:00.000Z', unitId: 'tk',
          }]]),
        },
      });

      expect(wrapper.vm.selectedBatch).toEqual({});
    });

    it('returns batch object that matches selected slice batchId', () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          firstSelectedSlice: { batchId: 1 },
          batches: new Map([[1, {
            id: 1, productId: 12, startTimeISO: '2021-01-01T12:00:00.000Z', unitId: 'tk',
          }]]),
        },
      });

      expect(wrapper.vm.selectedBatch).toEqual({
        id: 1, productId: 12, startTimeISO: '2021-01-01T12:00:00.000Z', unitId: 'tk',
      });
    });
  });

  describe('initialPlannedQty', () => {
    it('returns null if selectedBatch has plannedQty as 0', () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          firstSelectedSlice: { batchId: 1 },
          batches: new Map([[1, {
            id: 1, productId: 12, startTimeISO: '2021-01-01T12:00:00.000Z', unitId: 'tk', plannedQty: 0,
          }]]),
        },
      });

      expect(wrapper.vm.initialPlannedQty).toBeNull();
    });

    it('returns correct plannedQty if selectedBatch has plannedQty', () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          firstSelectedSlice: { batchId: 1 },
          batches: new Map([[1, {
            id: 1, productId: 12, startTimeISO: '2021-01-01T12:00:00.000Z', unitId: 'tk', plannedQty: 5,
          }]]),
        },
      });

      altUnitConversion.mockReturnValue(5);
      expect(wrapper.vm.initialPlannedQty).toBe(5);
    });
  });

  describe('isSaveBtnDisabled', () => {
    it('returns true if product tab is active and formData.productId is not set', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          productChangeTabs: ['products', 'orders'],
          firstSelectedSlice: { batchId: 1, isProductChange: true },
          batches: new Map([[1, {
            id: 1, productId: 12, startTimeISO: '2021-01-01T12:00:00.000Z', unitId: 'tk', plannedQty: 5,
          }]]),
        },
      });

      await flushPromises();
      wrapper.vm.formData.productId = null;
      expect(wrapper.vm.isProductTabActive).toBe(true);
      expect(wrapper.vm.isSaveBtnDisabled).toBe(true);
    });

    it('returns true if orders tab is active and formData.jobId is not set', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          productChangeTabs: ['products', 'orders'],
          firstSelectedSlice: { batchId: 1, isProductChange: true },
          batches: new Map([[1, {
            id: 1, startTimeISO: '2021-01-01T12:00:00.000Z', unitId: 'tk', plannedQty: 5, jobId: 99,
          }]]),
        },
      });

      await flushPromises();
      wrapper.vm.tab = 1;
      wrapper.vm.formData.jobId = null;
      expect(wrapper.vm.isProductTabActive).toBe(false);
      expect(wrapper.vm.isSaveBtnDisabled).toBe(true);
    });

    it('returns true if saveLoading is true', () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          productChangeTabs: ['products', 'orders'],
          firstSelectedSlice: { batchId: 1, isProductChange: true },
          batches: new Map([[1, {
            id: 1, productId: 12, startTimeISO: '2021-01-01T12:00:00.000Z', unitId: 'tk', plannedQty: 5,
          }]]),
        },
      });

      wrapper.vm.saveLoading = true;
      expect(wrapper.vm.isSaveBtnDisabled).toBe(true);
    });

    it('returns false if product tab is active and formData.productId is not equal to initial productId', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          productChangeTabs: ['products', 'orders'],
          firstSelectedSlice: { batchId: 1, isProductChange: true },
          batches: new Map([[1, {
            id: 1, productId: 12, startTimeISO: '2021-01-01T12:00:00.000Z', unitId: 'tk', plannedQty: 5, notes: 'note',
          }]]),
        },
      });

      await flushPromises();
      wrapper.vm.formData.productId = 99;
      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });

    it('returns false if orders tab is active and formData.jobId is not equal to initial jobId', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          productChangeTabs: ['products', 'orders'],
          firstSelectedSlice: { batchId: 1, isProductChange: true },
          batches: new Map([[1, {
            id: 1, startTimeISO: '2021-01-01T12:00:00.000Z', unitId: 'tk', plannedQty: 5, jobId: 12,
          }]]),
        },
      });

      await flushPromises();
      wrapper.vm.tab = 1;
      wrapper.vm.formData.jobId = 99;
      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });

    it('returns false if formData.plannedQty is not equal to initial plannedQty', async () => {
      altUnitConversion.mockReturnValue(5);
      const { wrapper } = createWrapper({
        storeOverrides: {
          productChangeTabs: ['products', 'orders'],
          firstSelectedSlice: { batchId: 1, isProductChange: true },
          batches: new Map([[1, {
            id: 1, productId: 12, startTimeISO: '2021-01-01T12:00:00.000Z', unitId: 'tk', plannedQty: 5, notes: 'note',
          }]]),
        },
      });

      await flushPromises();
      wrapper.vm.formData.plannedQty = 10;
      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });

    it('returns false if formData.notes is not equal to initial notes', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          productChangeTabs: ['products', 'orders'],
          firstSelectedSlice: { batchId: 1, isProductChange: true },
          batches: new Map([[1, {
            id: 1, productId: 12, startTimeISO: '2021-01-01T12:00:00.000Z', unitId: 'tk', plannedQty: 5, notes: 'note',
          }]]),
        },
      });

      await flushPromises();
      wrapper.vm.formData.notes = 'new note';
      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });

    it('returns false if formData.lotCode is not equal to initial lotCode', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          productChangeTabs: ['products', 'orders'],
          firstSelectedSlice: { batchId: 1, isProductChange: true },
          batches: new Map([[1, {
            id: 1, productId: 12, startTimeISO: '2021-01-01T12:00:00.000Z', unitId: 'tk', plannedQty: 5, notes: 'note', lotCode: 'lot', unitQty: 10,
          }]]),
        },
      });

      await flushPromises();
      wrapper.vm.formData.lotCode = 'new-lot';
      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });

    it('returns false if formData.unitQty is not equal to initial unitQty', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          productChangeTabs: ['products', 'orders'],
          lineviewStation: { id: 1, showUnitQty: true, zoneId: 'UTC' },
          firstSelectedSlice: { batchId: 1, isProductChange: true },
          batches: new Map([[1, {
            id: 1, productId: 12, startTimeISO: '2021-01-01T12:00:00.000Z', unitId: 'tk', plannedQty: 5, notes: 'note', lotCode: 'lot', unitQty: 10,
          }]]),
        },
      });

      await flushPromises();
      wrapper.vm.formData.unitQty = 20;
      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });

    it('returns false if formData.unitId is not equal to initial unitId', async () => {
      getUnitId.mockReturnValue('tk');
      const { wrapper } = createWrapper({
        storeOverrides: {
          productChangeTabs: ['products', 'orders'],
          firstSelectedSlice: { batchId: 1, isProductChange: true },
          batches: new Map([[1, {
            id: 1, productId: 12, startTimeISO: '2021-01-01T12:00:00.000Z', unitId: 'tk', plannedQty: 5, notes: 'note', lotCode: 'lot', unitQty: 10,
          }]]),
        },
      });

      await flushPromises();
      wrapper.vm.formData.unitId = 'new-unit';
      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });

    it('returns false if product tab is active, formData values are same as initial values, but firstSelectedSlice is not productChange', async () => {
      getUnitId.mockReturnValue('tk');
      altUnitConversion.mockReturnValue(5);
      const { wrapper } = createWrapper({
        storeOverrides: {
          productChangeTabs: ['products', 'orders'],
          lineviewStation: { id: 1, showUnitQty: true, zoneId: 'UTC' },
          firstSelectedSlice: { batchId: 1, isProductChange: false },
          batches: new Map([[1, {
            id: 1, productId: 12, startTimeISO: '2021-01-01T12:00:00.000Z', unitId: 'tk', plannedQty: 5, notes: 'note', lotCode: 'lot', unitQty: 10,
          }]]),
        },
      });

      await flushPromises();
      wrapper.vm.formData = {
        productId: 12, plannedQty: 5, notes: 'note', lotCode: 'lot', unitQty: 10, unitId: 'tk',
      };
      expect(wrapper.vm.isProductTabActive).toBe(true);
      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });

    it('returns true if product tab is active and formData productId, plannedQty, notes, lotCode, unitQty and unitId are same as initial values', async () => {
      getUnitId.mockReturnValue('tk');
      altUnitConversion.mockReturnValue(5);
      const { wrapper } = createWrapper({
        storeOverrides: {
          productChangeTabs: ['products', 'orders'],
          lineviewStation: { id: 1, showUnitQty: true, zoneId: 'UTC' },
          firstSelectedSlice: { batchId: 1, isProductChange: true },
          batches: new Map([[1, {
            id: 1, productId: 12, startTimeISO: '2021-01-01T12:00:00.000Z', unitId: 'tk', plannedQty: 5, notes: 'note', lotCode: 'lot', unitQty: 10,
          }]]),
        },
      });

      await flushPromises();
      expect(wrapper.vm.isProductTabActive).toBe(true);
      expect(wrapper.vm.formData.productId).toBe(12);
      expect(wrapper.vm.formData.plannedQty).toBe(5);
      expect(wrapper.vm.formData.notes).toBe('note');
      expect(wrapper.vm.formData.lotCode).toBe('lot');
      expect(wrapper.vm.formData.unitQty).toBe(10);
      expect(wrapper.vm.formData.unitId).toBe('tk');
      expect(wrapper.vm.isSaveBtnDisabled).toBe(true);
    });

    it('returns false if orders tab is active, formData values are same as initial values, but firstSelectedSlice is not productChange', async () => {
      getUnitId.mockReturnValue('tk');
      productApi.getOrders = vi.fn(() => [{ id: 12, productId: 77, orderNumber: 'order-123' }]);
      const { wrapper } = createWrapper({
        storeOverrides: {
          productChangeTabs: ['products', 'orders'],
          lineviewStation: { id: 1, showUnitQty: true, zoneId: 'UTC' },
          firstSelectedSlice: { batchId: 1, isProductChange: false },
          batches: new Map([[1, {
            id: 1, productionOrder: 'order-123', startTimeISO: '2021-01-01T12:00:00.000Z', unitId: 'tk', notes: 'note', lotCode: 'lot', unitQty: 10,
          }]]),
        },
      });

      await flushPromises();
      wrapper.vm.tab = 1;
      wrapper.vm.formData = {
        jobId: 12, notes: 'note', lotCode: 'lot', unitQty: 10, unitId: 'tk',
      };
      expect(wrapper.vm.isProductTabActive).toBe(false);
      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });

    it('returns true if orders tab is active and formData jobId, notes, lotCode and unitQty are same as initial values', async () => {
      getUnitId.mockReturnValue('tk');
      productApi.getOrders = vi.fn(() => [{ id: 12, productId: 77, orderNumber: 'order-123' }]);
      const { wrapper } = createWrapper({
        storeOverrides: {
          productChangeTabs: ['products', 'orders'],
          lineviewStation: { id: 1, showUnitQty: true, zoneId: 'UTC' },
          firstSelectedSlice: { batchId: 1, isProductChange: true },
          batches: new Map([[1, {
            id: 1, productionOrder: 'order-123', startTimeISO: '2021-01-01T12:00:00.000Z', unitId: 'tk', notes: 'note', lotCode: 'lot', unitQty: 10,
          }]]),
        },
      });

      await flushPromises();
      wrapper.vm.tab = 1;
      expect(wrapper.vm.isProductTabActive).toBe(false);
      expect(wrapper.vm.formData.jobId).toBe(12);
      expect(wrapper.vm.formData.notes).toBe('note');
      expect(wrapper.vm.formData.lotCode).toBe('lot');
      expect(wrapper.vm.formData.unitQty).toBe(10);
      expect(wrapper.vm.formData.unitId).toBe('tk');
      expect(wrapper.vm.isSaveBtnDisabled).toBe(true);
    });

    it('returns false if product tab is active and isSameRoute is false', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          productChangeTabs: ['products', 'orders'],
          firstSelectedSlice: { batchId: 1, isProductChange: true },
          batches: new Map([[1, {
            id: 1, productId: 12, startTimeISO: '2021-01-01T12:00:00.000Z', unitId: 'tk', plannedQty: 5, notes: 'note', lotCode: 'lot', unitQty: 10,
          }]]),
        },
      });
      await flushPromises();
      expect(wrapper.vm.isSaveBtnDisabled).toBe(false);
    });
  });

  describe('isSameRoute', () => {
    it('returns false if formData productId is not the same as selected batch productId', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          firstSelectedSlice: { batchId: 1, isProductChange: true },
          batches: new Map([[1, {
            id: 1, productId: 12, cycleTimeCritical: 120, cycleTimeGood: 60, unitConversion: 1, unitConversionType: 'MAIN_TO_ALT', unitQty: 1, scrapUnitQty: 1,
          }]]),
        },
      });
      await flushPromises();
      wrapper.setData({
        formData: { productId: 99 },
      });

      expect(wrapper.vm.isSameRoute).toBe(false);
    });

    it('returns true if formData productId is the same as selected batch productId and route has not changed', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          firstSelectedSlice: { batchId: 1, isProductChange: true },
          batches: new Map([[1, {
            id: 1, productId: 12, cycleTimeCritical: 120, cycleTimeGood: 60, unitConversion: 1, unitConversionType: 'MAIN_TO_ALT', unitQty: 1, scrapUnitQty: 1,
          }]]),
        },
      });
      await flushPromises();
      wrapper.setData({
        formData: { productId: 12 },
        route: {
          id: 1, productId: 12, cycleTimeCritical: 120, cycleTimeGood: 60, unitConversion: 1, unitConversionType: 'MAIN_TO_ALT', unitQty: 1, scrapUnitQty: 1,
        },
      });

      expect(wrapper.vm.isSameRoute).toBe(true);
    });

    it('returns false if formData productId is the same as selected batch productId and route has changed', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          firstSelectedSlice: { batchId: 1, isProductChange: true },
          batches: new Map([[1, {
            id: 1, productId: 12, cycleTimeCritical: 120, cycleTimeGood: 60, unitConversion: 1, unitConversionType: 'MAIN_TO_ALT', unitQty: 1, scrapUnitQty: 1,
          }]]),
        },
      });
      await flushPromises();
      wrapper.setData({
        tab: 0,
        formData: { productId: 12 },
        route: {
          id: 1, productId: 12, cycleTimeCritical: 60, cycleTimeGood: 30, unitConversion: 1, unitConversionType: 'MAIN_TO_ALT', unitQty: 1, scrapUnitQty: 1,
        },
      });

      expect(wrapper.vm.isSameRoute).toBe(false);
    });
  });
});

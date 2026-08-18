import { shallowMount, mount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { mdiPencil, mdiContentDuplicate, mdiDelete } from '@mdi/js';
import { nextTick } from 'vue';

import SettingsProductEdit from './index.vue';

import useConfirmDialogStore from '@/stores/confirmDialog';
import routesApi from '@/api/routesApi';
import productApi from '@/api/productApi';

vi.mock('@/api/productApi');
productApi.getUnitIds = vi.fn(() => []);
vi.mock('@/api/routesApi');
routesApi.getRoutes = () => [{ id: 1, stationId: 1, runTimeType: 'SECOND_PER_UNIT' }, { id: 2, stationId: 2, runTimeType: 'SECOND_PER_UNIT' }];
const putRoute = vi.fn();
routesApi.putRoute = putRoute;
const postRoute = vi.fn();
routesApi.postRoute = postRoute;
const deleteRoute = vi.fn();
routesApi.deleteRoute = deleteRoute;

const stationsMockData = [
  {
    id: 1, name: 'station 1', factoryId: 1, groupId: 2,
  },
  {
    id: 2, name: 'station 2', factoryId: 2, groupId: 1,
  },
  {
    id: 3, name: 'station 3', factoryId: 2, groupId: 2,
  },
];

const productGroupsMockData = [
  { id: 1, name: 'test group 1', local: true, factoryIds: [1] },
  { id: 2, name: 'test group 2', local: false },
  { id: 3, name: 'test group 3', local: true, factoryIds: [2] },
  { id: 4, name: 'test group 4', local: false },
];

const defaultPiniaInitialState = {
  profile: {
    highestUserRole: 'COMPANY_ADMIN',
    currentUser: { roles: { 0: 'COMPANY_ADMIN' } },
  },
  product: {
    productGroups: productGroupsMockData,
    products: [{ id: 123, name: 'test product', groupId: 1 }],
  },
  station: {
    stations: stationsMockData,
  },
  factory: {
    factories: [{ id: 1, stations: [] }],
  },
};

const $t = (msg) => {
  if (msg === 'SECOND_PER_{unit}') return 'sec/{unit}';
  if (msg === '{unit}_PER_SECOND') return '{unit}/sec';
  return msg;
};
const $route = { params: {}, query: {} };
const $router = { push: vi.fn() };

describe('SettingsProductEdit', () => {
  let pinia;
  beforeEach(() => {
    pinia = createTestingPinia({ createSpy: vi.fn, initialState: defaultPiniaInitialState });
    vi.clearAllMocks();
  });

  it('renders correctly when selected product is not in productsMap', async () => {
    const wrapper = shallowMount(SettingsProductEdit, {
      global: {
        mocks: { $t, $route: { params: { id: 1 } } },
        plugins: [pinia],
        stubs: { 'form-page-template': false },
      },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when adding new', async () => {
    const wrapper = shallowMount(SettingsProductEdit, {
      global: {
        mocks: { $t, $route },
        plugins: [pinia],
        stubs: { 'form-page-template': false },
      },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when editing existing', async () => {
    const wrapper = shallowMount(SettingsProductEdit, {
      global: {
        mocks: { $t, $route: { params: { id: 123 }, query: {} } },
        plugins: [pinia],
        stubs: { 'form-page-template': false },
      },
    });

    wrapper.vm.getProduct = vi.fn().mockReturnValueOnce({
      alternativeUnitId: 'alt', groupId: 1, id: 123, name: 'a good product', sku: 'SKU23', stationIds: [1], unitId: 'unit',
    });
    await flushPromises();
    await wrapper.setData({
      routesFormData: [{ stationId: 1, runTimeType: 'SECOND_PER_UNIT' }, { stationId: 2, runTimeType: 'SECOND_PER_UNIT' }],
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when edit is forbidden', async () => {
    const localPinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        ...defaultPiniaInitialState,
        profile: { ...defaultPiniaInitialState.profile, highestUserRole: 'FACTORY_ADMIN' },
      },
    });
    const wrapper = shallowMount(SettingsProductEdit, {
      computed: {
        ...SettingsProductEdit.computed,
        editForbidden() {
          return true;
        },
      },
      global: {
        plugins: [localPinia],
        mocks: { $t, $route: { params: { id: 123 }, query: {} } },
        stubs: { 'form-page-template': false },
      },
    });
    wrapper.vm.editForbidden = true;
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correcly when editing and getStationDifference is not empty', async () => {
    const wrapper = shallowMount(SettingsProductEdit, {
      computed: {
        ...SettingsProductEdit.computed,
        stationsToBeRemoved: () => [1],
      },
      global: {
        plugins: [pinia],
        mocks: { $t, $route: { params: { id: 123 }, query: {} } },
        stubs: { 'form-page-template': false },
      },
    });

    wrapper.vm.getProduct = vi.fn().mockReturnValueOnce({
      alternativeUnitId: 'alt', groupId: 1, id: 123, name: 'a good product', sku: 'SKU23', stationIds: [1], unitId: 'unit',
    });
    await flushPromises();
    await wrapper.setData({
      routesFormData: [{ stationId: 1, runTimeType: 'SECOND_PER_UNIT' }, { stationId: 2, runTimeType: 'SECOND_PER_UNIT' }],
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that stationCardButtons array has delete, duplicate and edit actions', () => {
    const wrapper = shallowMount(SettingsProductEdit, {
      global: {
        plugins: [pinia],
        mocks: { $t, $route },
      },
    });

    expect(wrapper.vm.stationCardButtons.length).toBe(3);
    expect(wrapper.vm.stationCardButtons[0]).toEqual({
      icon: mdiPencil,
      text: 'Edit',
      tooltip: 'Edit',
      action: expect.any(Function),
    });
    expect(wrapper.vm.stationCardButtons[1]).toEqual({
      icon: mdiContentDuplicate,
      text: 'Duplicate',
      tooltip: 'Duplicate',
      action: expect.any(Function),
    });
    expect(wrapper.vm.stationCardButtons[2]).toEqual({
      icon: mdiDelete,
      text: 'Delete',
      tooltip: 'Delete',
      action: expect.any(Function),
    });
  });

  test('filteredGroups when user can edit global groups', async () => {
    const wrapper = shallowMount(SettingsProductEdit, {
      global: {
        plugins: [pinia],
        mocks: { $t, $route },
      },
    });
    await flushPromises();

    expect(wrapper.vm.filteredGroups).toEqual(productGroupsMockData);
  });

  test('filteredGroups in product adding when user cannot edit global groups', async () => {
    const localPinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        ...defaultPiniaInitialState,
        profile: { ...defaultPiniaInitialState.profile, highestUserRole: 'FACTORY_ADMIN' },
      },
    });
    const wrapper = shallowMount(SettingsProductEdit, {
      global: {
        plugins: [localPinia],
        mocks: { $t, $route },
      },
    });
    await flushPromises();

    expect(wrapper.vm.filteredGroups).toEqual(productGroupsMockData.filter((g) => g.local));
  });

  test('filteredGroups in local groups product edit when user cannot edit global groups', async () => {
    const localPinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        ...defaultPiniaInitialState,
        profile: { ...defaultPiniaInitialState.profile, highestUserRole: 'FACTORY_ADMIN' },
      },
    });
    const wrapper = shallowMount(SettingsProductEdit, {
      global: {
        plugins: [localPinia],
        mocks: { $t, $route: { params: { id: 123 }, query: {} } },
      },
      getters: {
        isEdit() {
          return true;
        },
      },
    });

    await wrapper.setData({ formData: { groupId: 1 } });

    expect(wrapper.vm.filteredGroups).toEqual(productGroupsMockData.filter((g) => g.local));
  });

  test('filteredGroups in global groups product edit when user cannot edit global groups', async () => {
    const localPinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        ...defaultPiniaInitialState,
        profile: { ...defaultPiniaInitialState.profile, highestUserRole: 'FACTORY_ADMIN' },
      },
    });
    const wrapper = shallowMount(SettingsProductEdit, {
      global: {
        plugins: [localPinia],
        mocks: { $t, $route: { params: { id: 123 }, query: {} } },
      },
      getters: {
        isEdit() {
          return true;
        },
      },
    });

    await wrapper.setData({ formData: { groupId: 2 } });

    expect(wrapper.vm.filteredGroups).toEqual(productGroupsMockData.filter((g) => g.local || g.id === 2));
  });

  test('that hasUnsavedRoutes is false by default', () => {
    const wrapper = shallowMount(SettingsProductEdit, {
      global: {
        plugins: [pinia],
        mocks: { $t, $route },
      },
    });

    expect(wrapper.vm.hasUnsavedRoutes).toBe(false);
  });

  test('that beforeRouteEnter sets itemGroupId from params if it exists', async () => {
    const wrapper = shallowMount(SettingsProductEdit, {
      global: {
        plugins: [pinia],
        mocks: { $route: { params: {} } },
      },
    });
    expect(wrapper.vm.groupId).toBeUndefined();
    await wrapper.vm.$options.beforeRouteEnter.call(wrapper.vm, { query: { itemGroupId: 2 }, params: {} }, null, (cb) => cb(wrapper.vm));
    expect(wrapper.vm.formData.groupId).toBe(2);
  });

  test('beforeRouteLeave allows to leave if no rute changes has been made', () => {
    const wrapper = shallowMount(SettingsProductEdit, {
      global: {
        plugins: [pinia],
        mocks: { $t, $route },
      },
    });

    const { beforeRouteLeave } = wrapper.vm.$options;
    const nextFun = vi.fn();

    beforeRouteLeave.call(wrapper.vm, 'toObj', 'fromObj', nextFun);

    expect(nextFun).toBeCalledTimes(1);
  });

  test('beforeRouteLeave calls promptSavingRouteChanges if hasUnsavedRoutes is true', () => {
    const wrapper = shallowMount(SettingsProductEdit, {
      global: {
        plugins: [pinia],
        mocks: { $t, $route },
      },
      data: () => ({ hasUnsavedRoutes: true }),
    });

    const { beforeRouteLeave } = wrapper.vm.$options;
    const spy = vi.spyOn(wrapper.vm, 'promptSavingRouteChanges');

    beforeRouteLeave.call(wrapper.vm, 'toObj', 'fromObj', vi.fn());

    expect(spy).toBeCalledTimes(1);
  });

  test('that promptSavingRouteChanges opens confirmation dialog', () => {
    const wrapper = shallowMount(SettingsProductEdit, {
      global: {
        plugins: [pinia],
        mocks: { $t, $route },
      },
    });

    const confirmDialogStore = useConfirmDialogStore();
    wrapper.vm.promptSavingRouteChanges();
    expect(confirmDialogStore.openConfirmDialog).toBeCalledTimes(1);
  });

  test('saveProductWithRoutes when form is valid and it is edit', async () => {
    const wrapper = shallowMount(SettingsProductEdit, {
      global: {
        plugins: [pinia],
        mocks: { $t, $router, $route: { params: { id: 1 }, query: {} } },
      },
    });
    const saveProduct = vi.fn();
    wrapper.vm.saveProduct = saveProduct;
    const saveProductRoutes = vi.spyOn(wrapper.vm, 'saveProductRoutes');
    await wrapper.vm.saveProductWithRoutes();
    expect(saveProduct).toHaveBeenCalledTimes(1);
    expect(saveProductRoutes).toHaveBeenCalledTimes(0);
  });

  test('saveProductWithRoutes when form is valid and it is not edit', async () => {
    const wrapper = shallowMount(SettingsProductEdit, {
      global: {
        plugins: [pinia],
        mocks: { $t, $route, $router },
      },
    });
    const saveProduct = vi.fn().mockReturnValueOnce({ id: 124, runTimeType: 'SECOND_PER_UNIT' });
    wrapper.vm.saveProduct = saveProduct;
    const saveProductRoutes = vi.spyOn(wrapper.vm, 'saveProductRoutes');
    await wrapper.vm.saveProductWithRoutes();
    expect(saveProduct).toHaveBeenCalledTimes(1);
    expect(saveProductRoutes).toHaveBeenCalledTimes(1);
  });

  test('onSave when form is invalid', async () => {
    const wrapper = shallowMount(SettingsProductEdit, {
      global: {
        plugins: [pinia],
        mocks: { $t, $route },
      },
    });

    const saveProduct = vi.fn();
    wrapper.vm.saveProduct = saveProduct;
    const saveProductRoutes = vi.spyOn(wrapper.vm, 'saveProductRoutes');
    await nextTick();
    await flushPromises();
    wrapper.getCurrentComponent().refs = {
      form: {
        validate: () => {
          wrapper.vm.valid = false;
        },
      },
    };

    const confirmDialogStore = useConfirmDialogStore();
    await wrapper.vm.onSave();
    expect(saveProduct).toHaveBeenCalledTimes(0);
    expect(saveProductRoutes).toHaveBeenCalledTimes(0);
    expect(confirmDialogStore.openConfirmDialog).toHaveBeenCalledTimes(0);
  });

  test('getRouteSubtitle returns correct value, if runTime is decimal number, conversion is 3, alt.unit is defined, runTimeType is SECOND_PER_UNIT and conversionType is ALT_TO_PRIMARY', async () => {
    const wrapper = shallowMount(SettingsProductEdit, {
      global: { plugins: [pinia], mocks: { $t, $route } },
    });

    await flushPromises();
    wrapper.vm.formData.unitId = 'test1';
    wrapper.vm.formData.alternativeUnitId = 'test2';

    const result = wrapper.vm.getRouteSubtitle({
      runTimeType: 'SECOND_PER_UNIT', runTime: 1.2345, unitConversion: 3, unitConversionType: 'ALT_TO_PRIMARY',
    });
    expect(result).toBe('1,2345 sec/test1 (0,4115 sec/test2)');
  });

  test('getRouteSubtitle returns correct value, if runTime is decimal number, conversion is 1, alt.unit is defined, runTimeType is UNIT_PER_SECOND and conversionType is PRIMARY_TO_ALT', async () => {
    const wrapper = shallowMount(SettingsProductEdit, {
      global: { plugins: [pinia], mocks: { $t, $route } },
    });

    await flushPromises();
    wrapper.vm.formData.unitId = 'test1';
    wrapper.vm.formData.alternativeUnitId = 'test2';

    const result = wrapper.vm.getRouteSubtitle({
      runTimeType: 'UNIT_PER_SECOND', runTime: 1.2345, unitConversion: 1, unitConversionType: 'PRIMARY_TO_ALT',
    });
    expect(result).toBe('1,2345 test1/sec (1,2345 test2/sec)');
  });

  test('getRouteSubtitle returns correct value, if runTime is decimal number, conversion is 3, alt.unit is defined, runTimeType is UNIT_PER_SECOND and conversionType is ALT_TO_PRIMARY', async () => {
    const wrapper = shallowMount(SettingsProductEdit, {
      global: { plugins: [pinia], mocks: { $t, $route } },
    });

    await flushPromises();
    wrapper.vm.formData.unitId = 'test1';
    wrapper.vm.formData.alternativeUnitId = 'test2';

    const result = wrapper.vm.getRouteSubtitle({
      runTimeType: 'UNIT_PER_SECOND', runTime: 1.2345, unitConversion: 3, unitConversionType: 'ALT_TO_PRIMARY',
    });
    expect(result).toBe('1,2345 test1/sec (3,7035 test2/sec)');
  });

  test('onRouteDelete when adding new product', () => {
    const wrapper = shallowMount(SettingsProductEdit, {
      global: {
        mocks: { $t, $route },
        plugins: [pinia],
      },
    });
    const routesMock = [{ id: 1, runTimeType: 'SECOND_PER_UNIT' }, { id: 2, runTimeType: 'SECOND_PER_UNIT' }, { id: 3, runTimeType: 'SECOND_PER_UNIT' }];
    wrapper.setData({ routesFormData: routesMock });
    wrapper.vm.onRouteDelete({ index: 1 });
    expect(wrapper.vm.routesFormData).toEqual([{ id: 1, runTimeType: 'SECOND_PER_UNIT' }, { id: 3, runTimeType: 'SECOND_PER_UNIT' }]);
    wrapper.vm.onRouteDelete({ index: 0 });
    expect(wrapper.vm.routesFormData).toEqual([{ id: 3, runTimeType: 'SECOND_PER_UNIT' }]);
  });

  test('onRouteDelete when editing existing product', () => {
    const wrapper = shallowMount(SettingsProductEdit, {
      global: {
        mocks: { $t, $route: { params: { id: 1 }, query: {} } },
        plugins: [pinia],
      },
    });
    const confirmDialogStore = useConfirmDialogStore();
    const routesMock = [{ id: 1 }, { id: 2 }, { id: 3 }];
    wrapper.setData({ routesFormData: routesMock });
    wrapper.vm.onRouteDelete({ item: { id: 3 }, index: 1 });
    expect(confirmDialogStore.openConfirmDialog).toBeCalledTimes(1);
  });

  test('saveProductRoutes when adding new product', () => {
    const wrapper = shallowMount(SettingsProductEdit, {
      global: {
        plugins: [pinia],
        mocks: { $t, $route },
      },
    });
    const routesMock = [{ id: 1, someProp: 'first' }, { id: 2, someProp: 'second' }, { id: 3, someProp: 'third' }];
    wrapper.setData({ routesFormData: routesMock });
    const saveRoute = vi.spyOn(wrapper.vm, 'saveRoute');
    wrapper.vm.saveProductRoutes({ id: 1234 });
    expect(saveRoute).toHaveBeenCalledTimes(3);
    expect(saveRoute).toHaveBeenCalledWith({ id: null, productId: 1234, someProp: 'first' });
    expect(saveRoute).toHaveBeenCalledWith({ id: null, productId: 1234, someProp: 'second' });
    expect(saveRoute).toHaveBeenCalledWith({ id: null, productId: 1234, someProp: 'third' });
  });

  test('updateRoute in product edit', async () => {
    const wrapper = shallowMount(SettingsProductEdit, {
      global: {
        plugins: [pinia],
        mocks: { $t, $route: { params: { id: 1 }, query: {} } },
      },
    });
    wrapper.setData({ formData: { id: 12344 } });
    const saveRoute = vi.spyOn(wrapper.vm, 'saveRoute').mockReturnValueOnce({ id: 123, stationId: 4, runTimeType: 'SECOND_PER_UNIT' });
    const notifySuccess = vi.spyOn(wrapper.vm, 'notifySuccess');
    const updateRouteInList = vi.spyOn(wrapper.vm, 'updateRouteInList');

    await wrapper.vm.updateRoute({ id: 123, stationId: 4, runTimeType: 'SECOND_PER_UNIT' }, 3);
    expect(saveRoute).toHaveBeenCalledTimes(1);
    expect(saveRoute).toHaveBeenCalledWith({
      id: 123, stationId: 4, productId: 12344, runTimeType: 'SECOND_PER_UNIT',
    });
    expect(notifySuccess).toHaveBeenCalledTimes(1);
    expect(notifySuccess).toHaveBeenCalledWith('The changes will take effect after the next changeover');
    expect(updateRouteInList).toHaveBeenCalledTimes(1);
    expect(updateRouteInList).toHaveBeenCalledWith({ id: 123, stationId: 4, runTimeType: 'SECOND_PER_UNIT' }, 3);
  });

  test('updateRoute when adding new product', () => {
    const wrapper = shallowMount(SettingsProductEdit, {
      global: {
        plugins: [pinia],
        mocks: { $t, $route },
      },
    });
    wrapper.setData({ formData: { id: 12344 } });
    const saveRoute = vi.spyOn(wrapper.vm, 'saveRoute').mockReturnValueOnce({ id: 123, stationId: 4, runTimeType: 'SECOND_PER_UNIT' });
    const notifySuccess = vi.spyOn(wrapper.vm, 'notifySuccess');
    const updateRouteInList = vi.spyOn(wrapper.vm, 'updateRouteInList');

    expect(wrapper.vm.hasUnsavedRoutes).toBe(false);

    wrapper.vm.updateRoute({ id: 123, stationId: 4, runTimeType: 'SECOND_PER_UNIT' }, 3);
    expect(saveRoute).toHaveBeenCalledTimes(0);
    expect(notifySuccess).toHaveBeenCalledTimes(0);
    expect(updateRouteInList).toHaveBeenCalledTimes(1);
    expect(updateRouteInList).toHaveBeenCalledWith({ id: 123, stationId: 4, runTimeType: 'SECOND_PER_UNIT' }, 3);
    expect(wrapper.vm.hasUnsavedRoutes).toBe(true);
  });

  test('updateRouteInList', () => {
    const wrapper = shallowMount(SettingsProductEdit, {
      global: {
        plugins: [pinia],
        mocks: { $t, $route },
      },
    });
    expect(wrapper.vm.routesFormData).toEqual([]);
    wrapper.vm.updateRouteInList({ id: 1, runTimeType: 'SECOND_PER_UNIT' }, undefined);
    expect(wrapper.vm.routesFormData).toEqual([{ id: 1, runTimeType: 'SECOND_PER_UNIT' }]);
    wrapper.vm.updateRouteInList({ id: 2, runTimeType: 'SECOND_PER_UNIT' }, undefined);
    expect(wrapper.vm.routesFormData).toEqual([{ id: 1, runTimeType: 'SECOND_PER_UNIT' }, { id: 2, runTimeType: 'SECOND_PER_UNIT' }]);
    wrapper.vm.updateRouteInList({ id: 3, runTimeType: 'SECOND_PER_UNIT' }, 0);
    expect(wrapper.vm.routesFormData).toEqual([{ id: 3, runTimeType: 'SECOND_PER_UNIT' }, { id: 2, runTimeType: 'SECOND_PER_UNIT' }]);
    wrapper.vm.updateRouteInList({ id: 4, runTimeType: 'SECOND_PER_UNIT' }, 1);
    expect(wrapper.vm.routesFormData).toEqual([{ id: 3, runTimeType: 'SECOND_PER_UNIT' }, { id: 4, runTimeType: 'SECOND_PER_UNIT' }]);
  });

  test('saveRoute', async () => {
    const wrapper = shallowMount(SettingsProductEdit, {
      global: {
        plugins: [pinia],
        mocks: { $t, $route },
      },
    });
    expect(postRoute).toHaveBeenCalledTimes(0);
    expect(putRoute).toHaveBeenCalledTimes(0);
    await wrapper.vm.saveRoute({ prop: 'testing prop', runTimeType: 'SECOND_PER_UNIT' });
    expect(postRoute).toHaveBeenCalledTimes(1);
    expect(postRoute).toHaveBeenCalledWith({ prop: 'testing prop', runTimeType: 'SECOND_PER_UNIT' });
    expect(putRoute).toHaveBeenCalledTimes(0);
    await wrapper.vm.saveRoute({ id: 123, prop: 'testing prop', runTimeType: 'SECOND_PER_UNIT' });
    expect(postRoute).toHaveBeenCalledTimes(1);
    expect(putRoute).toHaveBeenCalledTimes(1);
    expect(putRoute).toHaveBeenCalledWith({ id: 123, prop: 'testing prop', runTimeType: 'SECOND_PER_UNIT' });
  });

  test('onConfirmDeleteRoute', async () => {
    const wrapper = shallowMount(SettingsProductEdit, {
      computed: {
        ...SettingsProductEdit.computed,
        isEdit: () => true,
      },
      global: {
        mocks: { $t, $route },
        plugins: [pinia],
      },
    });
    const routesMock = [{ id: 1, someProp: 'first' }, { id: 2, someProp: 'second' }, { id: 3, someProp: 'third' }];
    await wrapper.setData({ routesFormData: routesMock });

    const notifySucces = vi.spyOn(wrapper.vm, 'notifySuccess');

    await wrapper.vm.onConfirmDeleteRoute({ id: 2, someProp: 'second' }, 1);
    expect(deleteRoute).toHaveBeenCalledTimes(1);
    expect(deleteRoute).toHaveBeenCalledWith(2);
    expect(notifySucces).toHaveBeenCalledTimes(1);
    expect(notifySucces).toHaveBeenCalledWith('Deleted');
    expect(wrapper.vm.routesFormData).toEqual([{ id: 1, someProp: 'first' }, { id: 3, someProp: 'third' }]);
  });

  test('saveProductRoutes', async () => {
    const wrapper = shallowMount(SettingsProductEdit, {
      global: {
        plugins: [pinia],
        mocks: { $t, $route },
      },
    });

    const routesMock = [{ id: 1, someProp: 'first' }, { id: 2, someProp: 'second' }, { id: 3, someProp: 'third' }];
    await wrapper.setData({ routesFormData: routesMock });
    const saveRoute = vi.spyOn(wrapper.vm, 'saveRoute');
    wrapper.vm.saveProductRoutes({ id: 1234 });
    expect(saveRoute).toHaveBeenCalledTimes(3);
    expect(saveRoute).toHaveBeenNthCalledWith(1, {
      someProp: 'first', productId: 1234, id: null,
    });
    expect(saveRoute).toHaveBeenNthCalledWith(2, {
      someProp: 'second', productId: 1234, id: null,
    });
    expect(saveRoute).toHaveBeenNthCalledWith(3, {
      someProp: 'third', productId: 1234, id: null,
    });
  });

  test('removeOutdatedProductRoutes', async () => {
    const mocks = { $t, $route: { params: { id: 123 }, query: {} } };
    const wrapper = mount(SettingsProductEdit, {
      computed: {
        ...SettingsProductEdit.computed,
        stationsToBeRemoved() {
          return [1, 2];
        },
      },
      global: { plugins: [pinia], mocks },
    });
    await nextTick();
    await flushPromises();
    await wrapper.setData({
      routesFormData: [
        { stationId: 1, runTimeType: 'SECOND_PER_UNIT' },
        { stationId: 2, runTimeType: 'SECOND_PER_UNIT' },
        { stationId: 3, runTimeType: 'SECOND_PER_UNIT' },
      ],
    });

    wrapper.vm.removeOutdatedProductRoutes(() => {
      expect(deleteRoute).toHaveBeenCalledTimes(2);
      expect(deleteRoute).toHaveBeenNthCalledWith(1, 1);
      expect(deleteRoute).toHaveBeenNthCalledWith(2, 2);
    });
  });

  test('that query param "routeStationId" opens route dialog', async () => {
    const wrapper = mount(SettingsProductEdit, {
      global: {
        plugins: [pinia],
        mocks: { $t, $route: { params: { id: 1 }, query: { routeStationId: 1 } } },
      },
    });
    const spy = vi.spyOn(wrapper.vm, 'openRouteDialog');
    const route = { id: 1, stationId: 1, runTimeType: 'SECOND_PER_UNIT' };
    await wrapper.setData({
      routesFormData: [route],
    });

    await flushPromises();

    expect(spy).toBeCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({ item: route });
  });

  test('that query param "routeStationId" does not open route dialog when id does not match', async () => {
    const wrapper = mount(SettingsProductEdit, {
      global: {
        plugins: [pinia],
        mocks: { $t, $route: { params: { id: 1 }, query: { routeStationId: 99 } } },
      },
    });
    const spy = vi.spyOn(wrapper.vm, 'openRouteDialog');
    const route = { id: 1, stationId: 1, runTimeType: 'SECOND_PER_UNIT' };
    await wrapper.setData({
      routesFormData: [route],
    });

    await flushPromises();

    expect(spy).toBeCalledTimes(0);
  });

  describe('filteredStations', () => {
    it('returns all stationsWithAdminPermissions when group is not selected', () => {
      const wrapper = shallowMount(SettingsProductEdit, {
        global: {
          plugins: [pinia],
          mocks: { $t, $route },
        },
      });

      expect(wrapper.vm.filteredStations).toEqual(stationsMockData);
    });

    it('returns all stationsWithAdminPermissions when selected group is not local', () => {
      const wrapper = shallowMount(SettingsProductEdit, {
        global: {
          plugins: [pinia],
          mocks: { $t, $route },
        },
      });

      wrapper.setData({ formData: { groupId: 2 } });

      expect(wrapper.vm.filteredStations).toEqual(stationsMockData);
    });

    it('returns correct stations when selected group is local', () => {
      const wrapper = shallowMount(SettingsProductEdit, {
        global: {
          plugins: [pinia],
          mocks: { $t, $route },
        },
      });

      wrapper.setData({ formData: { groupId: 3 } });

      expect(wrapper.vm.filteredStations).toEqual([
        {
          id: 2, name: 'station 2', factoryId: 2, groupId: 1,
        },
        {
          id: 3, name: 'station 3', factoryId: 2, groupId: 2,
        },
      ]);
    });
  });

  describe('hasAvailableStations', () => {
    it('returns true when there are filteredStations that do not have route added', async () => {
      const wrapper = shallowMount(SettingsProductEdit, {
        global: {
          plugins: [pinia],
          mocks: { $t, $route },
        },
        computed: {
          ...SettingsProductEdit.computed,
          filteredStations: () => [
            { id: 1, name: 'station 1' },
            { id: 2, name: 'station 2' },
          ],
        },
      });

      await wrapper.setData({ routesFormData: [{ stationId: 1, runTimeType: 'SECOND_PER_UNIT' }] });

      expect(wrapper.vm.hasAvailableStations).toBe(true);
    });

    it('returns false when all filteredStations have route added', async () => {
      const wrapper = shallowMount(SettingsProductEdit, {
        global: {
          plugins: [pinia],
          mocks: { $t, $route },
        },
        computed: {
          ...SettingsProductEdit.computed,
          filteredStations: () => [
            { id: 1, name: 'station 1' },
            { id: 2, name: 'station 2' },
          ],
        },
      });

      await wrapper.setData({ routesFormData: [{ stationId: 1, runTimeType: 'SECOND_PER_UNIT' }, { stationId: 2, runTimeType: 'SECOND_PER_UNIT' }] });

      expect(wrapper.vm.hasAvailableStations).toBe(false);
    });
  });

  test('setPrimaryUnitSuggestions sets primaryUnitSuggestions with fetched data', async () => {
    const wrapper = shallowMount(SettingsProductEdit, {
      global: {
        plugins: [pinia],
        mocks: { $t, $route },
      },
    });

    const mockSuggestions = ['unit1', 'unit2'];
    wrapper.vm.fetchPrimaryUnitIds = vi.fn(() => mockSuggestions);

    await wrapper.vm.setPrimaryUnitSuggestions('searchTerm');
    expect(wrapper.vm.fetchPrimaryUnitIds).toHaveBeenCalledWith('searchTerm');
    expect(wrapper.vm.primaryUnitSuggestions).toEqual(mockSuggestions);
  });

  test('setAlternativeUnitSuggestions sets alternativeUnitSuggestions with fetched data', async () => {
    const wrapper = shallowMount(SettingsProductEdit, {
      global: {
        plugins: [pinia],
        mocks: { $t, $route },
      },
    });

    const mockSuggestions = ['altUnit1', 'altUnit2'];
    wrapper.vm.fetchAlternativeUnitIds = vi.fn(() => mockSuggestions);

    await wrapper.vm.setAlternativeUnitSuggestions('searchTerm');
    expect(wrapper.vm.fetchAlternativeUnitIds).toHaveBeenCalledWith('searchTerm');
    expect(wrapper.vm.alternativeUnitSuggestions).toEqual(mockSuggestions);
  });

  test('fetchPrimaryUnitIds calls productApi.getUnitIds with correct params and returns result', async () => {
    const wrapper = shallowMount(SettingsProductEdit, {
      global: {
        plugins: [pinia],
        mocks: { $t, $route },
      },
    });

    const mockResult = ['unitA', 'unitB'];
    productApi.getUnitIds.mockResolvedValueOnce(mockResult);

    const result = await wrapper.vm.fetchPrimaryUnitIds('abc');
    expect(productApi.getUnitIds).toHaveBeenCalledWith({ term: 'abc', limit: 5, isAlternative: false });
    expect(result).toBe(mockResult);
  });

  test('fetchAlternativeUnitIds calls productApi.getUnitIds with correct params and returns result', async () => {
    const wrapper = shallowMount(SettingsProductEdit, {
      global: {
        plugins: [pinia],
        mocks: { $t, $route },
      },
    });

    const mockResult = ['altUnitA', 'altUnitB'];
    productApi.getUnitIds.mockResolvedValueOnce(mockResult);

    const result = await wrapper.vm.fetchAlternativeUnitIds('xyz');
    expect(productApi.getUnitIds).toHaveBeenCalledWith({ term: 'xyz', limit: 5, isAlternative: true });
    expect(result).toBe(mockResult);
  });

  test('onPrimaryUnitSelected sets formData.unitId and closes primaryUnitMenu', async () => {
    const wrapper = shallowMount(SettingsProductEdit, {
      global: {
        plugins: [pinia],
        mocks: { $t, $route },
      },
    });

    // Set initial state
    await wrapper.setData({
      formData: { unitId: null },
      primaryUnitMenuState: true,
    });

    wrapper.vm.onPrimaryUnitSelected('selectedUnit');
    await flushPromises();
    expect(wrapper.vm.formData.unitId).toBe('selectedUnit');
    expect(wrapper.vm.primaryUnitMenuState).toBe(false);
  });

  test('onAlternativeUnitSelected sets formData.alternativeUnitId and closes alternativeUnitMenu', async () => {
    const wrapper = shallowMount(SettingsProductEdit, {
      global: {
        plugins: [pinia],
        mocks: { $t, $route },
      },
    });

    // Set initial state
    await wrapper.setData({
      formData: { alternativeUnitId: null },
      alternativeUnitMenuState: true,
    });

    wrapper.vm.onAlternativeUnitSelected('selectedAltUnit');
    await flushPromises();
    expect(wrapper.vm.formData.alternativeUnitId).toBe('selectedAltUnit');
    expect(wrapper.vm.alternativeUnitMenuState).toBe(false);
  });

  describe('setProductEditView', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = shallowMount(SettingsProductEdit, {
        global: {
          plugins: [pinia],
          mocks: { $t, $route },
        },
      });
      wrapper.vm.isDuplicate = false;
    });

    it('should not fetch product and change data when isDuplicate is true', async () => {
      wrapper.vm.isDuplicate = true;
      wrapper.vm.getProduct = vi.fn();
      wrapper.vm.setFormData = vi.fn();

      wrapper.vm.formData.unitId = 'unitId that should not change';
      wrapper.vm.formData.alternativeUnitId = 'alternativeUnitId that should not change';

      await wrapper.vm.setProductEditView(99);

      expect(wrapper.vm.getProduct).not.toHaveBeenCalled();
      expect(wrapper.vm.setFormData).not.toHaveBeenCalled();
      expect(wrapper.vm.formData.unitId).toBe('unitId that should not change');
      expect(wrapper.vm.formData.alternativeUnitId).toBe('alternativeUnitId that should not change');
    });

    it('should fetch product and set form data when productId is provided', async () => {
      const mockProduct = {
        id: 99, name: 'Mock Product', groupId: 1, unitId: 'u', alternativeUnitId: 'a',
      };
      wrapper.vm.getProduct = vi.fn().mockResolvedValueOnce(mockProduct);
      wrapper.vm.setFormData = vi.fn();

      await wrapper.vm.setProductEditView(99);

      expect(wrapper.vm.getProduct).toHaveBeenCalledWith(99);
      expect(wrapper.vm.setFormData).toHaveBeenCalledWith(mockProduct);
    });

    it('should set groupId, alternativeUnitId, and unitId from $route.params.groupId if productId is not provided', async () => {
      const testRoute = { params: { groupId: 42 } };
      wrapper = shallowMount(SettingsProductEdit, {
        global: {
          plugins: [pinia],
          mocks: { $t, $route: testRoute },
        },
      });

      await wrapper.vm.setProductEditView();

      expect(wrapper.vm.formData.groupId).toBe(42);
      expect(wrapper.vm.formData.alternativeUnitId).toBe('');
      expect(wrapper.vm.formData.unitId).toBe('');
    });

    it('should set alternativeUnitId and unitId to empty if neither productId nor $route.params.groupId is provided', async () => {
      wrapper = shallowMount(SettingsProductEdit, {
        global: {
          plugins: [pinia],
          mocks: { $t, $route: { params: {} } },
        },
      });

      // Set initial values to check they are cleared
      wrapper.vm.formData.alternativeUnitId = 'shouldClear';
      wrapper.vm.formData.unitId = 'shouldClear';

      await wrapper.vm.setProductEditView();

      expect(wrapper.vm.formData.alternativeUnitId).toBe('');
      expect(wrapper.vm.formData.unitId).toBe('');
    });
  });

  describe('isRemovedProduct', () => {
    it('returns false if isLoading is true', () => {
      const localPinia = createTestingPinia({
        createSpy: vi.fn,
        stubActions: false,
        initialState: {
          ...defaultPiniaInitialState,
          product: { ...defaultPiniaInitialState.product, loading: ['loading'] },
        },
      });
      const wrapper = shallowMount(SettingsProductEdit, {
        global: {
          plugins: [localPinia],
          mocks: { $t, $route: { params: { id: 123 } } },
        },
      });

      expect(wrapper.vm.isRemovedProduct).toBe(false);
    });

    it('returns false if productId does not exist', () => {
      const wrapper = shallowMount(SettingsProductEdit, {
        global: {
          plugins: [pinia],
          mocks: { $t, $route: { params: {} } },
        },
      });

      expect(wrapper.vm.isRemovedProduct).toBe(false);
    });

    it('returns false if productId exists, product is in productsMap and not marked as deleted', () => {
      const localPinia = createTestingPinia({
        createSpy: vi.fn,
        stubActions: false,
        initialState: {
          ...defaultPiniaInitialState,
          product: {
            ...defaultPiniaInitialState.product,
            products: [{ id: 123, name: 'test product', groupId: 1, deleted: false }],
          },
        },
      });
      const wrapper = shallowMount(SettingsProductEdit, {
        global: {
          plugins: [localPinia],
          mocks: { $t, $route: { params: { id: 123 } } },
        },
      });

      expect(wrapper.vm.isRemovedProduct).toBe(false);
    });

    it('returns true if productId exists and product is marked as deleted', () => {
      const localPinia = createTestingPinia({
        createSpy: vi.fn,
        stubActions: false,
        initialState: {
          ...defaultPiniaInitialState,
          product: {
            ...defaultPiniaInitialState.product,
            products: [{ id: 123, name: 'test product', groupId: 1, deleted: true }],
          },
        },
      });
      const wrapper = shallowMount(SettingsProductEdit, {
        global: {
          plugins: [localPinia],
          mocks: { $t, $route: { params: { id: 123 } } },
        },
      });

      expect(wrapper.vm.isRemovedProduct).toBe(true);
    });

    it('returns true if productId exists and product is not in productsMap', () => {
      const localPinia = createTestingPinia({
        createSpy: vi.fn,
        stubActions: true,
        initialState: {
          ...defaultPiniaInitialState,
          product: {
            ...defaultPiniaInitialState.product,
            products: [{ id: 124, name: 'another product', groupId: 1 }],
          },
        },
      });
      const wrapper = shallowMount(SettingsProductEdit, {
        global: {
          plugins: [localPinia],
          mocks: { $t, $route: { params: { id: 123 } } },
        },
      });

      expect(wrapper.vm.isRemovedProduct).toBe(true);
    });
  });
});

import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import SettingsProductsOverview from './index.vue';

import productApi from '@/api/productApi';
import builtInViewTypes from '@/components/pages/settings/SettingsEntitiesOverview/settingsBuiltInViewTypes.js';
import { FACTORY_ADMIN } from '@/constants/userRoles';

vi.mock('@/api/productApi');
const productResult = vi.fn().mockResolvedValue([{
  id: 1, name: 'product 1', sku: '14-55', unitId: 'kg', groupId: 1, stationIds: [1, 2], alternativeUnitId: '',
}, {
  id: 2, name: 'product 2', sku: '15-77', unitId: 'g', groupId: 1, stationIds: [1], alternativeUnitId: 'tk',
}]);
productApi.getProducts = productResult;

const groupResult = vi.fn().mockResolvedValue([{
  id: 1, name: 'product group 1', local: false, factoryIds: [],
}, {
  id: 2, name: 'product group 2', local: true, factoryIds: [1, 2],
}]);
productApi.getProductGroups = groupResult;

const defaultPiniaInitialState = {
  profile: {
    currentUser: { roles: { 1: FACTORY_ADMIN } },
  },
  configuration: {
    configuration: {},
  },
  station: {
    stations: [],
  },
  factory: {
    factories: [],
  },
  filterbar: {
    requestFilterState: {},
    currentFilterState: {},
  },
};

describe('SettingsProductsOverview', () => {
  test('it mounts empty view correctly', async () => {
    productApi.getProducts.mockResolvedValueOnce([]);
    const wrapper = shallowMount(SettingsProductsOverview, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState })],
      },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  test('it mounts correctly', async () => {
    productApi.getProducts = () => [{
      id: 1, name: 'product 1', sku: '14-55', unitId: 'kg', groupId: 1, stationIds: [1, 2], alternativeUnitId: '',
    }, {
      id: 2, name: 'product 2', sku: '15-77', unitId: 'g', groupId: 1, stationIds: [1], alternativeUnitId: 'tk',
    }];
    const wrapper = shallowMount(SettingsProductsOverview, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState })],
      },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  test('it mounts correctly when import/export is enabled', async () => {
    const wrapper = shallowMount(SettingsProductsOverview, {
      global: {
        plugins: [createTestingPinia({
          createSpy: vi.fn,
          stubActions: false,
          initialState: {
            ...defaultPiniaInitialState,
            profile: {
              currentUser: { roles: { 0: 'COMPANY_ADMIN' } },
              highestUserRole: 'COMPANY_ADMIN',
            },
            configuration: {
              configuration: { settingsDataExportReports: [{ id: 'product', name: 'ProductExport' }] },
            },
            factory: {
              factories: [{ id: 1, name: 'factory 1', stations: [] }, { id: 2, name: 'factory 2', stations: [] }],
            },
          },
        })],
      },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  test('it mounts correctly when all products are not loaded', async () => {
    const wrapper = shallowMount(SettingsProductsOverview, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState })],
      },
    });

    await flushPromises();
    await wrapper.setData({ areAllProductsLoaded: false });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('mounts correctly if userHasGlobalGroupsIcon is false', async () => {
    productApi.getProducts = () => [{
      id: 1, name: 'product 1', sku: '14-55', unitId: 'kg', groupId: 1, stationIds: [1, 2], alternativeUnitId: '',
    }, {
      id: 2, name: 'product 2', sku: '15-77', unitId: 'g', groupId: 1, stationIds: [1], alternativeUnitId: 'tk',
    }];
    const wrapper = shallowMount(SettingsProductsOverview, {
      global: {
        plugins: [createTestingPinia({
          createSpy: vi.fn,
          stubActions: false,
          initialState: {
            ...defaultPiniaInitialState,
            profile: {
              currentUser: { roles: { 0: 'COMPANY_ADMIN' } },
            },
            factory: {
              factories: [{ id: 1, name: 'factory 1', stations: [] }],
            },
          },
        })],
      },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  test('onProductOrderChange', async () => {
    const wrapper = shallowMount(SettingsProductsOverview, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState })],
      },
    });

    const data = { ordering: -0.5, id: 1, groupId: 2 };

    const patchProduct = vi.spyOn(wrapper.vm, 'patchProduct');
    const fetchProducts = vi.spyOn(wrapper.vm, 'fetchProducts');

    await flushPromises();

    await wrapper.vm.onProductOrderChange(data);

    expect(patchProduct).toHaveBeenCalledTimes(1);
    expect(patchProduct).toHaveBeenCalledWith(data);
    expect(fetchProducts).toHaveBeenCalledTimes(1);
    expect(fetchProducts).toHaveBeenCalledWith({ groupId: data.groupId }, { extendProductList: false, replaceProducts: true, setAllProductsLoadedState: false });
  });

  test('onProductDeleted', async () => {
    const initialProducts = [{
      id: 1, name: 'product 1', sku: '14-55', unitId: 'kg', groupId: 1, stationIds: [1, 2], alternativeUnitId: '', ordering: 0,
    }, {
      id: 2, name: 'product 2', sku: '15-77', unitId: 'g', groupId: 1, stationIds: [1], alternativeUnitId: 'tk', ordering: 1,
    }, {
      id: 3, name: 'product 3', sku: '', unitId: 'g', groupId: 1, stationIds: [1], alternativeUnitId: 'tk', ordering: 2,
    }];
    productApi.getProducts = vi.fn().mockReturnValueOnce(initialProducts);
    const wrapper = shallowMount(SettingsProductsOverview, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState })],
      },
    });

    await flushPromises();

    expect(wrapper.vm.products).toEqual(initialProducts);

    await wrapper.vm.onProductDeleted({
      id: 2, name: 'product 2', sku: '15-77', unitId: 'g', groupId: 1, stationIds: [1], alternativeUnitId: 'tk',
    });

    expect(wrapper.vm.products.length).toBe(2);
    expect(wrapper.vm.products[0].id).toBe(1);
    expect(wrapper.vm.products[1].id).toBe(3);
  });

  test('fetchProducts', async () => {
    const fetchProducts = vi.fn();
    const initialProducts = [{
      id: 1, name: 'product 1', sku: '14-55', unitId: 'kg', groupId: 1, stationIds: [1, 2], alternativeUnitId: '', ordering: 0,
    }, {
      id: 2, name: 'product 2', sku: '15-77', unitId: 'g', groupId: 1, stationIds: [1], alternativeUnitId: 'tk', ordering: 1,
    }];
    fetchProducts.mockResolvedValueOnce(initialProducts);
    productApi.getProducts = fetchProducts;

    const wrapper = shallowMount(SettingsProductsOverview, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState })],
      },
    });

    await flushPromises();

    expect(fetchProducts).toHaveBeenCalledTimes(1);
    expect(fetchProducts).toHaveBeenLastCalledWith({
      factoryId: [], groupId: [], stationId: [], limit: 300, term: '',
    });
    expect(wrapper.vm.products).toEqual(initialProducts);
    expect(wrapper.vm.areAllProductsLoaded).toBe(true);

    wrapper.setData({ areAllProductsLoaded: false });
    const newProducts1 = [{
      id: 2, name: 'product 2', sku: '15-77', unitId: 'g', groupId: 1, stationIds: [1], alternativeUnitId: 'tk', ordering: 1,
    }, {
      id: 3, name: 'product 3', sku: '', unitId: 'kg', groupId: 1, stationIds: [1, 2], alternativeUnitId: '', ordering: 2,
    }];
    fetchProducts.mockResolvedValueOnce(newProducts1);
    await wrapper.vm.fetchProducts({ term: 'testTerm' }, { extendProductList: false, replaceProducts: false, setAllProductsLoadedState: false });
    expect(fetchProducts).toHaveBeenCalledTimes(2);
    expect(fetchProducts).toHaveBeenLastCalledWith({
      factoryId: [], groupId: [], stationId: [], limit: 300, term: 'testTerm',
    });
    expect(wrapper.vm.products).toEqual(newProducts1);
    expect(wrapper.vm.areAllProductsLoaded).toEqual(false);

    const newProducts2 = [{
      id: 4, name: 'product 4', sku: '', unitId: 'g', groupId: 1, stationIds: [1], alternativeUnitId: 'tk', ordering: 3,
    }, {
      id: 5, name: 'product 5', sku: '', unitId: 'kg', groupId: 1, stationIds: [1, 2], alternativeUnitId: '', ordering: 4,
    }];
    fetchProducts.mockResolvedValueOnce(newProducts2);
    await wrapper.vm.fetchProducts({}, { extendProductList: true, replaceProducts: false, setAllProductsLoadedState: true });
    expect(fetchProducts).toHaveBeenCalledTimes(3);
    expect(fetchProducts).toHaveBeenLastCalledWith({
      factoryId: [], groupId: [], stationId: [], limit: 300, term: '',
    });
    expect(wrapper.vm.products.length).toBe(4);
    expect(wrapper.vm.products.map((product) => product.id)).toEqual([2, 3, 4, 5]);
    expect(wrapper.vm.areAllProductsLoaded).toEqual(true);

    const newProducts3 = [{
      id: 4, name: 'product 4 with new name', sku: '', unitId: 'g', groupId: 1, stationIds: [1], alternativeUnitId: 'tk', ordering: 0,
    }];
    fetchProducts.mockResolvedValueOnce(newProducts3);
    await wrapper.vm.fetchProducts({}, { extendProductList: false, replaceProducts: true, setAllProductsLoadedState: false });
    expect(fetchProducts).toHaveBeenCalledTimes(4);
    expect(fetchProducts).toHaveBeenLastCalledWith({
      factoryId: [], groupId: [], stationId: [], limit: 300, term: '',
    });
    expect(wrapper.vm.products.length).toBe(4);
    expect(wrapper.vm.products.map((product) => product.id)).toEqual([4, 2, 3, 5]);
    expect(wrapper.vm.areAllProductsLoaded).toEqual(true);
  });

  test('fetchProductGroups', async () => {
    const fetchFilteredProductGroups = vi.spyOn(SettingsProductsOverview.methods, 'fetchFilteredProductGroups');
    const wrapper = shallowMount(SettingsProductsOverview, {
      global: {
        plugins: [createTestingPinia({
          createSpy: vi.fn,
          stubActions: false,
          initialState: {
            ...defaultPiniaInitialState,
            filterbar: { requestFilterState: { stationId: [1, 2], factoryId: [1] } },
          },
        })],
      },
    });

    const calledTimes = fetchFilteredProductGroups.mock.calls.length;

    await wrapper.vm.fetchFilteredProductGroups();

    expect(fetchFilteredProductGroups).toHaveBeenCalledTimes(calledTimes + 1);
    expect(productApi.getProductGroups).toHaveBeenLastCalledWith({ stationId: [1, 2], factoryId: [1] });
  });

  test('that onProductSaved calls fetchProducts with correct params when editing existing', async () => {
    const wrapper = shallowMount(SettingsProductsOverview, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState })],
      },
    });

    const fetchProducts = vi.spyOn(wrapper.vm, 'fetchProducts');
    wrapper.vm.onProductSaved({ id: 12 }, true);

    expect(fetchProducts).toHaveBeenCalledTimes(1);
    expect(fetchProducts).toHaveBeenCalledWith({ id: 12 }, { extendProductList: false, replaceProducts: true, setAllProductsLoadedState: false });
  });

  test('that onProductSaved calls fetchProducts with correct params when adding new', async () => {
    const wrapper = shallowMount(SettingsProductsOverview, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState })],
      },
    });

    const fetchProducts = vi.spyOn(wrapper.vm, 'fetchProducts');
    wrapper.vm.onProductSaved({ id: 12 }, false);

    expect(fetchProducts).toHaveBeenCalledTimes(1);
    expect(fetchProducts).toHaveBeenCalledWith({ id: 12 }, { extendProductList: true, replaceProducts: false, setAllProductsLoadedState: false });
  });

  describe('allProductsInitiallyLoaded', () => {
    it('remains false if products count is same as the limit', async () => {
      productApi.getProducts = () => new Array(300);
      const wrapper = shallowMount(SettingsProductsOverview, {
        global: {
          plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState })],
        },
      });

      await flushPromises();

      expect(wrapper.vm.allProductsInitiallyLoaded).toBe(false);
    });

    it('becomes true if products count is less than the limit', async () => {
      productApi.getProducts = () => new Array(299);
      const wrapper = shallowMount(SettingsProductsOverview, {
        global: {
          plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState })],
        },
      });

      await flushPromises();

      expect(wrapper.vm.allProductsInitiallyLoaded).toBe(true);
    });
  });

  describe('3-dot menu items', () => {
    it('has data import/export option if highestRoleAllows is true and settingsDataExportReports includes product report', async () => {
      const wrapper = shallowMount(SettingsProductsOverview, {
        global: {
          plugins: [createTestingPinia({
            createSpy: vi.fn,
            stubActions: false,
            initialState: {
              ...defaultPiniaInitialState,
              profile: {
                currentUser: { roles: { 0: 'COMPANY_ADMIN' } },
                highestUserRole: 'COMPANY_ADMIN',
              },
              configuration: {
                configuration: { settingsDataExportReports: [{ id: 'product', name: 'ProductExport' }] },
              },
            },
          })],
        },
      });

      await flushPromises();

      const { menuItems } = wrapper.vm;
      expect(menuItems.length).toBe(1);
      expect(menuItems[0].text).toBe('Data export and import');
    });

    it('does not have any items if highestRoleAllows is false', async () => {
      const wrapper = shallowMount(SettingsProductsOverview, {
        global: {
          plugins: [createTestingPinia({
            createSpy: vi.fn,
            stubActions: false,
            initialState: {
              ...defaultPiniaInitialState,
              configuration: {
                configuration: { settingsDataExportReports: [{ id: 'product', name: 'ProductExport' }] },
              },
            },
          })],
        },
      });

      await flushPromises();

      expect(wrapper.vm.menuItems.length).toBe(0);
    });

    it('does not have any items if configuration does not include settingsDataExportReports', async () => {
      const wrapper = shallowMount(SettingsProductsOverview, {
        global: {
          plugins: [createTestingPinia({
            createSpy: vi.fn,
            stubActions: false,
            initialState: {
              ...defaultPiniaInitialState,
              profile: {
                currentUser: { roles: { 0: 'COMPANY_ADMIN' } },
                highestUserRole: 'COMPANY_ADMIN',
              },
            },
          })],
        },
      });

      await flushPromises();

      expect(wrapper.vm.menuItems.length).toBe(0);
    });

    it('does not have any items if highestRoleAllows is false and configuration does not include settingsDataExportReports', async () => {
      const wrapper = shallowMount(SettingsProductsOverview, {
        global: {
          plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState })],
        },
      });

      await flushPromises();

      expect(wrapper.vm.menuItems.length).toBe(0);
    });
  });

  describe('isListViewVisible', () => {
    it('returns true if toggleBtnValue is LIST', () => {
      const wrapper = shallowMount(SettingsProductsOverview, {
        global: {
          plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState })],
        },
      });

      wrapper.vm.toggleBtnValue = builtInViewTypes.LIST;
      expect(wrapper.vm.isListViewVisible).toBe(true);
    });

    it('returns false if toggleBtnValue is GROUPS', () => {
      const wrapper = shallowMount(SettingsProductsOverview, {
        global: {
          plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: defaultPiniaInitialState })],
        },
      });

      wrapper.vm.toggleBtnValue = builtInViewTypes.GROUPS;
      expect(wrapper.vm.isListViewVisible).toBe(false);
    });
  });
});

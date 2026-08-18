import { setActivePinia, createPinia } from 'pinia';

import useProductStore from './index';

import productApi from '@/api/productApi';
import useProfileStore from '@/stores/profile';

const { notifyMocks, storeMock } = vi.hoisted(() => {
  const notifyAdded = vi.fn();
  const notifyUpdated = vi.fn();
  const notifyDeleted = vi.fn();
  const notifyError = vi.fn();
  return {
    notifyMocks: { notifyAdded, notifyUpdated, notifyDeleted, notifyError },
    storeMock: (state) => ({ default: () => state, __esModule: true }),
  };
});

vi.mock('@/stores/genericNotification', () => storeMock(notifyMocks));

vi.mock('@/api/productApi', () => ({
  default: {
    getProducts: vi.fn(),
    getProductGroups: vi.fn(),
    putProductGroup: vi.fn(),
    postProductGroup: vi.fn(),
    deleteProductGroup: vi.fn(),
    patchProduct: vi.fn(),
    patchProductGroup: vi.fn(),
    putProduct: vi.fn(),
    postProduct: vi.fn(),
    deleteProduct: vi.fn(),
  },
  __esModule: true,
}));

describe('useProductStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useProductStore();
    const profileStore = useProfileStore();
    profileStore.currentUser = { roles: { 0: 'admin' } };
    vi.clearAllMocks();
  });

  test('initial state', () => {
    expect(store.products).toEqual([]);
    expect(store.loading).toEqual([]);
    expect(store.productGroups).toEqual([]);
  });

  describe('actions', () => {
    test('startLoading pushes to loading array', () => {
      store.startLoading();
      expect(store.loading).toHaveLength(1);
    });

    test('finishLoading pops from loading array', () => {
      store.startLoading();
      store.finishLoading();
      expect(store.loading).toHaveLength(0);
    });

    test('setProducts replaces products', () => {
      const products = [{ id: 1 }, { id: 2 }];
      store.setProducts(products);
      expect(store.products).toEqual(products);
    });

    test('setProductGroups replaces productGroups', () => {
      const groups = [{ id: 1 }, { id: 2 }];
      store.setProductGroups(groups);
      expect(store.productGroups).toEqual(groups);
    });

    describe('editGroup', () => {
      test('updates existing group when id matches', () => {
        store.productGroups = [{ id: 1, name: 'old' }, { id: 2, name: 'group2' }];
        store.editGroup({ id: 1, name: 'updated' });
        expect(store.productGroups[0]).toEqual({ id: 1, name: 'updated' });
      });

      test('appends new group when id not found', () => {
        store.productGroups = [{ id: 1, name: 'group1' }];
        store.editGroup({ id: 99, name: 'newGroup' });
        expect(store.productGroups).toHaveLength(2);
        expect(store.productGroups[1]).toEqual({ id: 99, name: 'newGroup' });
      });
    });

    test('removeGroup removes existing group', () => {
      store.productGroups = [{ id: 1, name: 'group1' }, { id: 2, name: 'group2' }];
      store.removeGroup(1);
      expect(store.productGroups).toEqual([{ id: 2, name: 'group2' }]);
    });

    test('removeGroup with non-existent id', () => {
      store.productGroups = [{ id: 1, name: 'group1' }, { id: 2, name: 'group2' }];
      store.removeGroup(3);
      expect(store.productGroups).toEqual([{ id: 1, name: 'group1' }, { id: 2, name: 'group2' }]);
    });

    describe('editProduct', () => {
      test('updates existing product when id matches', () => {
        store.products = [{ id: 1, name: 'old' }, { id: 2, name: 'product2' }];
        store.editProduct({ id: 1, name: 'updated' });
        expect(store.products[0]).toEqual({ id: 1, name: 'updated' });
      });

      test('appends new product when id not found', () => {
        store.products = [{ id: 1, name: 'product1' }];
        store.editProduct({ id: 99, name: 'newProduct' });
        expect(store.products).toHaveLength(2);
        expect(store.products[1]).toEqual({ id: 99, name: 'newProduct' });
      });
    });

    test('removeProduct removes existing product', () => {
      store.products = [{ id: 1, name: 'product1' }, { id: 2, name: 'product2' }];
      store.removeProduct(1);
      expect(store.products).toEqual([{ id: 2, name: 'product2' }]);
    });

    test('removeProduct with non-existent id', () => {
      store.products = [{ id: 1, name: 'product1' }, { id: 2, name: 'product2' }];
      store.removeProduct(3);
      expect(store.products).toEqual([{ id: 1, name: 'product1' }, { id: 2, name: 'product2' }]);
    });

    describe('getProduct', () => {
      test('returns cached product from productsMap without fetching', async () => {
        store.products = [{ id: 5, name: 'cached' }];
        const result = await store.getProduct(5);
        expect(result).toEqual({ id: 5, name: 'cached' });
        expect(productApi.getProducts).not.toHaveBeenCalled();
      });

      test('fetches and returns product when not cached', async () => {
        productApi.getProducts.mockResolvedValue([{ id: 7, name: 'fetched' }]);
        const result = await store.getProduct(7);
        expect(productApi.getProducts).toHaveBeenCalledWith({ id: 7 });
        expect(result).toEqual({ id: 7, name: 'fetched' });
      });
    });

    describe('fetchProducts', () => {
      test('fetches products and sets them in state', async () => {
        const apiProducts = [{ id: 1, name: 'p1' }, { id: 2, name: 'p2' }];
        productApi.getProducts.mockResolvedValue(apiProducts);
        await store.fetchProducts({});
        expect(productApi.getProducts).toHaveBeenCalledWith({});
        expect(store.products).toHaveLength(2);
        expect(store.isLoading).toBe(false);
      });

      test('handles null response by setting empty products', async () => {
        productApi.getProducts.mockResolvedValue(null);
        await store.fetchProducts({});
        expect(store.products).toEqual([]);
      });
    });

    describe('fetchProductGroups', () => {
      test('fetches product groups and sets them in state', async () => {
        const groups = [{ id: 1, name: 'g1' }];
        productApi.getProductGroups.mockResolvedValue(groups);
        await store.fetchProductGroups({ factory: 1 });
        expect(productApi.getProductGroups).toHaveBeenCalledWith({ factory: 1 });
        expect(store.productGroups).toEqual(groups);
        expect(store.isLoading).toBe(false);
      });

      test('defaults to empty params when called without arguments', async () => {
        productApi.getProductGroups.mockResolvedValue([]);
        await store.fetchProductGroups();
        expect(productApi.getProductGroups).toHaveBeenCalledWith({});
      });

      test('handles null response by setting empty groups', async () => {
        productApi.getProductGroups.mockResolvedValue(null);
        await store.fetchProductGroups();
        expect(store.productGroups).toEqual([]);
      });
    });

    describe('saveProductGroup', () => {
      test('updates existing group via putProductGroup and notifies updated', async () => {
        const group = { id: 1, name: 'GroupA' };
        productApi.putProductGroup.mockResolvedValue(group);
        const result = await store.saveProductGroup({ id: 1, name: 'GroupA' });
        expect(productApi.putProductGroup).toHaveBeenCalledWith({ id: 1, name: 'GroupA' });
        expect(notifyMocks.notifyUpdated).toHaveBeenCalledWith('GroupA');
        expect(result).toEqual(group);
        expect(store.isLoading).toBe(false);
      });

      test('creates new group via postProductGroup and notifies added', async () => {
        const group = { id: 2, name: 'NewGroup' };
        productApi.postProductGroup.mockResolvedValue(group);
        const result = await store.saveProductGroup({ name: 'NewGroup' });
        expect(productApi.postProductGroup).toHaveBeenCalledWith({ name: 'NewGroup' });
        expect(notifyMocks.notifyAdded).toHaveBeenCalledWith('NewGroup');
        expect(result).toEqual(group);
      });

      test('notifies error and returns error on failure', async () => {
        const error = { response: { data: { message: 'Save failed' } } };
        productApi.putProductGroup.mockRejectedValue(error);
        const result = await store.saveProductGroup({ id: 1, name: 'GroupA' });
        expect(notifyMocks.notifyError).toHaveBeenCalledWith('Save failed');
        expect(result).toEqual(error);
        expect(store.isLoading).toBe(false);
      });
    });

    describe('deleteProductGroup', () => {
      test('deletes group, notifies deleted, and removes from state', async () => {
        store.productGroups = [{ id: 1, name: 'GroupA' }];
        productApi.deleteProductGroup.mockResolvedValue();
        await store.deleteProductGroup({ id: 1, name: 'GroupA' });
        expect(productApi.deleteProductGroup).toHaveBeenCalledWith(1);
        expect(notifyMocks.notifyDeleted).toHaveBeenCalledWith('GroupA');
        expect(store.productGroups).toEqual([]);
        expect(store.isLoading).toBe(false);
      });

      test('notifies error on failure', async () => {
        const error = { response: { data: { message: 'Delete failed' } } };
        productApi.deleteProductGroup.mockRejectedValue(error);
        await store.deleteProductGroup({ id: 1, name: 'GroupA' });
        expect(notifyMocks.notifyError).toHaveBeenCalledWith('Delete failed');
        expect(store.isLoading).toBe(false);
      });
    });

    describe('patchProduct', () => {
      test('calls patchProduct api and finishes loading', async () => {
        productApi.patchProduct.mockResolvedValue();
        await store.patchProduct({ id: 1, active: false });
        expect(productApi.patchProduct).toHaveBeenCalledWith({ id: 1, active: false });
        expect(store.isLoading).toBe(false);
      });
    });

    describe('saveProductGroupOrder', () => {
      test('calls patchProductGroup api and finishes loading', async () => {
        productApi.patchProductGroup.mockResolvedValue();
        await store.saveProductGroupOrder({ ordering: [1, 2, 3] });
        expect(productApi.patchProductGroup).toHaveBeenCalledWith({ ordering: [1, 2, 3] });
        expect(store.isLoading).toBe(false);
      });
    });

    describe('saveProduct', () => {
      test('updates existing product via putProduct and notifies updated', async () => {
        const product = { id: 1, name: 'ProductA' };
        productApi.putProduct.mockResolvedValue(product);
        const result = await store.saveProduct({ id: 1, name: 'ProductA' });
        expect(productApi.putProduct).toHaveBeenCalledWith({ id: 1, name: 'ProductA' });
        expect(notifyMocks.notifyUpdated).toHaveBeenCalledWith('ProductA');
        expect(result).toEqual(product);
        expect(store.isLoading).toBe(false);
      });

      test('creates new product via postProduct and notifies added', async () => {
        const product = { id: 2, name: 'NewProduct' };
        productApi.postProduct.mockResolvedValue(product);
        const result = await store.saveProduct({ name: 'NewProduct' });
        expect(productApi.postProduct).toHaveBeenCalledWith({ name: 'NewProduct' });
        expect(notifyMocks.notifyAdded).toHaveBeenCalledWith('NewProduct');
        expect(result).toEqual(product);
      });

      test('notifies error with message and returns error on failure', async () => {
        const error = { response: { data: { message: 'Save failed' } } };
        productApi.putProduct.mockRejectedValue(error);
        const result = await store.saveProduct({ id: 1, name: 'ProductA' });
        expect(notifyMocks.notifyError).toHaveBeenCalledWith('Save failed');
        expect(result).toEqual(error);
        expect(store.isLoading).toBe(false);
      });

      test('falls back to error object when message is missing', async () => {
        const error = { response: { data: {} } };
        productApi.postProduct.mockRejectedValue(error);
        await store.saveProduct({ name: 'ProductA' });
        expect(notifyMocks.notifyError).toHaveBeenCalledWith(error);
      });
    });

    describe('deleteProduct', () => {
      test('deletes product, notifies deleted, and removes from state', async () => {
        store.products = [{ id: 1, name: 'ProductA' }];
        productApi.deleteProduct.mockResolvedValue();
        await store.deleteProduct({ id: 1, name: 'ProductA' });
        expect(productApi.deleteProduct).toHaveBeenCalledWith(1);
        expect(notifyMocks.notifyDeleted).toHaveBeenCalledWith('ProductA');
        expect(store.products).toEqual([]);
        expect(store.isLoading).toBe(false);
      });

      test('notifies error with message on failure', async () => {
        const error = { response: { data: { message: 'Delete failed' } } };
        productApi.deleteProduct.mockRejectedValue(error);
        await store.deleteProduct({ id: 1, name: 'ProductA' });
        expect(notifyMocks.notifyError).toHaveBeenCalledWith('Delete failed');
        expect(store.isLoading).toBe(false);
      });

      test('falls back to error object when message is missing on delete failure', async () => {
        const error = { response: { data: {} } };
        productApi.deleteProduct.mockRejectedValue(error);
        await store.deleteProduct({ id: 1, name: 'ProductA' });
        expect(notifyMocks.notifyError).toHaveBeenCalledWith(error);
      });
    });
  });

  describe('getters', () => {
    test('productsMap returns object keyed by product id', () => {
      store.products = [{ id: 1, name: 'p1' }, { id: 2, name: 'p2' }];
      expect(store.productsMap).toEqual({
        1: { id: 1, name: 'p1' },
        2: { id: 2, name: 'p2' },
      });
    });

    test('productsRealMap returns Map keyed by product id', () => {
      store.products = [{ id: 1, name: 'p1' }, { id: 2, name: 'p2' }];
      const map = store.productsRealMap;
      expect(map).toBeInstanceOf(Map);
      expect(map.get(1)).toEqual({ id: 1, name: 'p1' });
      expect(map.get(2)).toEqual({ id: 2, name: 'p2' });
    });

    test('isLoading', () => {
      expect(store.isLoading).toBe(false);
      store.loading.push('loading');
      expect(store.isLoading).toBe(true);
    });

    test('productGroupsMap returns object keyed by group id', () => {
      store.productGroups = [{ id: 1, name: 'g1' }, { id: 2, name: 'g2' }];
      expect(store.productGroupsMap).toEqual({
        1: { id: 1, name: 'g1' },
        2: { id: 2, name: 'g2' },
      });
    });

    test('productGroupsWithAdminPermissions returns all groups when role 0 (company admin) is set', () => {
      const groups = [{ id: 1, name: 'g1' }, { id: 2, name: 'g2' }];
      store.productGroups = groups;
      // currentUser has roles: { 0: 'admin' } from beforeEach — company admin gets all groups
      expect(store.productGroupsWithAdminPermissions).toEqual(groups);
    });

    test('productGroupsWithAdminPermissions filters groups for factory admin', () => {
      const profileStore = useProfileStore();
      profileStore.currentUser = { roles: { 10: 'FACTORY_ADMIN' } };
      store.productGroups = [
        { id: 1, name: 'g1', factoryId: 10 },
        { id: 2, name: 'g2', factoryId: 20 },
      ];
      const result = store.productGroupsWithAdminPermissions;
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    test('productGroupsWithAdminPermissionsMap', () => {
      store.productGroups = [{ id: 1, name: 'Product group 1' }, { id: 2, name: 'Product group 2' }];
      expect(store.productGroupsWithAdminPermissionsMap).toEqual({
        1: { id: 1, name: 'Product group 1' },
        2: { id: 2, name: 'Product group 2' },
      });
    });

    test('searchResults returns undefined when productSearchResults is not in state', () => {
      expect(store.searchResults).toBeUndefined();
    });
  });
});

import { defineStore } from 'pinia';

import productApi from '@/api/productApi';
import mergeFilteredRequestState from '@/helpers/list/mergeFilteredRequestState';
import listToKeyMap from '@/helpers/list/listToKeyMap';
import getGroupsWithAdminPermissions from '@/helpers/permissions/getGroupsWithAdminPermissions';
import useGenericNotificationStore from '@/stores/genericNotification';
import useProfileStore from '@/stores/profile';

const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    loading: [],
    productGroups: [],
  }),
  actions: {
    startLoading() {
      this.loading.push('loading');
    },
    finishLoading() {
      this.loading.pop();
    },
    setProducts(products) {
      this.products = products;
    },
    setProductGroups(groups) {
      this.productGroups = groups;
    },
    editGroup(group) {
      const index = this.productGroups.findIndex((el) => el.id === group.id);
      if (index > -1) {
        this.productGroups[index] = group;
      } else {
        this.productGroups.push(group);
      }
    },
    removeGroup(groupId) {
      const index = this.productGroups.findIndex((el) => el.id === groupId);
      if (index > -1) this.productGroups.splice(index, 1);
    },
    editProduct(item) {
      const index = this.products.findIndex((product) => product.id === item.id);
      if (index > -1) {
        this.products[index] = item;
      } else {
        this.products.push(item);
      }
    },
    removeProduct(id) {
      const index = this.products.findIndex((el) => el.id === id);
      if (index > -1) this.products.splice(index, 1);
    },
    async getProduct(id) {
      if (this.productsMap[id]) return this.productsMap[id];
      await this.fetchProducts({ id });
      return this.productsMap[id];
    },
    async fetchProducts(params) {
      this.startLoading();
      const products = await productApi.getProducts({ ...params }) || [];
      this.setProducts(mergeFilteredRequestState(this.productsRealMap, products, 'ordering', false));
      this.finishLoading();
    },
    async fetchProductGroups(params = {}) {
      this.startLoading();
      const productGroups = await productApi.getProductGroups(params) || [];
      this.setProductGroups(productGroups);
      this.finishLoading();
    },
    async saveProductGroup(data) {
      this.startLoading();
      try {
        let group;
        if (data.id) {
          group = await productApi.putProductGroup(data);
          useGenericNotificationStore().notifyUpdated(group.name);
        } else {
          group = await productApi.postProductGroup(data);
          useGenericNotificationStore().notifyAdded(group.name);
        }
        this.editGroup(group);
        return group;
      } catch (error) {
        useGenericNotificationStore().notifyError(error.response.data.message);
        return error;
      } finally {
        this.finishLoading();
      }
    },
    async deleteProductGroup(group) {
      this.startLoading();
      try {
        await productApi.deleteProductGroup(group.id);
        useGenericNotificationStore().notifyDeleted(group.name);
        this.removeGroup(group.id);
      } catch (error) {
        useGenericNotificationStore().notifyError(error.response.data.message);
      }
      this.finishLoading();
    },
    async patchProduct(product) {
      this.startLoading();
      await productApi.patchProduct(product);
      this.finishLoading();
    },
    async saveProductGroupOrder(params) {
      this.startLoading();
      await productApi.patchProductGroup(params);
      this.finishLoading();
    },
    async saveProduct(data) {
      this.startLoading();
      try {
        let product;
        if (data.id) {
          product = await productApi.putProduct(data);
          useGenericNotificationStore().notifyUpdated(product.name);
        } else {
          product = await productApi.postProduct(data);
          useGenericNotificationStore().notifyAdded(product.name);
        }
        this.editProduct(product);
        return product;
      } catch (error) {
        useGenericNotificationStore().notifyError(error.response.data.message || error);
        return error;
      } finally {
        this.finishLoading();
      }
    },
    async deleteProduct(product) {
      this.startLoading();
      try {
        await productApi.deleteProduct(product.id);
        useGenericNotificationStore().notifyDeleted(product.name);
        this.removeProduct(product.id);
      } catch (error) {
        useGenericNotificationStore().notifyError(error.response.data.message || error);
      } finally {
        this.finishLoading();
      }
    },
  },
  getters: {
    productsMap: (state) => listToKeyMap(state.products, 'id'),
    productsRealMap: (state) => new Map(state.products.map((product) => [product.id, product])),
    isLoading: (state) => !!state.loading.length,
    productGroupsWithAdminPermissions() {
      const roles = useProfileStore().currentRoles;
      return getGroupsWithAdminPermissions(this.productGroups, roles);
    },
    productGroupsMap: (state) => listToKeyMap(state.productGroups, 'id'),
    productGroupsWithAdminPermissionsMap() {
      return listToKeyMap(this.productGroupsWithAdminPermissions, 'id');
    },
    searchResults: (state) => state.productSearchResults,
  },
});

export default useProductStore;

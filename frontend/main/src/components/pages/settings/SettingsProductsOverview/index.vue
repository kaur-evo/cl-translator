<template>
  <settings-entities-overview
    entity-name="product"
    :overview-header="$t('products')"
    :primary-btn-text="$t('Product')"
    :secondary-btn-text="$t('Group')"
    :filter-configuration="filterBarConf"
    :table-headers="createTableHeadersConf(isListViewVisible, userHasGlobalGroupsIcon)"
    :items="tableProducts"
    :groups="productGroupsWithAdminPermissions"
    :loading="isLoading || !initialLoadFinished"
    :group-fields="['name', 'local']"
    save-action-name="saveProductGroup"
    :is-deleting-group-in-progress="isDeletingGroupInProgress"
    :toggle-btn-value="toggleBtnValue"
    has-group-view
    show-drag-icon
    :show-global-groups-icon="userHasGlobalGroupsIcon"
    :footer-options="footerOptions"
    :show-group-items-count="areAllProductsLoaded"
    :open-panels-on-filter="areAllProductsLoaded"
    :menu-items="menuItems"
    :group-delete-fn="onGroupDelete"
    @update:toggle-btn-value="toggleBtnValue = $event"
    @on-group-order-change="onGroupOrderChange"
    @on-items-order-change="onProductOrderChange"
    @on-table-options-change="onTableOptionsChange"
    @on-panel-opened="onPanelOpened"
  >
    <template v-if="!areAllProductsLoaded" #notification>
      <icon-with-tooltip
        additional-classes="ml-2 text-secondary"
        :icon="mdiInformationOutline"
        :tooltip-text="$t('Product list is limited to 300 items, please use filters')"
      />
    </template>
  </settings-entities-overview>
</template>
<script>
import { mapState, mapActions } from 'pinia';
import { mdiInformationOutline, mdiSwapVertical } from '@mdi/js';
import isEqual from 'lodash/isEqual';

import useConfigurationStore from '@/stores/configuration';
import useStationStore from '@/stores/station';
import useFactoryStore from '@/stores/factory';
import useFilterbarStore from '@/stores/filterbar';
import useProfileStore from '@/stores/profile';
import useProductStore from '@/stores/product';
import useGenericNotificationStore from '@/stores/genericNotification';
import SettingsEntitiesOverview from '@/components/pages/settings/SettingsEntitiesOverview/index.vue';
import IconWithTooltip from '@/components/atoms/IconWithTooltip/index.vue';
import { createFilterConfiguration } from '@/components/organisms/settings/SettingsFilterBar/FilterBarConfigurations/productsFilterBarConf';
import { createTableHeadersConf } from '@/components/organisms/settings/SettingsEntitiesTable/TableConfigs/productsTableHeadersConf';
import productApi from '@/api/productApi';
import { eventBus } from '@/eventBus';
import builtInViewTypes from '@/components/pages/settings/SettingsEntitiesOverview/settingsBuiltInViewTypes.js';
import { tablePageOptions, tablePageOptionsInclAll } from '@/constants/tableOptions';
import getGroupsWithAdminPermissions from '@/helpers/permissions/getGroupsWithAdminPermissions';
import listToKeyMap from '@/helpers/list/listToKeyMap';

const icons = { mdiInformationOutline };

export default {
  name: 'ProductsOverviewComponent',
  components: {
    SettingsEntitiesOverview,
    IconWithTooltip,
  },
  data() {
    return {
      ...icons,
      isLoading: false,
      products: [],
      toggleBtnValue: builtInViewTypes.LIST,
      areAllProductsLoaded: false,
      isDeletingGroupInProgress: false,
      requestLimit: 300,
      allProductsInitiallyLoaded: false,
      productGroups: [],
      initialLoadFinished: false,
    };
  },
  computed: {
    ...mapState(useConfigurationStore, ['configuration']),
    ...mapState(useStationStore, ['getOrderedStationNamesArray']),
    ...mapState(useFactoryStore, ['getOrderedFactoryNamesArrayByStationIds', 'getFactoryIdsByStationIds']),
    ...mapState(useFilterbarStore, ['requestFilterState', 'currentFilterState']),
    ...mapState(useProfileStore, ['userHasGlobalGroupsIcon', 'highestRoleAllows', 'currentRoles']),
    isListViewVisible() {
      return this.toggleBtnValue === builtInViewTypes.LIST;
    },
    filterBarConf() {
      return createFilterConfiguration();
    },
    tableProducts() {
      return this.products.reduce((acc, product) => {
        const productGroup = this.productGroupsWithAdminPermissionsMap[product.groupId];
        if (!productGroup) return acc;
        acc.push({
          ...product,
          groupName: productGroup.name,
          factoryIds: this.getFactoryIdsByStationIds(product.stationIds, false), // initial factoryIds has group factories, this shows actual state
          factoryNamesArray: this.getOrderedFactoryNamesArrayByStationIds(product.stationIds, false),
          stationNamesArray: this.getOrderedStationNamesArray(product.stationIds, false),
          alternativeUnitId: product.alternativeUnitId || '-',
        });
        return acc;
      }, []);
    },
    requestParams() {
      return {
        term: this.currentFilterState.search || '',
        limit: this.requestLimit,
        factoryId: this.requestFilterState.factoryId || [],
        groupId: this.requestFilterState.groupId || [],
        stationId: this.requestFilterState.stationId || [],
      };
    },
    footerOptions() {
      return {
        itemsPerPageOptions: this.isListViewVisible ? tablePageOptions : tablePageOptionsInclAll,
        allItemsNotLoaded: !this.areAllProductsLoaded && this.isListViewVisible,
      };
    },
    menuItems() {
      return this.highestRoleAllows('dataImportExport') && this.reportName.length > 0
        ? [{
          text: this.$t('Data export and import'),
          icon: mdiSwapVertical,
          onClick: this.routeToDataImport,
        }]
        : [];
    },
    reportName() {
      const report = (this.configuration.settingsDataExportReports || []).find((r) => r.id === 'product');
      return report ? report.name : '';
    },
    productGroupsWithAdminPermissions() {
      return getGroupsWithAdminPermissions(this.productGroups, this.currentRoles);
    },
    productGroupsWithAdminPermissionsMap() {
      return listToKeyMap(this.productGroupsWithAdminPermissions, 'id');
    },
  },
  watch: {
    requestParams(newVal, oldVal) {
      if (!this.allProductsInitiallyLoaded && !isEqual(newVal, oldVal)) {
        this.fetchProducts({}, { extendProductList: false, replaceProducts: false, setAllProductsLoadedState: true });
        if (newVal.stationId !== oldVal.stationId || newVal.factoryId !== oldVal.factoryId) this.fetchFilteredProductGroups();
      }
    },
  },
  async mounted() {
    const promises = [
      this.fetchProductGroups(),
      this.fetchFilteredProductGroups(),
      this.fetchProducts(),
    ];
    await Promise.all(promises);
    this.initialLoadFinished = true;
    if (this.products.length < this.requestLimit) this.allProductsInitiallyLoaded = true;
    eventBus.$on('product-save-complete', (product, isEdit) => {
      this.onProductSaved(product, isEdit);
    });
    const productStore = useProductStore();
    productStore.$onAction(({ name, args, after }) => {
      after(() => {
        if (name === 'deleteProduct') this.onProductDeleted(args[0]);
      });
    });
  },
  methods: {
    ...mapActions(useProductStore, ['fetchProductGroups', 'saveProductGroupOrder', 'deleteProductGroup', 'patchProduct']),
    ...mapActions(useGenericNotificationStore, ['notifyError']),
    createTableHeadersConf,
    async onGroupOrderChange(data) {
      await this.saveProductGroupOrder(data);
      this.fetchFilteredProductGroups();
    },
    async onGroupDelete(group) {
      this.isDeletingGroupInProgress = true;
      await this.deleteProductGroup(group);
      this.isDeletingGroupInProgress = false;
    },
    async onProductOrderChange(data) {
      await this.patchProduct(data);
      this.fetchProducts({ groupId: data.groupId }, { extendProductList: false, replaceProducts: true, setAllProductsLoadedState: false });
    },
    async fetchProducts(queryOptions = {}, options = { extendProductList: false, replaceProducts: false, setAllProductsLoadedState: true }) {
      this.isLoading = true;
      try {
        const newProducts = await productApi.getProducts({ ...this.requestParams, ...queryOptions });
        if (options.setAllProductsLoadedState) this.areAllProductsLoaded = newProducts.length < this.requestLimit;
        if (options.replaceProducts) {
          newProducts.forEach((newProduct) => {
            const index = this.products.findIndex((product) => product.id === newProduct.id);
            if (index > -1) this.products.splice(index, 1, newProduct);
          });
        } else if (options.extendProductList) {
          newProducts.forEach((newProduct) => {
            const productIndex = this.products.findIndex((product) => product.id === newProduct.id);
            if (productIndex === -1) this.products.push(newProduct);
          });
        } else {
          this.products = newProducts;
        }
        this.products.sort((a, b) => (a.ordering > b.ordering ? 1 : -1));
      } catch {
        this.notifyError(this.$t('We are sorry! There is a problem with your request'));
      } finally {
        this.isLoading = false;
      }
    },
    async fetchFilteredProductGroups() {
      try {
        this.productGroups = await productApi.getProductGroups({ factoryId: this.requestParams.factoryId, stationId: this.requestParams.stationId });
      } catch {
        this.productGroups = [];
        this.notifyError(this.$t('We are sorry! There is a problem with your request'));
      }
    },
    onTableOptionsChange(tableOptions) {
      if (this.products.length === 0) return;
      const isLastButOnePage = tableOptions.itemsPerPage * tableOptions.page > this.products.length - tableOptions.itemsPerPage - 1;
      if (isLastButOnePage && !this.areAllProductsLoaded) {
        const lastLoadedProduct = this.products[this.products.length - 1];
        const cursor = lastLoadedProduct ? `${lastLoadedProduct.id}:${lastLoadedProduct.ordering}` : '';
        this.fetchProducts({ cursor }, { extendProductList: true, replaceProducts: false, setAllProductsLoadedState: true });
      }
    },
    onPanelOpened(groupId) {
      if (!this.areAllProductsLoaded) this.fetchProducts({ groupId, limit: null }, { extendProductList: true, replaceProducts: false, setAllProductsLoadedState: false });
    },
    onProductSaved(product, isEdit) {
      this.fetchProducts({ id: product.id }, { extendProductList: !isEdit, replaceProducts: isEdit, setAllProductsLoadedState: false });
    },
    onProductDeleted(deletedProduct) {
      const index = this.products.findIndex((product) => product.id === deletedProduct.id);
      if (index > -1) this.products.splice(index, 1);
    },
    routeToDataImport() {
      this.$router.push({ path: '/settings/products/dataImport', query: { reportName: this.reportName } });
    },
  },
};
</script>

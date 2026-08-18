<template>
  <div>
    <dialog-toolbar
      color="lw-blue"
      :title="dialogTitle"
    />
    <v-progress-linear
      v-if="loading"
      indeterminate
    />
    <v-card-text
      v-else
      class="d-flex flex-column dialog-content py-0"
      :class="{ 'is-full-screen': showFullscreenDialogs, 'is-mobile': isMobileView }"
    >
      <generic-tabs-row
        v-if="productChangeTabs.length > 1"
        v-model="tab"
        :items="tabs"
        :label-key="null"
        :height="isMobileView ? 40 : 56"
      />
      <v-window
        v-model="tab"
        class="overflow-visible"
      >
        <v-window-item
          v-for="item in productChangeTabs"
          :key="item"
          class="mt-4"
        >
          <shiftview-search
            v-if="!isMobileView || !isProductTabActive"
            :items="searchItems"
            :item-title-key="isProductTabActive ? 'name' : 'orderNumber'"
            :item-subtitle-function="getItemSku"
            :filter-items-on-search="false"
            :density="isMobileView ? 'compact' : 'default'"
            class="mb-2"
            @item-selected="onItemSelectedFromSearch"
            @on-search="onSearch"
          />
          <v-form
            :ref="`form-${tab}`"
            v-model="valid"
            @submit="onSave"
          >
            <v-row
              v-if="isProductTabActive && isMobileView"
              class="mb-2"
            >
              <v-col>
                <selection-input
                  :model-value="[selectedProduct.id]"
                  :hint="$t('Product')"
                  :items="productsWithSkuModifications"
                  :groups="productGroups"
                  :placeholder="$t('Product')"
                  item-secondary-text="sku"
                  :search-by-secondary-text="true"
                  :loading="searchItemsLoading"
                  is-single-select
                  is-grouped-select
                  required
                  dense
                  @search-input="onSearch"
                  @update:model-value="selectItemById($event[0])"
                >
                  <template
                    v-if="products.length === requestLimit"
                    #list-prepend
                  >
                    <info-block
                      :icon="mdiAlert"
                      color="#F28A0D"
                      header-text-color="text-main-dark"
                      class="mx-3 px-4"
                      :header="$t(`Product list is limited to 300 items, please use search`).replace('300', requestLimit)"
                    />
                  </template>
                </selection-input>
              </v-col>
            </v-row>
            <v-row
              v-else-if="isProductTabActive && !isMobileView"
              class="my-4"
            >
              <v-col
                v-if="productGroupsVisible"
                :cols="6"
                class="pr-1"
              >
                <shiftview-select
                  v-model="selectedGroupId"
                  :items="productGroups"
                  :subtitle="$t('Groups')"
                  :item-append-icon="mdiChevronRight"
                  :height="selectHeight"
                  @update:model-value="formData.productId = 0"
                />
              </v-col>
              <v-col
                :cols="productGroupsVisible ? 6 : 12"
                :class="productGroupsVisible ? 'pl-1' : ''"
              >
                <shiftview-select
                  v-model="formData.productId"
                  :items="selectedGroupProducts"
                  :title="productGroupTitle"
                  :subtitle="$t('Products')"
                  :additional-text="selectedGroupProducts.length < requestLimit ? '' : $t(`Product list is limited to 300 items, please use search`).replace('300', requestLimit)"
                  :item-subtitle-fn="getItemSku"
                  :height="selectHeight"
                  @update:model-value="selectItemById"
                />
              </v-col>
            </v-row>
            <v-row v-else>
              <shiftview-cards-list
                :items="visibleOrders"
                title-text-key="orderNumber"
                :subtitle-items-props="subtitleItemsProps"
                :additional-line-props="{ text: $t('Comment'), valueKey: 'productionOrderNote' }"
                :icon-fn="(job) => job.id === formData.jobId ? mdiRadioboxMarked : mdiRadioboxBlank"
                :icon-color-fn="(job) => job.id === formData.jobId ? 'primary' : ''"
                class="my-4 overflow-y-auto"
                :dense="isMobileView"
                :style="{ 'max-height': selectHeight }"
                :selected-item="selectedJob"
                :primary-action-icon="''"
                :secondary-action-icon="''"
                @item-clicked="selectItemById($event.item.orderNumber)"
              />
            </v-row>
            <v-row>
              <v-col
                v-if="isProductTabActive"
                :class="{ 'pr-1': isBreakpointSmAndUp }"
                class="mb-2"
                cols="12"
                :sm="6"
              >
                <evocon-v-input-with-selector
                  v-model="formData.plannedQty"
                  :placeholder="targetPlaceholder"
                  :hint="targetHint"
                  :items="units"
                  :selected-item="formData.unitId"
                  :rules="[targetRule]"
                  max-length="100"
                  validate-on-blur
                  type="number"
                  @selection="onUnitChange"
                />
              </v-col>
              <v-col
                v-if="showUnitQty"
                :class="{ 'pl-1': isBreakpointSmAndUp && isProductTabActive, 'pr-1': isBreakpointSmAndUp && !isProductTabActive, 'pl-0': isMobileView }"
                class="mb-2"
                cols="12"
                :sm="6"
              >
                <evocon-number-input
                  v-model="formData.unitQty"
                  :placeholder="`${$t('Enter quantity')} (${$t('Optional').toLowerCase()})`"
                  :hint="`${$t('Quantity per signal')} (${$t('Optional').toLowerCase()})`"
                  validate-on-blur
                  max-length="100"
                  :suffix="selectedProduct.unitId || ''"
                  :density="isMobileView ? 'compact' : 'default'"
                />
              </v-col>
              <v-col
                :cols="lotCodeCols"
                class="mb-2"
              >
                <evocon-v-input
                  v-model="formData.lotCode"
                  :placeholder="`${$t('LOT/Batch')}${requireLotBatch ? '' : ` (${$t('Optional').toLowerCase()})`}`"
                  :hint="`${$t('LOT/Batch')}${requireLotBatch ? '' : ` (${$t('Optional').toLowerCase()})`}`"
                  :density="isMobileView ? 'compact' : 'default'"
                  :max-length="200"
                  :required="requireLotBatch"
                  :rules="[lotBatchRule]"
                />
              </v-col>
              <v-col
                cols="12"
                class="mb-2"
                :class="{ 'pl-1': isBreakpointSmAndUp && !isProductTabActive }"
              >
                <evocon-v-combobox
                  v-model="formData.notes"
                  :placeholder="`${$t('Extra note')}${requireChangeoverNote ? '' : ` (${$t('Optional').toLowerCase()})`}`"
                  :hint="`${$t('Extra note')}${requireChangeoverNote ? '' : ` (${$t('Optional').toLowerCase()})`}`"
                  :items="extraNoteSuggestions"
                  persistent-hint
                  max-length="500"
                  :required="requireChangeoverNote"
                  :rules="[changeoverNoteRule]"
                  :density="isMobileView ? 'compact' : 'default'"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-window-item>
      </v-window>
    </v-card-text>
    <v-card-actions :class="{ 'fullscreen-card-actions': showFullscreenDialogs }">
      <delete-button
        v-if="firstSelectedSlice.isProductChange"
        id="delete-button"
        @click="deleteChangeover"
      />
      <v-spacer />
      <evocon-v-button
        id="cancel-button"
        type="secondary"
        :text="$t('Cancel')"
        @click="close"
      />
      <evocon-v-button
        id="save-button"
        :text="$t('Save')"
        color="primary"
        :loading="saveLoading"
        :disabled="isSaveBtnDisabled"
        @click="onSave"
      />
    </v-card-actions>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import {
  mdiChevronRight, mdiRadioboxMarked, mdiRadioboxBlank, mdiAlert,
} from '@mdi/js';
import { DateTime } from 'luxon';
import { isEqual } from 'lodash';

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
} from '@/stores/index';
import EvoconNumberInput from '@/components/atoms/EvoconNumberInput/index.vue';
import EvoconVCombobox from '@/components/atoms/EvoconVCombobox/index.vue';
import ShiftviewSelect from '@/components/organisms/shiftview/ShiftviewSelect/index.vue';
import productApi from '@/api/productApi';
import { eventBus } from '@/eventBus';
import DialogToolbar from '@/components/atoms/DialogToolbar/index.vue';
import GenericTabsRow from '@/components/molecules/GenericTabsRow/index.vue';
import addItemToLocalStorageArray from '@/helpers/localStorage/addItem';
import getItemsFromLocalStorageArray from '@/helpers/localStorage/getItemsFromLocalStorageArray';
import routesApi from '@/api/routesApi';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import DeleteButton from '@/components/atoms/DeleteButton/index.vue';
import { formatTimeInZone } from '@/helpers/time/formatTime';
import { getSelectedBatchUnits } from '@/helpers/timeline/selectedBatchUnits';
import { altUnitConversion, getUnitId } from '@/helpers/timeline/altUnitConversion';
import { convertQuantityOnUnitChange } from '@/helpers/timeline/convertQuantityOnUnitChange';
import ShiftviewCardsList from '@/components/organisms/shiftview/ShiftviewCardsList/index.vue';
import ShiftviewSearch from '@/components/organisms/shiftview/ShiftviewSearch/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import InfoBlock from '@/components/atoms/InfoBlock/index.vue';
import EvoconVInputWithSelector from '@/components/atoms/EvoconVInputWithSelector/index.vue';
import { getNormalizedValue } from '@/helpers/getNormalizedValue';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import { DIALOG_HEIGHT_PTC } from '@/constants/dialog';


const icons = {
  mdiChevronRight, mdiRadioboxMarked, mdiRadioboxBlank, mdiAlert,
};

export default {
  name: 'ShiftviewChangeoverDialog',
  components: {
    EvoconNumberInput,
    EvoconVCombobox,
    ShiftviewSelect,
    ShiftviewSearch,
    ShiftviewCardsList,
    DialogToolbar,
    GenericTabsRow,
    EvoconVButton,
    InfoBlock,
    EvoconVInputWithSelector,
    EvoconVInput,
    DeleteButton,
    SelectionInput,
  },
  data() {
    return {
      ...icons,
      loading: false,
      saveLoading: false,
      tab: 0,
      requestLimit: 300,
      selectedGroupId: undefined,
      productGroups: [],
      valid: true,
      searchItems: [],
      products: [],
      selectedGroupProducts: [],
      selectedProduct: {},
      jobs: [],
      selectHeight: '300px',
      units: [],
      formData: {
        productId: undefined,
        jobId: undefined,
        plannedQty: null,
        unitQty: undefined,
        notes: '',
        unitId: '',
      },
      preferAltUnit: false,
      searchItemsLoading: false,
      route: {},
      selectHeightTimeout: null,
    };
  },
  computed: {
    ...mapState(useShiftviewSelectionStore, ['firstSelectedSlice', 'bracketRange']),
    ...mapState(useShiftviewTimelineStore, ['batches']),
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(useConfigurationStore, ['productChangeTabs']),
    ...mapState(useFeatureStore, ['productionOrdersEnabled']),
    ...mapState(useDeviceStore, ['showFullscreenDialogs', 'isMobileView', 'screenWidth', 'screenHeight']),
    ...mapState(useUserPreferencesStore, ['viewSettings']),
    dialogTitle() {
      let actionLabel = this.firstSelectedSlice.isProductChange ? this.$t('Edit changeover') : this.$t('Add changeover');
      if (!this.loading && this.isProductTabActive && this.formData.productId) actionLabel = this.selectedGroupProducts.find((group) => group.id === this.formData.productId)?.name || '';
      else if (!this.loading && !this.isProductTabActive && this.formData.jobId) actionLabel = this.jobs.find((job) => job.id === this.formData.jobId)?.orderNumber || '';
      if (this.isMobileView) return actionLabel;
      const timeLabel = formatTimeInZone(this.changeoverTime, this.lineviewStation.zoneId);
      return `${actionLabel} ${timeLabel}`;
    },
    tabs() {
      return this.productChangeTabs.map((tab) => (tab === 'orders' ? this.$t('Production orders') : this.$t('Products')));
    },
    productGroupTitle() {
      return this.productGroups.find((group) => group.id === this.selectedGroupId)?.name || '';
    },
    changeoverTime() {
      if (!this.bracketRange.selectedRange) return DateTime.local().setZone(this.lineviewStation.zoneId).toISO();
      if (this.firstSelectedSlice.isProductChange) {
        return this.selectedBatch?.startTimeISO;
      }
      if (this.firstSelectedSlice.type === 'PRODUCT') {
        return this.firstSelectedSlice.sliceStartTmISO;
      }
      return this.bracketRange.selectedRange[0];
    },
    productGroupsVisible() {
      return this.productGroups.length > 1;
    },
    isProductTabActive() {
      return this.productChangeTabs[this.tab] === 'products';
    },
    extraNoteSuggestions() {
      return getItemsFromLocalStorageArray('changeoverNoteSuggestions', this.formData.notes || '');
    },
    isBreakpointSmAndUp() {
      return !!this.$vuetify.display.smAndUp;
    },
    selectedJob() {
      return this.jobs.find(({ id }) => this.formData.jobId === id);
    },
    visibleOrders() {
      return this.jobs.reduce((acc, job) => {
        const jobCopy = { ...job };
        if (jobCopy.alternativeUnitId && !this.viewSettings.usePrimaryUnit) jobCopy.targetQty = `${jobCopy.plannedQty * jobCopy.mainToAltUnitConversion} ${jobCopy.alternativeUnitId}`;
        else jobCopy.targetQty = `${jobCopy.plannedQty} ${jobCopy.unitId}`;
        jobCopy.productSku = jobCopy.productSku === jobCopy.productName ? '' : jobCopy.productSku;
        acc.push(jobCopy);
        return acc;
      }, []);
    },
    subtitleItemsProps() {
      return [
        { text: this.$t('Product name'), valueKey: 'productName' },
        { text: this.$t('Product code'), valueKey: 'productSku' },
        { text: this.$t('Target quantity'), valueKey: 'targetQty' },
        { text: this.$t('Setup time'), valueKey: 'setupTime' },
        { text: this.$t('LOT/Batch'), valueKey: 'lotCode' },
      ];
    },
    showUnitQty() {
      return this.lineviewStation.showUnitQty;
    },
    isTimeModeActive() {
      return this.lineviewStation.timeModeActive;
    },
    lotCodeCols() {
      /* eslint-disable no-magic-numbers */
      if (this.isMobileView) return 12;
      if (this.isProductTabActive) {
        return this.showUnitQty ? 12 : 6;
      }
      return this.showUnitQty ? 6 : 12;
    },
    productsWithSkuModifications() {
      const items = this.searchItems;
      if (this.selectedProduct.id && !this.searchItems.find((pr) => pr.id === this.selectedProduct.id)) {
        items.push(this.selectedProduct);
      }
      return items.map((product) => {
        const productCopy = { ...product };
        productCopy.sku = this.getItemSku(product);
        return productCopy;
      });
    },
    selectedBatch() {
      return this.batches.get(this.firstSelectedSlice.batchId) ?? {};
    },
    initialPlannedQty() {
      return this.selectedBatch.plannedQty ? altUnitConversion(this.selectedBatch, this.selectedBatch.plannedQty, this.preferAltUnit) : null;
    },
    isSameRoute() {
      if (this.formData.productId !== this.selectedBatch.productId) return false;
      const routeData = {
        cycleTimeCritical: this.route.cycleTimeCritical,
        cycleTimeGood: this.route.cycleTimeGood,
        unitConversion: this.route.unitConversion,
        unitConversionType: this.route.unitConversionType,
        unitQty: this.route.unitQty,
        scrapUnitQty: this.route.scrapUnitQty,
      };
      const batchData = {
        cycleTimeCritical: this.selectedBatch.cycleTimeCritical,
        cycleTimeGood: this.selectedBatch.cycleTimeGood,
        unitConversion: this.selectedBatch.unitConversion,
        unitConversionType: this.selectedBatch.unitConversionType,
        unitQty: this.selectedBatch.unitQty,
        scrapUnitQty: this.selectedBatch.scrapUnitQty,
      };
      return isEqual(routeData, batchData);
    },
    isSaveBtnDisabled() {
      const isProductMissing = this.isProductTabActive && !this.formData.productId;
      const isJobMissing = !this.isProductTabActive && !this.formData.jobId;
      if (isProductMissing || isJobMissing || this.saveLoading) return true;
      const isSameJobId = this.formData.jobId === this.jobs.find((job) => job.orderNumber === this.selectedBatch.productionOrder)?.id;
      const isSameItem = this.isProductTabActive ? this.isSameRoute : isSameJobId;
      const isSamePlannedQty = getNormalizedValue(this.formData.plannedQty) === getNormalizedValue(this.initialPlannedQty);
      const isSameNote = getNormalizedValue(this.formData.notes) === getNormalizedValue(this.selectedBatch.notes);
      const isSameLotCode = getNormalizedValue(this.formData.lotCode) === getNormalizedValue(this.selectedBatch.lotCode);
      const isSameUnitQty = this.showUnitQty ? getNormalizedValue(this.formData.unitQty) === getNormalizedValue(this.selectedBatch.unitQty) : true;
      const isSameUnitId = this.formData.unitId === getUnitId(this.selectedBatch, this.preferAltUnit);
      return this.firstSelectedSlice.isProductChange && isSameItem && isSamePlannedQty && isSameNote && isSameLotCode && isSameUnitQty && isSameUnitId;
    },
    targetPlaceholder() {
      if (this.isTimeModeActive) return this.$t('Target time');
      return `${this.$t('Target')} (${this.$t('Good quantity').toLowerCase()})`;
    },
    targetHint() {
      if (this.isTimeModeActive) return this.$t('Target time');
      return `${this.$t('Target')} (${this.$t('Optional').toLowerCase()})`;
    },
    targetRule() {
      if (!this.isTimeModeActive) return true;
      return !!this.formData.plannedQty || this.$t('Target time');
    },
    requireLotBatch() {
      return this.lineviewStation.requireLotBatch;
    },
    lotBatchRule() {
      if (!this.requireLotBatch) return true;
      return !!this.formData.lotCode?.trim() || this.$t('LOT/Batch');
    },
    requireChangeoverNote() {
      return this.lineviewStation.requireChangeoverNote;
    },
    changeoverNoteRule() {
      if (!this.requireChangeoverNote) return true;
      return !!this.formData.notes?.trim() || this.$t('Extra note');
    },
  },
  watch: {
    async selectedGroupId(groupId) {
      this.selectedGroupProducts = await productApi.getProducts({ stationId: this.lineviewStation.id, limit: this.requestLimit, groupId });
      this.checkSelectedProductExistenceInSelectedGroup(this.selectedProduct, groupId);
    },
    isProductTabActive(val) {
      if (val) this.searchItems = this.products;
      else this.searchItems = this.jobs;
      this.selectHeight = this.getSelectHeight();
    },
    screenWidth() {
      clearTimeout(this.selectHeightTimeout);
      this.selectHeightTimeout = setTimeout(() => {
        this.selectHeight = this.getSelectHeight();
      }, 300);
    },
    screenHeight() {
      clearTimeout(this.selectHeightTimeout);
      this.selectHeightTimeout = setTimeout(() => {
        this.selectHeight = this.getSelectHeight();
      }, 300);
    },
    selectedProduct(newVal, oldVal) {
      if (newVal.id === oldVal.id) return;
      this.units = getSelectedBatchUnits(newVal);
      this.formData.unitId = getUnitId(newVal, this.preferAltUnit);
    },
    route(newVal) {
      this.formData.unitQty = newVal.unitQty || null;
      this.formData.plannedQty = newVal.target || null;
    },
  },
  async mounted() {
    this.loading = true;
    if (this.productChangeTabs.indexOf('products') > -1) {
      this.productGroups = await productApi.getProductGroups({ stationId: this.lineviewStation.id, excludeEmpty: true });
      this.products = await productApi.getProducts({ stationId: this.lineviewStation.id, limit: this.requestLimit });
      if (this.isProductTabActive) this.searchItems = this.products;
    }
    if (this.productChangeTabs.indexOf('orders') > -1 && this.productionOrdersEnabled) {
      this.jobs = await productApi.getOrders({ stationId: this.lineviewStation.id, limit: this.requestLimit });
      if (!this.isProductTabActive) this.searchItems = this.jobs;
    }
    this.preferAltUnit = JSON.parse(window.localStorage.getItem('useAltUnitForChangeover'));
    if (this.firstSelectedSlice.isProductChange) {
      await this.setDialogData();
      this.selectedProduct = await this.getSelectedProduct();
    } else if (this.productGroups.length) this.selectedGroupId = this.productGroups[0].id;
    this.reOrderJobs();

    this.selectHeight = this.getSelectHeight();
    this.loading = false;
  },
  beforeUnmount() {
    clearTimeout(this.selectHeightTimeout);
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog']),
    ...mapActions(useGenericNotificationStore, ['notifySuccess', 'notifyError']),
    ...mapActions(useShiftviewSelectionStore, ['clearSliceSelection']),
    ...mapActions(useConfirmDialogStore, ['openConfirmDialog']),
    async setDialogData() {
      this.tab = this.selectedBatch.productionOrder ? this.productChangeTabs.indexOf('orders') : this.productChangeTabs.indexOf('products');

      if (this.isProductTabActive) {
        await this.selectItemById(this.selectedBatch.productId);
      } else {
        await this.selectJobByOrderNumber(this.selectedBatch.productionOrder);
      }

      this.formData.plannedQty = this.initialPlannedQty;
      this.formData.unitId = getUnitId(this.selectedBatch, this.preferAltUnit);
      this.formData.notes = this.selectedBatch.notes;
      this.formData.lotCode = this.selectedBatch.lotCode;
      if (this.showUnitQty) {
        this.formData.unitQty = this.selectedBatch.unitQty;
      }
    },
    close() {
      this.clearSliceSelection();
      this.closeDialog();
    },
    async onSave() {
      if ((!this.formData.productId && !this.formData.jobId) || this.saveLoading) return;
      await this.$refs[`form-${this.tab}`][0].validate();
      if (this.valid) {
        this.save();
      }
    },
    async save() {
      this.saveLoading = true;
      const result = await productApi.changeProduct(this.lineviewStation.id, { ...this.formData, eventTimeISO: this.changeoverTime });
      this.saveLoading = false;
      if (result.success) {
        const batchNote = this.selectedBatch.notes;
        if (batchNote !== this.formData.notes) {
          addItemToLocalStorageArray(this.formData.notes, 'changeoverNoteSuggestions');
        }
        window.localStorage.setItem('useAltUnitForChangeover', this.formData.unitId === this.selectedProduct.alternativeUnitId);
        this.closeDialog();
        this.clearSliceSelection();
        this.notifySuccess(this.$t('Product changeover saved'));
        eventBus.$emit('changeover-saved');
      } else {
        this.notifyError(result.message);
      }
    },
    async getSelectedProduct() {
      const selectedProduct = [...this.products, ...this.searchItems].find((product) => product.id === this.formData.productId);
      if (this.formData.productId && !selectedProduct) {
        const product = await this.getProductById(this.formData.productId);
        return product;
      }
      return selectedProduct || {};
    },
    async getProductById(id) {
      try {
        const product = await productApi.getProduct(id);
        return product;
      } catch {
        return {};
      }
    },
    async onItemSelectedFromSearch(item) {
      // as only first 100 products are loaded, the selected product might not be in the list
      if (this.isProductTabActive) {
        if (!this.products.find((pr) => pr.id === item.id)) this.products.push(item);
        this.checkSelectedProductExistenceInSelectedGroup(item, item.groupId);
      } else if (!this.jobs.find((j) => j.id === item.id)) this.jobs.push(item);
      if (this.isProductTabActive && !this.selectedProduct.id) {
        this.selectedGroupId = item.groupId; // setting the groupId queries all the group elements
        this.formData.productId = item.id;
        this.selectedProduct = await this.getSelectedProduct();
        this.formData.jobId = undefined;
        this.fetchRoute(item.id);
      } else {
        this.selectItemById(this.isProductTabActive ? item.id : item.orderNumber);
      }
    },
    reOrderJobs() {
      if (!this.jobs.length || !this.formData.jobId) {
        return;
      }
      this.jobs.sort((a) => (a.id === this.formData.jobId ? -1 : 1));
    },
    async selectItemById(id) {
      if (this.isProductTabActive) {
        this.formData.productId = id;
        this.selectedProduct = await this.getSelectedProduct();
        this.formData.jobId = undefined;
        this.selectedGroupId = this.selectedProduct?.groupId;
        await this.fetchRoute(id);
      } else {
        this.selectJobByOrderNumber(id);
      }
    },
    async selectJobByOrderNumber(orderNumber) {
      const job = this.jobs.find((item) => item.orderNumber === orderNumber);
      if (job) {
        this.formData.jobId = job.id;
        this.formData.productId = undefined;
        this.formData.lotCode = job.lotCode;
        await this.fetchRoute(job.productId);
      }
    },
    async onSearch(input) {
      this.searchItemsLoading = true;
      if (this.isProductTabActive) {
        this.searchItems = input
          ? await productApi.getProducts({ stationId: this.lineviewStation.id, term: input || '', limit: this.requestLimit })
          : this.products;
      } else if (this.productionOrdersEnabled) {
        this.searchItems = input
          ? await productApi.getOrders({ stationId: this.lineviewStation.id, term: input, limit: this.requestLimit })
          : this.jobs;
      }
      this.searchItemsLoading = false;
    },
    async fetchRoute(productId) {
      if (!productId) return;
      if (!this.isTimeModeActive && !this.showUnitQty) return;
      const routes = await routesApi.getRoutes({ stationId: this.lineviewStation.id, productId });
      this.route = routes[0] || {};
    },
    deleteChangeover() {
      const confirmDialogConfig = {
        title: this.$t('Confirmation'),
        text: this.$t('Are you sure you want to delete this product changeover?'),
        hasLoading: true,
        action: async () => {
          const batchStart = DateTime.fromISO(this.selectedBatch.startTimeISO, { zone: this.lineviewStation.zoneId });
          const eventTime = batchStart.plus({ seconds: 1 }).toFormat('yyyyMMddHHmmssZZZ');
          const response = await productApi.deleteChangeover(this.lineviewStation.id, eventTime);
          if (response.success) {
            this.closeDialog();
            this.clearSliceSelection();
            this.notifySuccess(this.$t('Product changeover deleted'));
          } else {
            this.notifyError(response.message);
          }
        },
        confirmText: this.$t('Delete'),
        cancelText: this.$t('Cancel'),
      };
      this.openConfirmDialog(confirmDialogConfig);
    },
    checkSelectedProductExistenceInSelectedGroup(product, groupId) {
      if (product.id && !product.deleted && product.groupId === groupId && !this.selectedGroupProducts.find((pr) => pr.id === product.id)) this.selectedGroupProducts.push(product);
    },
    getSelectHeight() {
      /* eslint-disable no-magic-numbers */
      const dialogHeightConstant = this.showFullscreenDialogs ? 1 : DIALOG_HEIGHT_PTC;
      const dialogHeight = window.innerHeight * dialogHeightConstant;
      const toolbarHeight = 64;
      let tabsHeight = 0;
      if (this.productChangeTabs.length > 1) tabsHeight = this.isMobileView ? 40 : 56;
      const searchHeight = this.isMobileView ? 40 : 56;
      const inputHeight = this.isMobileView ? 70 : 86;
      const actionsHeight = this.isMobileView ? 52 : 60;
      let numberOfInputRows = 2;
      if (this.isMobileView) {
        if (this.isProductTabActive) numberOfInputRows += 1;
        if (this.showUnitQty) numberOfInputRows += 1;
      } else if (this.isProductTabActive && this.showUnitQty) numberOfInputRows += 1;
      const padding = 48;
      const height = Math.max(200, dialogHeight - toolbarHeight - tabsHeight - searchHeight - (numberOfInputRows * inputHeight) - actionsHeight - padding);
      return `${height}px`;
      /* eslint-enable no-magic-numbers */
    },
    getItemSku(item) {
      const skuField = this.isProductTabActive ? 'sku' : 'productSku';
      if (item[skuField] && item[skuField] !== item.name) {
        return item[skuField];
      }
      return '';
    },
    onUnitChange(selectedUnitId) {
      this.formData.plannedQty = convertQuantityOnUnitChange(this.formData.plannedQty, this.formData.unitId, selectedUnitId, this.selectedBatch);
      this.formData.unitId = selectedUnitId;
    },
  },
};
</script>

<style lang="scss" scoped>
.dialog-content {
  max-height: calc(var(--app-height) * 1px - 200px);
  overflow-y: auto;
  &.is-full-screen {
    max-height: calc(var(--app-height) * 1px - 124px);
    &.is-mobile {
      max-height: calc(var(--app-height) * 1px - 116px);
    }
  }

}
</style>

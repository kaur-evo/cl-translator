<template>
  <v-col class="pa-0">
    <v-row class="tracking-data-description justify-center align-center">
      <div class="text-center">
        <div class="text-headline-small font-weight-medium">
          {{ $t('Tracking data') }}
        </div>
        <div class="text-body-medium text-medium-emphasis font-weight-regular">
          {{ $t('Select data to be tracked during improvement project') }}
        </div>
      </div>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-row
          id="production-event-description"
          class="fill-height align-center"
        >
          <div class="pb-4 pl-3">
            <div class="text-body-small text-medium-emphasis">
              {{ $t('Production event') }}
            </div>
            <div class="text-body-large text-high-emphasis d-flex">
              {{ $t('Downtime') }}
            </div>
          </div>
        </v-row>
      </v-col>
      <v-col
        v-if="hasMultipleFactories"
        id="factories-selection"
        class="pb-2"
        :class="isBreakpointSmAndDown ? 'pr-0' : 'pr-2'"
        cols="12"
        md="6"
      >
        <selection-input
          :model-value="[factory]"
          :items="factories"
          :placeholder="$t('Factory')"
          :hint="$t('Factory')"
          is-single-select
          hide-search
          :required="hasMultipleFactories"
          @update:model-value="onFactoryChange($event[0])"
        />
      </v-col>
      <v-col
        class="pb-2"
        :class="hasMultipleFactories && isBreakpointMdAndUp ? 'pl-2' : 'pl-0'"
        :cols="hasMultipleFactories && isBreakpointMdAndUp ? 6 : 12"
      >
        <generic-station-input
          :model-value="formData.stationIds"
          :items="filteredStations"
          :disabled="hasMultipleFactories && !factory"
          required
          @change="onStationChange"
        />
      </v-col>
      <v-col
        id="comments-selection"
        class="pb-2"
        :class="isBreakpointSmAndDown ? 'pr-0' : 'pr-2'"
        cols="12"
        md="6"
      >
        <selection-input
          :model-value="formData.commentIds"
          :items="filteredComments"
          :groups="filteredCommentGroups"
          :placeholder="$t('Stop reasons')"
          :hint="$t('Stop reasons')"
          :loading="areCommentsLoading"
          :disabled="!formData.stationIds.length && !areCommentsLoading"
          is-grouped-select
          required
          @update:model-value="onCommentsSelected"
        />
      </v-col>
      <v-col
        id="positions-selection"
        class="pb-2"
        :class="isBreakpointSmAndDown ? 'pl-0' : 'pl-2'"
        cols="12"
        md="6"
      >
        <selection-input
          :model-value="formData.positionIds"
          :items="filteredPositions"
          :placeholder="$t('Machine locations')"
          :hint="`${$t('Machine locations')} (${$t('Optional').toLowerCase()})`"
          :disabled="!formData.stationIds.length"
          @update:model-value="onPositionChange"
        />
      </v-col>
      <v-col
        id="products-selection"
        :class="isBreakpointSmAndDown ? 'pr-0' : 'pr-2'"
        cols="12"
        md="6"
      >
        <advanced-selection-input
          :model-value="formData.productIds || []"
          :configuration="productsConfiguration"
          :placeholder="$t('products')"
          :hint="$t('products')"
          :disabled="!formData.stationIds.length"
          :is-inverted="formData.productsAllSelected"
          :filter-by="[{ key: 'stationId', value: formData.stationIds }]"
          is-grouped-select
          show-empty-array-as-all-selected
          @update:is-inverted="onIsInvertedUpdate"
          @update:model-value="onSelectedProductsChange"
        />
      </v-col>
      <v-col
        id="new-products-checkbox"
        class="pl-2 my-4 d-flex align-center"
        cols="12"
        md="6"
      >
        <evocon-v-checkbox
          :model-value="formData.includeNewProducts"
          class="mt-n5 new-products-checkbox"
          :label="$t('Include new products')"
          :disabled="formData.productIds.length !== filteredProducts.length"
          @update:model-value="$emit('form-data-changed', { includeNewProducts: $event })"
        />
        <icon-with-tooltip
          :icon="mdiInformation"
          :tooltip-text="$t('Include in tracking data all new products added during the project.')"
          additional-classes="ml-4 mt-n5"
        />
      </v-col>
      <v-col
        v-if="stopDuration && stopDuration.periodAverage === 0"
        id="baseline-data-alert"
        class="px-3 pb-2"
        cols="12"
      >
        <div>
          <v-icon
            class="ml-3"
            color="secondary"
            size="small"
          >
            {{ mdiAlertOutline }}
          </v-icon>
          <span class="text-label-small text-uppercase font-weight-medium text-medium-emphasis">
            {{ $t('No baseline data available for this selection') }}
          </span>
        </div>
      </v-col>
    </v-row>
  </v-col>
</template>
<script>
import { mapState, mapActions } from 'pinia';
import { mdiPencil, mdiInformation, mdiAlertOutline } from '@mdi/js';

import {
  useFactoryStore,
  useStationStore,
  useCommentStore,
  usePositionStore,
  useProductStore,
} from '@/stores/index';
import getFactoryId from '@/helpers/factory-helper';
import EvoconVCheckbox from '@/components/atoms/EvoconVCheckbox/index.vue';
import IconWithTooltip from '@/components/atoms/IconWithTooltip/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import AdvancedSelectionInput from '@/components/molecules/AdvancedSelectionInput/index.vue';
import GenericStationInput from '@/components/organisms/GenericStationInput/index.vue';

const vectorIcons = { mdiPencil, mdiInformation, mdiAlertOutline };
const productsConfiguration = {
  attr: {
    itemText: 'name',
    itemSecondaryText: 'sku',
    searchBySecondaryText: true,
    itemValue: 'id',
    prependText: `${'products'}:`,
    useCustomSorting: true,
  },
  backendFilteringConfig: {
    entity: 'products',
  },
  label: 'products',
  storeLoadingGetterPath: 'product/isLoading',
  storeDispatchPaths: ['product/fetchProductGroups'],
  storeItemGroupsGetterPath: 'product/productGroups',
  defaultValue: [],
  useSelectionInversion: true,
};
export default {
  name: 'ImprovementTrackingSection',
  components: {
    EvoconVCheckbox,
    IconWithTooltip,
    SelectionInput,
    AdvancedSelectionInput,
    GenericStationInput,
  },
  props: {
    formData: {
      type: Object,
      default: () => {},
    },
    stopDuration: {
      type: Object,
      default: () => {},
    },
  },
  emits: ['form-data-changed', 'required-fields-changed', 'get-comment-stats'],
  data() {
    return {
      ...vectorIcons,
      areProductsLoading: false,
      factory: null,
      unselectedProducts: [],
      selectedProductsSearch: '',
      productsConfiguration,
      isMounted: false,
    };
  },
  computed: {
    ...mapState(useFactoryStore, ['factories', 'hasMultipleFactories']),
    ...mapState(useStationStore, ['stations', 'stationsMap']),
    ...mapState(useCommentStore, { commentGroups: 'commentGroupsIncludePredefined', comments: 'comments', areCommentsLoading: 'isLoading' }),
    ...mapState(usePositionStore, ['getPositionsByStationIds']),
    ...mapState(useProductStore, ['products']),
    filteredComments() {
      return this.comments.filter((comment) => comment.id === 0 || comment.stationIds.some((id) => this.formData.stationIds.includes(id)));
    },
    filteredCommentGroups() {
      return this.commentGroups.filter((group) => group.factoryIds.length === 0 || group.factoryIds.includes(this.factory));
    },
    filteredProducts() {
      return this.products.filter((product) => !product.deleted && product.stationIds.some((id) => this.formData.stationIds.includes(id)));
    },
    filteredPositions() {
      const result = this.getPositionsByStationIds(this.formData.stationIds);
      result.push({ id: 0, name: 'Unknown' }); // TO GET STOPS WITHOUT LOCATIONS
      return result;
    },
    isBreakpointSmAndDown() {
      return !!this.$vuetify.display.smAndDown;
    },
    isBreakpointMdAndUp() {
      return !!this.$vuetify.display.mdAndUp;
    },
    filteredStations() {
      const stationFactoryIsSelected = (factoryId) => !this.hasMultipleFactories || this.factory === factoryId;
      return this.stations.filter((station) => stationFactoryIsSelected(station.factoryId));
    },
  },
  watch: {
    selectedProductsSearch() {
      this.setProducts();
    },
  },
  async mounted() {
    this.isMounted = false;
    this.factory = this.formData.factoryId || getFactoryId(this.stationsMap, this.formData.stationIds[0]) || null;
    this.$emit('required-fields-changed');
    this.$emit('get-comment-stats');
    this.isMounted = true;
  },
  methods: {
    ...mapActions(useProductStore, ['fetchProducts']),
    onFactoryChange(val) {
      this.factory = val;
      this.$emit('form-data-changed', {
        factoryId: val,
        stationIds: [],
        commentIds: [],
        productIds: [],
        positionIds: [],
      });
    },
    async onStationChange(val) {
      const filteredProductIds = this.filteredProducts.map((x) => x.id);
      if (val !== undefined && this.isMounted) this.$emit('form-data-changed', { stationIds: val, productIds: [], commentIds: [] });
      this.unselectedProducts = [];
      await this.setProducts();
      if (!this.formData.productIds.length) {
        this.$emit('form-data-changed', { productIds: filteredProductIds });
      } else if (filteredProductIds.length) {
        this.$emit('form-data-changed', { productIds: this.formData.productIds.filter((id) => filteredProductIds.indexOf(id) >= 0) });
      }
      this.$emit('required-fields-changed');
      this.$emit('get-comment-stats');
    },
    onSelectedProductsChange(val) {
      if (val !== undefined) this.$emit('form-data-changed', { productIds: val });
      this.selectedProductsSearch = '';
      this.$emit('required-fields-changed');
      this.$emit('get-comment-stats');
    },
    onPositionChange(val) {
      this.$emit('form-data-changed', { positionIds: val });
      if (val && this.formData.commentIds.length) {
        this.$emit('get-comment-stats');
      }
    },
    onCommentsSelected(val) {
      this.$emit('form-data-changed', { commentIds: val });
      this.$emit('required-fields-changed');
      this.$emit('get-comment-stats');
    },
    async setProducts() {
      this.areProductsLoading = true;
      await this.fetchProducts({ stationId: this.formData.stationIds, limit: 500, term: this.selectedProductsSearch });
      this.areProductsLoading = false;
    },
    onIsInvertedUpdate(val) {
      this.$emit('form-data-changed', {
        productsAllSelected: val,
      });
      this.$emit('required-fields-changed');
      this.$emit('get-comment-stats');
    },
  },
};
</script>
<style lang="less" scoped>
.tracking-data-description {
  height: 96px;
}
.new-products-checkbox {
  max-width: fit-content;
}
</style>

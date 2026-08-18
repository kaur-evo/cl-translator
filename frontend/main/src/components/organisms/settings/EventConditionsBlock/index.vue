<template>
  <responsive-condition-block v-if="!loading" class="pb-4">
    <template #header>
      <v-icon color="primary" size="16" class="mr-2">
        {{ mdiCheckCircle }}
      </v-icon>
      <span class="font-weight-medium">
        {{ $t('Filters') }}
      </span>
    </template>
    <template #content>
      <selection-input
        v-if="factories.length > 1 && filters.includes('factoryIds')"
        :model-value="requirements.factoryIds"
        :items="factories"
        :prepend-text="`${$t('Factories')}:`"
        use-chips
        menu-input-class="ma-1"
        show-empty-array-as-all-selected
        remove-non-existent-selections
        @update:model-value="$emit('update:requirements', { factoryIds: $event })"
      />
      <selection-input
        v-if="filters.includes('stationIds')"
        :model-value="requirements.stationIds"
        :items="filteredStations"
        :groups="stationGroups"
        :prepend-text="`${$t('Stations')}:`"
        use-chips
        menu-input-class="ma-1"
        show-empty-array-as-all-selected
        is-grouped-select
        remove-non-existent-selections
        @update:model-value="$emit('update:requirements', { stationIds: $event })"
      />
      <advanced-selection-input
        v-if="filters.includes('productIds')"
        :model-value="requirements.productIds"
        :configuration="productsConfiguration"
        :limit="1000"
        :prepend-text="`${$t('products')}:`"
        use-chips
        :filter-by="[{ key: 'stationId', value: requirements.stationIds }]"
        is-grouped-select
        show-empty-array-as-all-selected
        select-all-as-empty
        item-secondary-text="sku"
        menu-input-class="ma-1"
        search-by-secondary-text
        @update:model-value="$emit('update:requirements', { productIds: $event })"
      />
      <selection-input
        v-if="filters.includes('operatorIds')"
        :model-value="requirements.operatorIds"
        :items="filteredOperators"
        :prepend-text="`${$t('Operators')}:`"
        use-chips
        menu-input-class="ma-1"
        show-empty-array-as-all-selected
        remove-non-existent-selections
        @update:model-value="$emit('update:requirements', { operatorIds: $event })"
      />
      <selection-input
        v-if="filters.includes('shiftTemplateIds')"
        :model-value="requirements.shiftTemplateIds"
        :items="filteredShiftTemplates"
        :prepend-text="`${$t('Shifts')}:`"
        item-text="name"
        item-value="id"
        use-chips
        menu-input-class="ma-1"
        show-empty-array-as-all-selected
        remove-non-existent-selections
        @update:model-value="$emit('update:requirements', { shiftTemplateIds: $event })"
      />
      <evocon-v-button
        :text="$t('Reset')"
        size="small"
        class="my-1"
        :class="isMobileView ? 'ml-auto mr-0' : 'ml-6'"
        type="secondary"
        :disabled="isFilterResetDisabled"
        @click="resetFilters"
      />
    </template>
  </responsive-condition-block>
  <responsive-condition-block v-if="!loading" class="pb-4">
    <template #header>
      <v-icon
        :color="triggerIconColor"
        size="16"
        class="mr-2"
      >
        {{ isTriggerComplete && !hasTriggerError ? mdiCheckCircle : mdiCheckCircleOutline }}
      </v-icon>
      <span class="font-weight-medium">
        {{ secondaryTitle }}
      </span>
      <new-indicator class="ml-2" shown-until="2026-04-30T00:00:00" small />
    </template>
    <template #content>
      <checklist-trigger-block
        v-if="eventType === 'checklist'"
        ref="checklistTriggerBlock"
        :requirements="requirements"
        :saved-requirements="savedRequirements"
        @update:requirements="$emit('update:requirements', $event)"
        @update:is-trigger-complete="isTriggerComplete = $event"
        @update:has-trigger-error="hasTriggerError = $event"
      />
      <alert-trigger-block
        v-if="eventType === 'alert'"
        ref="alertTriggerBlock"
        :requirements="requirements"
        :saved-requirements="savedRequirements"
        :filtered-positions="filteredPositions"
        @update:requirements="$emit('update:requirements', $event)"
        @update:is-trigger-complete="isTriggerComplete = $event"
        @update:has-trigger-error="hasTriggerError = $event"
        @alert-subtype-change="$emit('alert-subtype-change', $event)"
      />
    </template>
  </responsive-condition-block>
</template>

<script>
import { mdiCheckCircle, mdiCheckCircleOutline } from '@mdi/js';
import { mapState } from 'pinia';
import { isEqual } from 'lodash';

import useFactoryStore from '@/stores/factory';
import useStationStore from '@/stores/station';
import useOperatorStore from '@/stores/operator';
import usePositionStore from '@/stores/position';
import useDeviceStore from '@/stores/device';
import useShiftTemplateStore from '@/stores/shiftTemplate';
import NewIndicator from '@/components/atoms/NewIndicator/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import ChecklistTriggerBlock from '@/components/organisms/settings/ChecklistTriggerBlock/index.vue';
import AlertTriggerBlock from '@/components/organisms/settings/AlertTriggerBlock/index.vue';
import AdvancedSelectionInput from '@/components/molecules/AdvancedSelectionInput/index.vue';
import ResponsiveConditionBlock from '@/components/atoms/ResponsiveConditionBlock/index.vue';
const icons = { mdiCheckCircle, mdiCheckCircleOutline };

export default {
  name: 'EventConditionsBlock',
  components: {
    NewIndicator,
    SelectionInput,
    EvoconVButton,
    ChecklistTriggerBlock,
    AlertTriggerBlock,
    AdvancedSelectionInput,
    ResponsiveConditionBlock,
  },
  props: {
    eventType: {
      type: String,
      required: true,
    },
    requirements: {
      type: Object,
      default: () => ({}),
    },
    savedRequirements: {
      type: Object,
      default: () => ({}),
    },
    secondaryTitle: {
      type: String,
      default: '',
    },
    filters: {
      type: Array,
      default: () => ['factoryIds', 'stationIds', 'productIds', 'operatorIds', 'shiftTemplateIds'],
    },
    loading: {
      type: Boolean,
    },
    stationsOverwrite: {
      type: Array,
      default: () => null,
    },
  },
  emits: ['update:requirements', 'update:requirements-ready', 'alert-subtype-change'],
  data() {
    return {
      ...icons,
      isTriggerComplete: false,
      hasTriggerError: false,
      productsConfiguration: {
        attr: {
          itemText: 'name',
          itemSecondaryText: 'sku',
          searchBySecondaryText: true,
          itemValue: 'id',
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
        useSelectionInversion: false,
      },
    };
  },
  computed: {
    ...mapState(useFactoryStore, ['factories']),
    ...mapState(useStationStore, ['stations', 'stationGroups', 'stationsWithAdminPermissions']),
    ...mapState(useOperatorStore, ['operatorsIncludeNotSpecified']),
    ...mapState(useShiftTemplateStore, ['shiftTemplatesWithAdminPermissions']),
    ...mapState(usePositionStore, ['positionsWithAdminPermissions']),
    ...mapState(useDeviceStore, ['isMobileView']),
    isFilterResetDisabled() {
      return this.filters.every((key) => isEqual(this.requirements[key], this.savedRequirements[key]));
    },
    visibleStations() {
      return this.stations.filter((station) => {
        if (this.stationsOverwrite) {
          return this.stationsOverwrite.includes(station.id);
        }
        return true;
      });
    },
    filteredStations() {
      return this.requirements.factoryIds?.length > 0
        ? this.visibleStations.filter((station) => this.requirements.factoryIds.includes(station.factoryId))
        : this.visibleStations;
    },
    triggerIconColor() {
      if (this.hasTriggerError) return 'error';
      return this.isTriggerComplete ? 'primary' : 'secondary-text';
    },
    filteredOperators() {
      const stationIds = this.requirements.stationIds?.length > 0 ? this.requirements.stationIds : this.visibleStations.map((station) => station.id);
      return this.operatorsIncludeNotSpecified.filter((operator) => {
        if (!operator.stationIds) return true; // unknown operator
        const factoryFilter = (op) => this.requirements.factoryIds?.length === 0 || this.requirements.factoryIds?.some((id) => op.factoryIds.includes(id));
        const stationFilter = (op) => stationIds.length === 0 || stationIds.some((id) => op.stationIds.includes(id));
        return factoryFilter(operator) && stationFilter(operator);
      });
    },
    availableStationIds() {
      return this.requirements.stationIds?.length > 0
        ? this.requirements.stationIds
        : this.stationsWithAdminPermissions.map((station) => station.id);
    },
    filteredShiftTemplates() {
      return this.filterByStations(this.shiftTemplatesWithAdminPermissions);
    },
    filteredPositions() {
      return this.filterByStations(this.positionsWithAdminPermissions);
    },
  },
  watch: {
    isTriggerComplete() {
      this.$emit('update:requirements-ready', this.isTriggerComplete && !this.hasTriggerError);
    },
    hasTriggerError() {
      this.$emit('update:requirements-ready', this.isTriggerComplete && !this.hasTriggerError);
    },
  },
  methods: {
    filterByStations(entities) {
      return entities.filter(
        (entity) => entity.stationIds?.some((id) => this.availableStationIds.includes(id)),
      );
    },
    resetFilters() {
      const emitObj = this.filters.reduce((acc, filter) => {
        acc[filter] = this.savedRequirements[filter];
        return acc;
      }, {});
      this.$emit('update:requirements', emitObj);
    },
  },
};
</script>

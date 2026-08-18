<template>
  <v-menu
    v-model="isMenuOpen"
    eager
    offset="-30"
    :close-on-content-click="false"
  >
    <template #activator="{ props }">
      <evocon-v-input
        v-bind="{ ...$attrs, ...props }"
        :model-value="dateRangeLabel"
        readonly
      >
        <template #prepend-inner>
          <v-icon>{{ mdiCalendar }}</v-icon>
        </template>
        <template #append-inner>
          <v-icon :class="{ rotate180deg: isMenuOpen }">
            {{ mdiMenuDown }}
          </v-icon>
        </template>
      </evocon-v-input>
    </template>
    <v-card>
      <v-card-text>
        <double-date-range-picker
          :selection-type="internalSelectionType"
          :model-value="internalDateRange"
          :max="maxDate"
          :min="min"
          :show-period-selection="showPeriodSelection"
          :navigate-to-end-disabled="navigateToEndDisabled"
          @change="onDateRangeChange"
          @change-selection-type="internalSelectionType = $event"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <evocon-v-button
          type="secondary"
          :text="$t('Cancel')"
          size="small"
          class="mr-2"
          @click="onCancel"
        />
        <evocon-v-button
          color="primary"
          :text="$t('Apply')"
          size="small"
          @click="onApply"
        />
      </v-card-actions>
    </v-card>
  </v-menu>
</template>
<script>
import { format } from 'date-fns';
import { mdiMenuDown, mdiCalendar } from '@mdi/js';

import DoubleDateRangePicker from '@/components/molecules/DoubleDateRangePicker/index.vue';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import { formatDate } from '@/helpers/date/formatDate';
import {
  CUSTOM, THIS_QUARTER, LAST_QUARTER, LAST_4_QUARTERS, ROLLING_12_MONTHS,
} from '@/constants/predefinedTimePeriodNames';

const vectorIcons = { mdiMenuDown, mdiCalendar };
export default {
  name: 'DoubleDateRangeMenu',
  components: {
    DoubleDateRangePicker,
    EvoconVInput,
    EvoconVButton,
  },
  props: {
    dateRange: { type: Array, default: () => [] },
    selectionType: { type: String, default: 'thisweek' },
    showPeriodSelection: { type: Boolean, default: true },
    max: { type: String, default: undefined },
    min: { type: String, default: null },
    navigateToEndDisabled: { type: Boolean, default: false },
  },
  emits: ['update:date-range', 'update:selection-type'],
  data() {
    return {
      ...vectorIcons,
      isMenuOpen: false,
      internalDateRange: [...this.dateRange],
      internalSelectionType: this.selectionType,
    };
  },
  computed: {
    maxDate() {
      if (this.max === undefined) return format(new Date(), 'yyyy-MM-dd');
      return this.max;
    },
    actualDateRange() {
      if (this.internalDateRange.length === 1) {
        return [this.internalDateRange[0], this.internalDateRange[0]];
      }
      return this.internalDateRange;
    },
    dateRangeLabel() {
      if (this.internalSelectionType === CUSTOM) {
        return this.actualDateRange.map((d) => formatDate(d, 'long')).join(' - ');
      }
      if (this.internalSelectionType === THIS_QUARTER) return this.$t('This quarter');
      if (this.internalSelectionType === LAST_QUARTER) return this.$t('Last quarter');
      if (this.internalSelectionType === LAST_4_QUARTERS) return this.$t('Last 4 quarters');
      if (this.internalSelectionType === ROLLING_12_MONTHS) return this.$t('Last 12 months');
      return this.$t(this.internalSelectionType);
    },
  },
  watch: {
    isMenuOpen(val) {
      if (!val) {
        this.internalDateRange = this.dateRange;
        this.internalSelectionType = this.selectionType;
      }
    },
  },
  methods: {
    onDateRangeChange({ dateRange }) {
      if (dateRange.length === 1) {
        this.internalDateRange = [dateRange[0], dateRange[0]];
      } else {
        this.internalDateRange = dateRange;
      }
    },
    onApply() {
      this.$emit('update:date-range', this.internalDateRange);
      this.$emit('update:selection-type', this.internalSelectionType);
      this.isMenuOpen = false;
    },
    onCancel() {
      this.internalDateRange = [...this.dateRange];
      this.internalSelectionType = this.selectionType;
      this.isMenuOpen = false;
    },
  },
};
</script>

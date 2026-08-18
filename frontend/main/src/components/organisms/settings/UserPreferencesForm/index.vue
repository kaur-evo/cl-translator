<template>
  <v-row>
    <v-col
      v-if="isLineviewUser"
      class="px-1 mb-2"
      :cols="isMobileView ? 12 : 6"
    >
      <selection-input
        :model-value="formData.lineviewLanguages"
        :items="languages"
        :placeholder="$t('Languages')"
        :hint="$t('Languages')"
        item-value="languageId"
        item-flag="languageId"
        hide-search
        required
        @update:model-value="$emit('update-preference', { key: 'lineviewLanguages', value: $event })"
      />
    </v-col>
    <v-col
      class="px-1 mb-2"
      :cols="(hasStartPageOption || isLineviewUser) && !isMobileView ? 6 : 12"
    >
      <selection-input
        :model-value="[formData.defaultStationId]"
        :placeholder="$t('Default station')"
        :items="filteredStations"
        :hint="$t('Default station')"
        :prepend-inner-icon="mdiMonitor"
        is-single-select
        hide-search
        @update:model-value="$emit('update-preference', { key: 'defaultStationId', value: $event[0] })"
      />
    </v-col>
    <v-col
      v-if="hasStartPageOption"
      :cols="isMobileView ? 12 : 6"
      class="px-1 mb-2"
    >
      <selection-input
        :model-value="[formData.startPage]"
        :placeholder="$t('Default start page')"
        :items="modules.filter((el) => !el.hidden)"
        :hint="$t('Default start page')"
        :prepend-inner-icon="mdiHome"
        is-single-select
        hide-search
        @update:model-value="$emit('update-preference', { key: 'startPage', value: $event[0] })"
      />
    </v-col>
    <v-col
      sm="4"
      :cols="isMobileView ? 12 : 6"
      class="px-1 mb-2"
    >
      <selection-input
        :model-value="[selectedNumberFormat.displayValue]"
        :items="numberFormats"
        :hint="$t('Number format')"
        :prepend-inner-icon="mdiNumeric"
        item-value="displayValue"
        item-text="displayValue"
        is-single-select
        hide-search
        required
        @update:model-value="onSelectNumberFormat"
      />
    </v-col>
    <v-col
      sm="4"
      :cols="isMobileView ? 12 : 6"
      class="px-1 mb-2"
    >
      <selection-input
        :model-value="[formData.decimalPlaces]"
        :items="decimalOptions"
        :hint="$t('Number of decimals')"
        :prepend-inner-icon="mdiDecimal"
        is-single-select
        hide-search
        required
        @update:model-value="$emit('update-preference', { key: 'decimalPlaces', value: $event[0] })"
      />
    </v-col>
    <v-col
      sm="4"
      :cols="isMobileView ? 12 : 6"
      class="px-1 mb-2"
    >
      <selection-input
        :model-value="[formData.pctDecimalPlaces]"
        :items="decimalOptions.slice(0, 3)"
        :item-text="'pctName'"
        :hint="`${$t('Number of decimals')} %`"
        :prepend-inner-icon="mdiPercentOutline"
        is-single-select
        hide-search
        required
        @update:model-value="$emit('update-preference', { key: 'pctDecimalPlaces', value: $event[0] })"
      />
    </v-col>
    <v-col
      sm="4"
      :cols="isMobileView ? 12 : 6"
      class="px-1 mb-2"
    >
      <selection-input
        :model-value="[formData.dateFormat]"
        :items="dateFormats"
        :hint="$t('Date format')"
        :prepend-inner-icon="mdiCalendarBlank"
        is-single-select
        hide-search
        required
        @update:model-value="$emit('update-preference', { key: 'dateFormat', value: $event[0] })"
      />
    </v-col>
    <v-col
      sm="4"
      :cols="isMobileView ? 12 : 6"
      class="px-1 mb-2"
    >
      <selection-input
        :model-value="[formData.firstDayOfWeek]"
        :items="firstDayOptions"
        :hint="$t('First day of week')"
        :prepend-inner-icon="mdiCalendar"
        is-single-select
        hide-search
        required
        @update:model-value="$emit('update-preference', { key: 'firstDayOfWeek', value: $event[0] })"
      />
    </v-col>
    <v-col
      sm="4"
      :cols="isMobileView ? 12 : 6"
      class="px-1 mb-2"
    >
      <selection-input
        :model-value="[formData.timeFormat]"
        :items="timeFormats"
        :hint="$t('Time format')"
        :prepend-inner-icon="mdiClockOutline"
        is-single-select
        hide-search
        required
        @update:model-value="$emit('update-preference', { key: 'timeFormat', value: $event[0] })"
      />
    </v-col>
  </v-row>
</template>
<script>
import { mapState } from 'pinia';
import {
  mdiMonitor, mdiHome, mdiNumeric, mdiDecimal, mdiCalendarBlank, mdiCalendar, mdiClockOutline, mdiPercentOutline,
} from '@mdi/js';
import { format } from 'date-fns';

import useFeatureStore from '@/stores/feature';
import useStationStore from '@/stores/station';
import useDeviceStore from '@/stores/device';
import useProfileStore from '@/stores/profile';
import { dateFormatsMap } from '@/constants/formattingConstants';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import { languages } from '@/constants/languages';

const icons = {
  mdiMonitor, mdiHome, mdiNumeric, mdiDecimal, mdiCalendarBlank, mdiCalendar, mdiClockOutline, mdiPercentOutline,
};

export default {
  name: 'UserPreferencesForm',
  components: {
    SelectionInput,
  },
  props: {
    hasStartPageOption: {
      type: Boolean,
    },
    formData: {
      type: Object,
      default: () => {},
    },
    stationsFilter: {
      type: Array,
      default: () => [],
    },
    isLineviewUser: { type: Boolean },
  },
  emits: ['update-preference'],
  data() {
    return {
      ...icons,
      languages,
      selectedNumberFormat: {},
    };
  },
  computed: {
    ...mapState(useFeatureStore, ['improvementsEnabled']),
    ...mapState(useStationStore, ['stations']),
    ...mapState(useDeviceStore, ['isMobileView']),
    ...mapState(useProfileStore, ['highestRoleAllows']),
    filteredStations() {
      if (this.stationsFilter.length) {
        return this.stations.filter((station) => this.stationsFilter.includes(station.id));
      }
      return this.stations;
    },
    modules() {
      return [
        {
          name: this.$t('Shift view'),
          id: 'shiftview',
        },
        {
          name: `${this.$t('Factory view')} (${this.$t('Live')})`,
          id: 'factory-view',
        },
        {
          name: `${this.$t('Factory view')} (${this.$t('Timeline')})`,
          id: 'factory-view-timeline',
        },
        {
          name: this.$t('Dashboard'),
          id: 'dashboard',
        },
        {
          name: this.$t('Reports'),
          id: 'reports',
        },
        {
          name: this.$t('Improvements'),
          id: 'improvements',
          hidden: !this.improvementsEnabled,
        },
        {
          name: this.$t('Settings'),
          id: 'settings',
          hidden: !this.highestRoleAllows('settings'),
        },
      ];
    },
    numberFormats() {
      return [
        {
          displayValue: '123 456.78',
          decimalSeparator: '.',
          groupSeparator: ' ',
        },
        {
          displayValue: '123 456,78',
          decimalSeparator: ',',
          groupSeparator: ' ',
        },
        {
          displayValue: '123,456.78',
          decimalSeparator: '.',
          groupSeparator: ',',
        },
        {
          displayValue: '123.456,78',
          decimalSeparator: ',',
          groupSeparator: '.',
        },
      ];
    },
    dateFormats() {
      return Object.entries(dateFormatsMap).map(([key, value]) => ({
        name: format(new Date(), value.long),
        id: key,
      }));
    },
    firstDayOptions() {
      return [
        { name: this.$t('Monday'), id: '1' },
        { name: this.$t('Sunday'), id: '0' },
      ];
    },
    timeFormats() {
      return [
        { name: '24h', id: 24 },
        { name: '12h (AM/PM)', id: 12 },
      ];
    },
    decimalOptions() {
      const options = [
        { name: '0', id: 0 },
        { name: '0,0', id: 1 },
        { name: '0,00', id: 2 },
        { name: '0,000', id: 3 },
        { name: '0,0000', id: 4 },
        { name: '0,00000', id: 5 },
      ];
      return options.map((el) => {
        const formattedName = el.name.replace(',', this.formData.decimalSeparator);
        return { ...el, name: formattedName, pctName: `${formattedName}%` };
      });
    },
  },
  watch: {
    formData(newVal, oldVal) {
      if (newVal.decimalSeparator !== oldVal.decimalSeparator || newVal.groupSeparator !== oldVal.groupSeparator) this.getSelectedNumberFormat();
    },
  },
  mounted() {
    this.getSelectedNumberFormat();
  },
  methods: {
    onSelectNumberFormat(value) {
      const emitValue = this.numberFormats.find((el) => el.displayValue === value[0]);
      this.$emit('update-preference', { key: 'decimalSeparator', value: emitValue.decimalSeparator });
      this.$emit('update-preference', { key: 'groupSeparator', value: emitValue.groupSeparator });
      this.getSelectedNumberFormat();
    },
    getSelectedNumberFormat() {
      this.selectedNumberFormat = this.numberFormats.find(
        (el) => el.decimalSeparator === this.formData.decimalSeparator && el.groupSeparator === this.formData.groupSeparator,
      );
    },
  },
};
</script>

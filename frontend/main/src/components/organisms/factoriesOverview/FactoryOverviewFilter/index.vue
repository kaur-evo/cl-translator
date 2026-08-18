<template>
  <div :class="{ 'd-flex': useChips }">
    <div v-if="$route.name === TIMELINE" :class="useChips ? 'ma-1' : 'my-4'">
      <range-chip-selection
        v-if="useChips"
        :prev-btn-tooltip-text="prevBtnTooltipText"
        :previous-disabled="isPreviousDisabled"
        :next-btn-tooltip-text="nextBtnTooltipText"
        :next-disabled="isNextDisabled"
        :range-label="rangeLabel"
        is-chip-active
        :is-open="isRangeChipSelectionOpen"
        @click-previous="onPreviousClick"
        @click-next="onNextClick"
        @update:is-open="isRangeChipSelectionOpen = $event"
      >
        <template #selection-list>
          <selection-list
            :model-value="[timelinesInterval]"
            :items="timelineIntervalOptions"
            is-single-select
            hide-search
            required
            dense
            height="300px"
            width="300px"
            item-text="value"
            item-value="value"
            @update:model-value="modifyTimelineInterval($event[0])"
          />
        </template>
        <template #append>
          <evocon-v-tooltip-wrap :text="currentBtnTooltipText">
            <template #activator="{ props }">
              <evocon-v-button
                :icon="mdiPageLast"
                size="extra-small"
                density="comfortable"
                :disabled="isNextDisabled"
                v-bind="props"
                @click.stop="onCurrentClick"
              />
            </template>
          </evocon-v-tooltip-wrap>
        </template>
      </range-chip-selection>
      <selection-input
        v-else
        :model-value="[intervalProp]"
        :items="timelineIntervalOptions"
        :prepend-text="lastHoursTranslation.prefix"
        :append-text="` ${lastHoursTranslation.suffix}`"
        :prepend-inner-icon="mdiClockOutline"
        :density="useChips ? 'default' : 'compact'"
        color-active-prepend
        is-single-select
        hide-search
        required
        item-text="value"
        item-value="value"
        @update:model-value="onIntervalChange($event[0])"
      />
    </div>
    <selection-input
      v-if="$route.name === TIMELINE"
      :model-value="[statColumnValue]"
      :items="statsValues"
      :prepend-inner-icon="mdiBullseye"
      :use-chips="useChips"
      :density="useChips ? 'default' : 'compact'"
      item-tertiary-text="prependText"
      is-single-select
      color-active-prepend
      hide-search
      required
      item-text="text"
      item-value="value"
      :menu-input-class="useChips ? 'ma-1' : 'my-4'"
      @update:model-value="onStatColumnChange($event[0])"
    />
    <selection-input
      v-if="$route.name === REALTIME"
      :model-value="noSave ? statusProp : statusFilter"
      :items="statusOptions"
      :prepend-inner-icon="mdiFilterVariant"
      :prepend-text="`${$t('Status')}: `"
      :use-chips="useChips"
      eager
      location="bottom right"
      :density="useChips ? 'default' : 'compact'"
      hide-search
      item-text="text"
      item-value="value"
      :menu-input-class="useChips ? 'ma-1' : 'my-4'"
      show-empty-array-as-all-selected
      @update:model-value="onStatusFilterChange"
    >
      <template #item-append="{ item }">
        <v-icon :color="item.color">
          {{ mdiCircle }}
        </v-icon>
      </template>
    </selection-input>
    <selection-input
      v-if="$route.name === REALTIME"
      :model-value="[noSave ? unitProp : unitType]"
      :items="unitOptions"
      :prepend-inner-icon="mdiRuler"
      :use-chips="useChips"
      eager
      is-single-select
      location="bottom right"
      :density="useChips ? 'default' : 'compact'"
      hide-search
      item-text="text"
      item-value="value"
      :menu-input-class="useChips ? 'ma-1' : 'my-4'"
      @update:model-value="onUnitTypeChange($event[0])"
    />
    <selection-input
      v-if="factories.length > 1"
      :model-value="selectedFactories"
      :items="factories"
      :prepend-text="`${$t('Factories')}: `"
      :prepend-inner-icon="mdiDomain"
      :use-chips="useChips"
      eager
      location="bottom right"
      :density="useChips ? 'default' : 'compact'"
      show-empty-array-as-all-selected
      color-active-prepend
      :menu-input-class="useChips ? 'ma-1' : 'my-4'"
      @update:model-value="onFactoryChange"
    />
    <selection-input
      :model-value="noSave ? stationsProp : stationIdsClone"
      :items="filteredStations"
      :groups="stationGroups"
      :prepend-text="`${$t('Stations')}: `"
      :prepend-inner-icon="mdiMonitor"
      :use-chips="useChips"
      is-grouped-select
      eager
      :density="useChips ? 'default' : 'compact'"
      color-active-prepend
      location="bottom right"
      :menu-input-class="useChips ? 'ma-1' : 'my-4'"
      @update:model-value="onStationChange"
    />
  </div>
</template>
<script>
import {
  mdiDomain, mdiClockOutline, mdiBullseye, mdiMonitor, mdiRuler, mdiFilterVariant, mdiCircle, mdiPageLast,
} from '@mdi/js';
import { mapState, mapActions } from 'pinia';
import { DateTime } from 'luxon';

import EvoconVTooltipWrap from '@/components/atoms/EvoconVTooltipWrap/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import RangeChipSelection from '@/components/molecules/RangeChipSelection/index.vue';
import SelectionList from '@/components/molecules/SelectionList/index.vue';
import factoryOverviewStatuses from '@/constants/factoryOverviewStatuses';
import { REALTIME, TIMELINE } from '@/constants/routeNames';
import { useFactoryOverviewConfigStore, useStationStore, useFactoryStore } from '@/stores';


const routeNames = { REALTIME, TIMELINE };
const vectorIcons = {
  mdiDomain,
  mdiClockOutline,
  mdiBullseye,
  mdiMonitor,
  mdiRuler,
  mdiFilterVariant,
  mdiCircle,
  mdiPageLast,
};

export default {
  name: 'FactoryOverviewFilter',
  components: {
    SelectionInput,
    RangeChipSelection,
    SelectionList,
    EvoconVButton,
    EvoconVTooltipWrap,
  },
  props: {
    useChips: { type: Boolean },
    noSave: { type: Boolean },
    stationsProp: { type: Array, default: () => [] },
    statProp: { type: String, default: '' },
    intervalProp: { type: Number, default: 8 },
    unitProp: { type: String, default: 'primary' },
    statusProp: { type: Array, default: () => [] },
  },
  emits: ['update:stations-prop', 'update:interval-prop', 'update:stat-prop', 'update:unit-prop', 'update:status-prop'],
  data() {
    return {
      ...routeNames,
      ...vectorIcons,
      stationIdsClone: [],
      selectedFactories: [],
      isRangeChipSelectionOpen: false,
    };
  },
  computed: {
    ...mapState(useFactoryOverviewConfigStore, [
      'isLoading',
      'timelinesInterval',
      'timelinesStatColumn',
      'timelinesIntervalEndTime',
      'unitType',
      'statusFilter',
      'factoryViewVisibleStationIds',
    ]),
    ...mapState(useStationStore, ['stationsMap', 'stations', 'stationGroups']),
    ...mapState(useFactoryStore, ['factories']),
    allowedVisibleStationIds() {
      return this.factoryViewVisibleStationIds.filter(
        (id) => !!this.stationsMap[id],
      );
    },
    filteredStations() {
      return this.stations.filter(
        (station) => !this.selectedFactories.length
          || this.selectedFactories.includes(station.factoryId),
      );
    },
    statsValues() {
      return [
        { value: 'availability', text: this.$t('availability') },
        { value: 'performance', text: this.$t('performance') },
        { value: 'quality', text: this.$t('quality') },
        { value: 'Good quantity', text: this.$t('Good quantity'), prependText: this.$t('Primary unit') },
        { value: 'Good quantity alternative', text: this.$t('Good quantity'), prependText: this.$t('Alternative unit') },
        { value: 'oee', text: this.$t('oee') },
      ];
    },
    unitOptions() {
      return [
        { value: 'primary', text: this.$t('Primary unit') },
        { value: 'alternative', text: this.$t('Alternative unit') },
      ];
    },
    statusOptions() {
      return [
        { value: factoryOverviewStatuses.GOOD_PRODUCTION, text: this.$t('goodproduction'), color: 'lw-green' },
        { value: factoryOverviewStatuses.SLOW_PRODUCTION, text: this.$t('Speed loss'), color: 'lw-yellow' },
        { value: factoryOverviewStatuses.UNCOMMENTED_STOP, text: this.$t('Uncommented'), color: 'lw-red' },
        { value: factoryOverviewStatuses.UNPLANNED_STOP, text: this.$t('Unplanned stops'), color: 'lw-dark-red' },
        { value: factoryOverviewStatuses.TECHNICAL_STOP, text: this.$t('Technical stops'), color: 'lw-dark-red' },
        { value: factoryOverviewStatuses.PLANNED_STOP_INCL_OEE, text: `${this.$t('Planned stops')} (${this.$t('incl. in OEE')})`, color: 'secondary-dark' },
        { value: factoryOverviewStatuses.PLANNED_STOP_EXCL_OEE, text: `${this.$t('Planned stops')} (${this.$t('excl. from OEE')})`, color: 'lw-gray' },
        { value: factoryOverviewStatuses.NO_SHIFT, text: this.$t('No active shift'), color: 'black' },
      ];
    },
    lastHoursTranslation() {
      const listHoursSplit = this.$t('Last {hour} hours', { hour: '%' }).split('%');
      return {
        prefix: listHoursSplit[0]?.trim?.(),
        suffix: listHoursSplit[1]?.trim?.(),
      };
    },
    timelineIntervalOptions() {
      return [...Array(24).keys()].map((i) => ({ value: i + 1 }));
    },
    prevBtnTooltipText() {
      if (this.timelinesInterval) return this.$t('Previous {value} hours', { value: this.timelinesInterval });
      return '';
    },
    nextBtnTooltipText() {
      if (this.timelinesInterval) return this.$t('Next {value} hours', { value: this.timelinesInterval });
      return '';
    },
    currentBtnTooltipText() {
      if (this.timelinesInterval) return this.$t('Current {value} hours', { value: this.timelinesInterval });
      return '';
    },
    rangeLabel() {
      const prefix = this.timelinesIntervalEndTime ? '' : `${this.lastHoursTranslation.prefix} `;
      if (this.timelinesInterval) return `${prefix}${this.timelinesInterval} ${this.lastHoursTranslation.suffix}`;
      return '';
    },
    isPreviousDisabled() {
      if (!this.timelinesIntervalEndTime) return false; // live view
      const comparisonTime = DateTime.now().toUTC().minus({ hours: 7 * 24 });
      const start = this.timelinesIntervalEndTime.minus({ hours: this.timelinesInterval });
      return comparisonTime >= start;
    },
    isNextDisabled() {
      return !this.timelinesIntervalEndTime;
    },
    statColumnValue() {
      return this.noSave ? this.statProp : this.timelinesStatColumn;
    },
  },
  watch: {
    allowedVisibleStationIds(val) {
      if (this.noSave) {
        this.$emit('update:stations-prop', val);
      } else {
        this.stationIdsClone = val; // rights filter
      }
    },
    isLoading(val) {
      if (!val) this.setSelectedFactoryIdsBySelectedStations();
    },
  },
  mounted() {
    if (this.noSave) {
      this.$emit('update:stations-prop', [...this.allowedVisibleStationIds]);
    } else {
      this.stationIdsClone = [...this.allowedVisibleStationIds];
    }
    this.setSelectedFactoryIdsBySelectedStations();
  },
  methods: {
    ...mapActions(useFactoryOverviewConfigStore, [
      'subscribeToFactoryViewStations',
      'modifyFactoryViewStationOrdering',
      'modifyTimelineInterval',
      'modifyTimelineStatColumn',
      'updateTimelineIntervalEndTime',
      'modifyUnitType',
      'modifyStatusFilter',
    ]),
    onStationChange(val) {
      if (this.noSave) {
        this.$emit('update:stations-prop', val);
      } else {
        this.stationIdsClone = val;
        this.modifyFactoryViewStationOrdering(val);
        if (this.$route.name === REALTIME) {
          this.subscribeToFactoryViewStations();
        }
      }
    },
    factoryIdFromStationId(stationId) {
      const station = this.stationsMap[stationId];
      return station.factoryId;
    },
    setSelectedFactoryIdsBySelectedStations() {
      const factoryids = this.allowedVisibleStationIds.map(
        this.factoryIdFromStationId,
      );
      this.selectedFactories = [...new Set(factoryids)];
    },
    onFactoryChange(val) {
      const prevVal = this.selectedFactories;
      this.selectedFactories = val;
      const filteredStationsIds = this.filteredStations.map((s) => s.id);
      const selectedStationIds = this.noSave
        ? this.stationsProp.filter((id) => filteredStationsIds.includes(id))
        : this.stationIdsClone.filter((id) => filteredStationsIds.includes(id));
      if (val.length > prevVal.length) {
        const newlyAddedFactoryIds = val.filter((id) => !prevVal.includes(id));
        const stationsToAdd = this.stations.reduce((acc, station) => {
          if (newlyAddedFactoryIds.includes(station.factoryId)) acc.push(station.id);
          return acc;
        }, []);
        selectedStationIds.push(...stationsToAdd);
      }
      this.onStationChange(selectedStationIds);
    },
    async onIntervalChange(interval) {
      if (this.noSave) {
        this.$emit('update:interval-prop', interval);
      } else {
        await this.modifyTimelineInterval(interval);
      }
    },
    async onStatColumnChange(stat) {
      if (this.noSave) {
        this.$emit('update:stat-prop', stat);
      } else {
        this.modifyTimelineStatColumn(stat);
      }
    },
    onUnitTypeChange(unitType) {
      if (this.noSave) this.$emit('update:unit-prop', unitType);
      else this.modifyUnitType(unitType);
    },
    onPreviousClick() {
      const endTime = this.timelinesIntervalEndTime || DateTime.now().toUTC();
      this.updateTimelineIntervalEndTime(endTime.minus({ hours: this.timelinesInterval }));
    },
    onNextClick() {
      let endTime = this.timelinesIntervalEndTime.plus({ hours: this.timelinesInterval });
      if (endTime >= DateTime.now().toUTC()) endTime = null;
      this.updateTimelineIntervalEndTime(endTime);
    },
    onCurrentClick() {
      this.updateTimelineIntervalEndTime(null);
    },
    onStatusFilterChange(statuses) {
      if (this.noSave) {
        this.$emit('update:status-prop', statuses);
      } else {
        this.modifyStatusFilter(statuses);
      }
    },
  },
};
</script>

<template>
  <v-card class="pt-2 px-6 pb-6">
    <settings-shift-timeline-header-segment
      v-model:start-date="startDate"
      :current-range-type="currentRangeType"
      :view-range-config="viewRangeConfig"
      :zone-id="zoneId"
      @update:current-range-type="onRangeTypeChange"
    />
    <!-- weekday axis row -->
    <v-row class="mt-2 mr-2">
      <v-col
        class="first-column text-body-small pa-2 border-right border-left justify-center"
        :class="{'is-mobile': isMobileView}"
      >
        <span class="text-no-wrap overflow-hidden text-overflow-ellipsis">{{ currentWeekLabel }}</span>
      </v-col>
      <v-col ref="chartReference" class="flex-grow-1 flex-shrink-0 py-0">
        <interactive-weekday-axis
          v-if="xScale"
          :dates="dates"
          :language="language"
          :zone-id="zoneId"
          @weekday-click="onWeekdayClick"
        >
          <template v-if="currentRangeType === viewRange.DAY" #weekday-chip="{ label, isToday }">
            <range-chip-selection
              :prev-btn-tooltip-text="viewRangeConfig.prevBtnTooltipText"
              :previous-disabled="viewRangeConfig.isPreviousDisabled"
              :next-btn-tooltip-text="viewRangeConfig.nextBtnTooltipText"
              :next-disabled="viewRangeConfig.isNextDisabled"
              :range-label="label"
              :is-chip-active="isToday"
              :is-open="false"
              chip-type="outlined"
              @click-previous="viewRangeConfig.onPreviousClick"
              @click-next="viewRangeConfig.onNextClick"
              @update:is-open="setViewRangeMenuOpen($event)"
            />
          </template>
        </interactive-weekday-axis>
      </v-col>
    </v-row>
    <!-- hour axis row -->
    <v-row class="mr-2">
      <v-col
        class="first-column text-body-small pa-2"
        :class="{'is-mobile': isMobileView}"
      />
      <v-col class="flex-grow-1 flex-shrink-0 py-2 ">
        <div id="hourAxis" ref="hourAxis" class="flex-grow-1 flex-shrink-0" />
      </v-col>
    </v-row>
    <!-- timelines row -->
    <div class="timelines-container">
      <div class="d-flex time-indicator-container mr-2">
        <span
          class="first-column"
          :class="{'is-mobile': isMobileView}"
        >
          &nbsp;
        </span>
        <span ref="timeIndicatorRef" class="flex-grow-1 flex-shrink-0" />
      </div>
      <v-sheet
        v-for="station in filteredStations"
        :key="station.id"
        class="mb-2"
      >
        <div class="d-flex mr-2">
          <span
            class="first-column align-start text-label-large font-weight-regular px-2 pl-4 border-right"
            :class="{'is-mobile': isMobileView}"
          >
            <truncated-text :text="station.name" />
          </span>
          <span class="flex-grow-1 flex-shrink-0">
            <timeline-row
              v-if="xScale"
              :key="startDate.toISO() + '-' + currentRangeType + '-' + station.id"
              :station-id="station.id"
              :x-scale="xScale"
              :zone-id="station.zoneId"
              :tooltip-h-t-m-l-func="tooltipHTMLFunc"
              :solid-grid-interval="solidGridInterval"
              :dash-grid-interval="dashGridInterval"
              @slice-click="onSliceClick"
            />
          </span>
        </div>
      </v-sheet>
    </div>
    <!-- timelines action menu -->
    <v-menu
      v-model="menuOpen"
      :target="[x, y]"
      location-strategy="connected"
    >
      <single-select-list
        :items="timelineActions"
        item-text="label"
        dense
        icon-key="icon"
        @select="onTimelineActionSelect"
      />
    </v-menu>
  </v-card>
</template>
<script setup>
import * as d3 from 'd3';
import { onMounted, ref, watch, computed, onUnmounted, defineAsyncComponent } from 'vue';
import { DateTime } from 'luxon';
import { useI18n } from 'vue-i18n';
import { mdiCircleEditOutline, mdiCalendarRemove } from '@mdi/js';

import {
  useDeviceStore,
  useSettingsSideMenuStore,
  useStationStore,
  useFilterbarStore,
  useProfileStore,
  useGenericDialogStore,
  useShiftTemplateStore,
} from '@/stores/index';
import TimelineRow from '@/components/organisms/settings/SettingsShiftTimelineBlock/TimelineRow.vue';
import SettingsShiftTimelineHeaderSegment from '@/components/organisms/settings/SettingsShiftTimelineHeaderSegment/index.vue';
import { viewRange } from '@/components/organisms/settings/SettingsShiftTimelineBlock/constants.js';
import useHourAxis from '@/components/organisms/settings/SettingsShiftTimelineBlock/useHourAxis.js';
import tooltipHTMLFunc from '@/components/organisms/settings/SettingsShiftTimelineBlock/tooltipConfig.js';
import { hideTooltip } from '@/helpers/d3Helpers';
import SingleSelectList from '@/components/molecules/SingleSelectList/index.vue';
import TimelineTimeIndicator from '@/d3/TimelineTimeIndicator/index.js';
import useNoShiftDeviations from '@/components/pages/settings/SettingsShiftsEdit/useNoShiftDeviations';
import InteractiveWeekdayAxis from '@/components/molecules/InteractiveWeekdayAxis/index.vue';
import { luxonApplyLocale } from '@/helpers/time/luxonHelpers.js';
import useCurrentViewRange from '@/components/organisms/settings/SettingsShiftTimelineBlock/useCurrentViewRange.js';
import RangeChipSelection from '@/components/molecules/RangeChipSelection/index.vue';
import TruncatedText from '@/components/atoms/TruncatedText/index.vue';

const { t } = useI18n();
const deviceStore = useDeviceStore();
const settingsSideMenuStore = useSettingsSideMenuStore();
const stationStore = useStationStore();
const filterbarStore = useFilterbarStore();
const profileStore = useProfileStore();
const genericDialogStore = useGenericDialogStore();
const shiftTemplateStore = useShiftTemplateStore();
const shiftTemplateId = computed(() => currentSlice.value?.shiftTemplateId || null);

const { openQuickApplyNoShiftDialog } = useNoShiftDeviations(shiftTemplateId, { value: true });

const currentRangeType = ref(deviceStore.isMobileView ? viewRange.DAY : viewRange.WEEK);
const isMobileView = computed(() => deviceStore.isMobileView);
const sideMenuCollapsed = computed(() => settingsSideMenuStore.isCollapsed);
watch(isMobileView, (newVal) => {
  if (newVal && currentRangeType.value !== viewRange.DAY) {
    startDate.value = luxonApplyLocale(DateTime.now()).startOf('day');
    currentRangeType.value = viewRange.DAY;
  }
});
const startDate = ref(deviceStore.isMobileView ? luxonApplyLocale(DateTime.now()).startOf('day') : luxonApplyLocale(DateTime.now()).startOf('week', { useLocaleWeeks: true }));

const { viewRangeConfig } = useCurrentViewRange(startDate, currentRangeType);

const oneHour = 1;
const sixHours = 6;
const fourHours = 4;
const hourFrequency = computed(() => {
  switch (currentRangeType.value) {
    case viewRange.DAY:
      if (isMobileView.value) {
        return fourHours;
      }
      return oneHour;
    case viewRange.WEEK:
      return sixHours;
    default:
      throw new Error('Invalid view range', currentRangeType.value);
  }
});

const solidGridInterval = computed(() => (currentRangeType.value === viewRange.DAY ? d3.timeHour.every(fourHours) : d3.timeDay.every(1)));
const dashGridInterval = computed(() => (currentRangeType.value === viewRange.DAY ? d3.timeHour.every(oneHour) : d3.timeHour.every(sixHours)));

const hourAxis = ref(null);
const xScale = ref(null);

const factoryFilter = computed(() => filterbarStore.requestFilterState.factoryId);
const stationFilter = computed(() => filterbarStore.requestFilterState.stationId);
const language = computed(() => profileStore.language);

const filteredStations = computed(() => stationStore.stations.filter((station) => {
  const factoryMatch = !factoryFilter.value || factoryFilter.value.length === 0 || factoryFilter.value.includes(station.factoryId);
  const stationMatch = !stationFilter.value || stationFilter.value.length === 0 || stationFilter.value.includes(station.id);
  return factoryMatch && stationMatch;
}));


const zoneId = computed(() => {
  const stations = filteredStations.value;
  return stations.length > 0 ? stations[0].zoneId : 'UTC';
});


const { drawHourAxis, updateHourAxis } = useHourAxis(hourAxis, xScale, { tickFrequency: hourFrequency, zoneId });
const chartReference = ref(null);

const dateRange = computed(() => [
  luxonApplyLocale(startDate.value).startOf(currentRangeType.value, { useLocaleWeeks: true }),
  luxonApplyLocale(startDate.value).endOf(currentRangeType.value, { useLocaleWeeks: true }),
]);

const currentWeekLabel = computed(() => `${t('Week')} ${startDate.value.localWeekNumber}`);

function setScale() {
  if (chartReference.value === null) return;
  const { clientWidth } = chartReference.value.$el;
  const start = dateRange.value[0].setZone('local', { keepLocalTime: true }).startOf('day').toJSDate();
  const end = dateRange.value[1].setZone('local', { keepLocalTime: true }).plus({ days: 1 }).startOf('day').toJSDate();
  xScale.value
    .range([0, clientWidth])
    .domain([start, end]);
}
let timeIndicatorD3 = null;
const timeIndicatorRef = ref(null);
async function handleResize() {
  setScale();
  updateAxes();
}

onMounted(() => {
  window.addEventListener('resize', handleResize);
  createAxes();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  hideTooltip();
});

watch(sideMenuCollapsed, async () => {
  handleResize();
});

watch(startDate, () => {
  updateAxes();
  setDatesList();
});

watch(zoneId, () => {
  startDate.value = luxonApplyLocale(startDate.value).setZone('local', { keepLocalTime: true });
  updateAxes();
});

function onRangeTypeChange(newRangeType) {
  const oldRangeType = currentRangeType.value;
  currentRangeType.value = newRangeType;
  if (newRangeType === viewRange.WEEK && oldRangeType !== newRangeType) {
    startDate.value = luxonApplyLocale(startDate.value).startOf('week', { useLocaleWeeks: true });
  } else if (newRangeType === viewRange.DAY && oldRangeType !== newRangeType && startDate.value.weekNumber === DateTime.now().weekNumber) {
    startDate.value = luxonApplyLocale(DateTime.now()).startOf('day');
  } else {
    updateAxes();
  }
}

function createAxes() {
  xScale.value = d3.scaleTime();
  setScale();
  drawHourAxis();
  setDatesList();
  timeIndicatorD3 = new TimelineTimeIndicator(timeIndicatorRef.value, { xScale: xScale.value, zoneId: zoneId.value });
  timeIndicatorD3.draw();
}
function updateAxes() {
  setScale();
  updateHourAxis();
  setDatesList();
  timeIndicatorD3.update({ xScale: xScale.value, zoneId: zoneId.value });
}

const dates = ref([]);

async function setDatesList() {
  const allDates = xScale.value.ticks(d3.timeDay.every(1));
  allDates.pop(); // Remove last date to avoid overflow, last tick is next day at 00:00
  dates.value = allDates;
}

// Default menu position constants
const DEFAULT_MENU_X = 150;
const DEFAULT_MENU_Y = 300;

const x = ref(DEFAULT_MENU_X);
const y = ref(DEFAULT_MENU_Y);
const currentSlice = ref(null);
const menuOpen = ref(false);

const timelineActions = computed(() => [
  {
    label: t('Edit shift time'),
    icon: mdiCircleEditOutline,
    type: 'edit-shift',
    action: onEditShiftActionSelected,
  },
  {
    label: t('Delete shift'),
    icon: mdiCalendarRemove,
    type: 'no-shift',
    action: onNoShiftActionSelected,
  },
]);
const onTimelineActionSelect = (timelineSelection) => {
  timelineSelection.action();
  menuOpen.value = false;
};

function onNoShiftActionSelected() {
  if (!currentSlice.value) return;
  const slice = currentSlice.value;
  openQuickApplyNoShiftDialog({ payload: {
    stationIds: [slice.stationId],
    startTime: slice.startTime,
    endTime: slice.endTime,
    shiftTemplateId: slice.shiftTemplateId,
    description: t('No shift'),
  },
  shiftName: slice.shiftName,
  zoneId: zoneId.value,
  callback: () => shiftTemplateStore.fetchShiftTemplateTimeline({
    dateRange: xScale.value.domain(),
    stationId: slice.stationId,
  }) });
}

async function onEditShiftActionSelected() {
  if (!currentSlice.value) return;
  const slice = currentSlice.value;
  const dialogConfig = {
    component: defineAsyncComponent(() => import('@/components/organisms/settings/SettingsShiftManagementDialog/index.vue')),
    data: {
      shift: slice,
      station: filteredStations.value.find((s) => s.id === slice.stationId),
      xScale: xScale.value,
    },
    options: { maxWidth: '500px' },
    onPrimaryAction: () => shiftTemplateStore.fetchShiftTemplateTimeline({
      dateRange: xScale.value.domain(),
      stationId: slice.stationId,
    }),
  };
  await genericDialogStore.openDialog(dialogConfig);
}

async function onSliceClick({ event, slice }) {
  if (!slice || DateTime.fromISO(slice.startTimeISO) < DateTime.now()) return;
  menuOpen.value = true;
  x.value = event.clientX;
  y.value = event.clientY;
  currentSlice.value = slice;
}

function onWeekdayClick(date) {
  startDate.value = luxonApplyLocale(date);
  currentRangeType.value = viewRange.DAY;
}


</script>
<style lang="scss" scoped>
.first-column {
  flex: 0 0 auto;
  width: 176px;
  min-width: 176px;
  max-width: 176px;
  align-items: center !important;
  flex-shrink: 1 !important;
  flex-grow: 0 !important;
  display: flex !important;
  &.is-mobile {
    width: 96px;
    min-width: 96px;
    max-width: 96px
  }
}

.border-right {
  border-right: 1px solid rgb(var(--v-theme-quaternary-dark-2));
}

.border-left {
  border-left: 1px solid rgb(var(--v-theme-quaternary-dark-2));
}
.time-indicator-container {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  pointer-events: none;
  z-index: 10;
}
.timelines-container {
  position: relative;
}
</style>

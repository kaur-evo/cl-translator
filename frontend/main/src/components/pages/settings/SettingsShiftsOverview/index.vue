<template>
  <settings-entities-overview
    entity-name="shiftTemplate"
    :overview-header="t('Shifts')"
    :primary-btn-text="t('Shift')"
    :filter-configuration="createFilterConfiguration(days, defaultFactoryId, toggleBtnValue === shiftSpecificViewTypes.TIMELINE)"
    :items="tableShiftTemplates"
    :table-headers="createTableHeadersConf()"
    :loading="isLoading"
    :toggle-btn-items="toggleBtnItems"
    :toggle-btn-value="toggleBtnValue"
    :custom-views="[shiftSpecificViewTypes.TIMELINE]"
    @on-dropdown-select="toggleShiftActivity($event)"
    @link-click="openNoShiftDialog"
    @update:toggle-btn-value="toggleBtnValue = $event"
  >
    <template #header-append>
      <icon-with-tooltip
        additional-classes="ml-2"
        :icon="mdiInformationOutline"
        :tooltip-text="t('Learn more')"
        :icon-clicked-fn="onOpenHelp"
      />
    </template>
    <template #[shiftSpecificViewTypes.TIMELINE]>
      <settings-shift-timeline-block />
    </template>
  </settings-entities-overview>
</template>
<script setup>
import { useI18n } from 'vue-i18n';
import { mdiInformationOutline, mdiFormatListBulleted, mdiChartTimeline } from '@mdi/js';
import { defineAsyncComponent, computed, onMounted, ref } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';

import useProfileStore from '@/stores/profile';
import useFactoryStore from '@/stores/factory';
import useStationStore from '@/stores/station';
import useGenericNotificationStore from '@/stores/genericNotification';
import useGenericDialogStore from '@/stores/genericDialog';
import useShiftTemplateStore from '@/stores/shiftTemplate';
// eslint-disable-next-line import/order
import SettingsShiftTimelineBlock from '@/components/organisms/settings/SettingsShiftTimelineBlock/index.vue'; // there is some eslint rules conflict or bug

const shiftSpecificViewTypes = {
  TIMELINE: 'timeline',
};
onBeforeRouteLeave((to, from, next) => {
  closeNotification();
  next();
});

import { getDaysList, getDaysMap } from '@/helpers/days/getDays';
import { formatTimeInDay } from '@/helpers/time/formatTime';
import SettingsEntitiesOverview from '@/components/pages/settings/SettingsEntitiesOverview/index.vue';
import { createFilterConfiguration } from '@/components/organisms/settings/SettingsFilterBar/FilterBarConfigurations/shiftsFilterBarConf';
import { createTableHeadersConf } from '@/components/organisms/settings/SettingsEntitiesTable/TableConfigs/shiftsTableHeadersConf';
import IconWithTooltip from '@/components/atoms/IconWithTooltip/index.vue';
import builtInViewTypes from '@/components/pages/settings/SettingsEntitiesOverview/settingsBuiltInViewTypes.js';

const { t } = useI18n();
const profileStore = useProfileStore();
const factoryStore = useFactoryStore();
const stationStore = useStationStore();
const genericNotificationStore = useGenericNotificationStore();
const genericDialogStore = useGenericDialogStore();
const shiftTemplateStore = useShiftTemplateStore();
const toggleBtnValue = ref(shiftSpecificViewTypes.TIMELINE);

const shiftTemplates = computed(() => shiftTemplateStore.shiftTemplates);
const isLoading = computed(() => shiftTemplateStore.isLoading);
const language = computed(() => profileStore.language);
const firstDayOfWeek = computed(() => profileStore.firstDayOfWeek);
const getOrderedFactoryNamesArrayByStationIds = computed(() => factoryStore.getOrderedFactoryNamesArrayByStationIds);
const getOrderedStationNamesArray = computed(() => stationStore.getOrderedStationNamesArray);

const defaultFactoryId = computed(() => stationStore.getDefaultStation()?.factoryId ?? factoryStore.factories?.[0]?.id ?? null);
const days = computed(() => getDaysList(language.value, firstDayOfWeek.value));
const tableShiftTemplates = computed(() => {
  const daysMap = getDaysMap(language.value, firstDayOfWeek.value);
  return shiftTemplates.value.reduce((result, template) => {
    const factoryNamesArray = getOrderedFactoryNamesArrayByStationIds.value([template.stationId], false);
    if (!factoryNamesArray.length) return result;
    const templateObj = {
      ...template,
      shiftTime: `${formatTimeInDay(template.startTime)} - ${formatTimeInDay(template.endTime)}`,
      factoryNamesArray,
      stationNamesArray: getOrderedStationNamesArray.value(template.stationIds),
      shiftDays: template.daysOfWeek.length === 7
        ? t('All week')
        : template.daysOfWeek
          .map((day) => daysMap[day])
          .sort((a, b) => (a.order - b.order))
          .map((day) => day.shortText)
          .join(', '),
    };
    result.push(templateObj);
    return result;
  }, []);
});
const toggleBtnItems = computed(() => [
  {
    icon: mdiFormatListBulleted,
    text: t('Templates'),
    id: builtInViewTypes.LIST,
  },
  {
    icon: mdiChartTimeline,
    text: t('Timeline'),
    id: shiftSpecificViewTypes.TIMELINE,
  },
]);

onMounted(() => {
  fetchShiftTemplates();
});


function fetchShiftTemplates(...args) {
  return shiftTemplateStore.fetchShiftTemplates(...args);
}
function toggleShiftActivity(...args) {
  return shiftTemplateStore.toggleShiftActivity(...args);
}
function closeNotification(...args) {
  return genericNotificationStore.closeNotification(...args);
}
function openDialog(...args) {
  return genericDialogStore.openDialog(...args);
}

function onOpenHelp() {
  window.open('https://support.evocon.com/Managing-work-shifts-a0109b9479f94f4888605419fa3170ce', '_blank');
}
function openNoShiftDialog(shiftTemplate) {
  const dialogConfig = {
    title: '',
    component: defineAsyncComponent(() => import('@/components/organisms/settings/SettingsShiftsNoShiftDialog/index.vue')),
    width: 1100,
    data: { ...shiftTemplate },
  };
  openDialog(dialogConfig);
}

</script>

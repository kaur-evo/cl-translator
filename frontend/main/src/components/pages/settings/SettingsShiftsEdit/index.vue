<template>
  <removed-entity-view v-if="isRemovedShiftTemplate" />
  <form-page-template
    v-else
    :primary-segment-title="formTitle"
    :is-loading="isLoading"
  >
    <template #primary-segment>
      <v-form
        ref="form"
        v-model="valid"
      >
        <v-row>
          <v-col
            cols="12"
            md="6"
            class="px-1 mb-2"
          >
            <evocon-v-input
              id="name-input"
              v-model.trim="formData.name"
              :placeholder="t('Shift name')"
              variant="filled"
              :rules="[(v) => !!v || t('Shift name')]"
              required
              validate-on="blur"
              :counter="200"
              :maxlength="200"
              autofocus
              :hint="t('Shift name')"
              persistent-hint
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
            class="px-1 mb-2"
          >
            <color-selection-input
              :model-value="formData.color"
              :hint="$t('Shift color')"
              :removed-colors="new Set([selectableColor.GREY])"
              @update:model-value="formData.color = $event"
            />
          </v-col>
          <v-col
            v-if="showFactoryField"
            cols="12"
            md="6"
            class="px-1 mb-2"
          >
            <selection-input
              :model-value="[factoryId]"
              :items="orderedWriteAccessFactories"
              :placeholder="t('Factory')"
              :hint="t('Factory')"
              is-single-select
              required
              @update:model-value="factoryId = $event[0]"
            />
          </v-col>
          <v-col
            id="station-select-column"
            cols="12"
            md="6"
            class="px-1 mb-2"
          >
            <selection-input
              id="station-select"
              v-model="formData.stationIds"
              :items="selectedFactoryAllowedStations"
              :groups="stationGroups"
              :placeholder="t('Stations')"
              :hint="t('Stations')"
              :disabled="!factoryId"
              is-grouped-select
              remove-non-existent-selections
            />
          </v-col>
        </v-row>
        <v-row class="ma-4">
          <v-col class="text-center">
            <div
              id="days-of-week-title"
              class="text-body-large font-weight-bold"
            >
              {{ t('Days') }}
            </div>
          </v-col>
        </v-row>
        <div class="mt-4 mb-4 px-1 d-flex flex-wrap">
          <evocon-v-chip
            :active="areAllDaysSelected"
            type="primary"
            :label="t('All')"
            :indeterminate="areSomeDaysSelected"
            class="my-1 mr-2"
            @click="onToggleAllDays"
          />
          <evocon-v-chip
            v-for="day in days"
            :key="`day-${day.id}`"
            :value="day.id"
            :label="day.shortText"
            type="primary"
            size="default"
            :error="daysOfWeekError"
            :active="daysOfWeekError || isDaySelected(day)"
            class="my-1 mr-2"
            :dark="false"
            @click="onDayClick(day)"
          />
        </div>
        <template v-if="DAY_TIME_DEVIATIONS_ENABLED">
          <v-row v-for="(day, index) in getEnabledDays()" :key="day">
            <v-col cols="1" class="d-flex text-align-center justify-center align-center pb-6">
              <span>{{ day.shortText }}</span>
            </v-col>
            <v-col
              cols="5"
              class="px-1 mb-2"
            >
              <evocon-time-input
                :model-value="getDayStartTime(day.id)"
                required
                validate-on-blur
                :hint="t('Start time')"
                @update:model-value="(val) => setDayStartTime(day.id, val)"
              />
            </v-col>
            <v-col
              cols="5"
              class="px-1 mb-2"
            >
              <evocon-time-input
                :model-value="getDayEndTime(day.id)"
                required
                validate-on-blur
                :hint="t('End time')"
                @update:model-value="(val) => setDayEndTime(day.id, val)"
              />
            </v-col>
            <v-col cols="1" class="d-flex text-align-center justify-center align-center pb-6">
              <icon-with-tooltip
                v-if="index === 0"
                :icon="mdiContentCopy"
                button-size="small"
                :tooltip-text="t('Copy to all')"
                :icon-clicked-fn="() => onCopyShiftDayTimes(day.id)"
              />
            </v-col>
          </v-row>
        </template>
        <v-row v-else>
          <v-col
            cols="6"
            class="px-1 mb-2"
          >
            <evocon-time-input
              id="shift-start-time"
              v-model="formData.startTime"
              required
              validate-on-blur
              :hint="t('Start time')"
              :rules="[startTimeRule]"
            />
          </v-col>
          <v-col
            cols="6"
            class="px-1 mb-2"
          >
            <evocon-time-input
              id="shift-end-time"
              v-model="formData.endTime"
              required
              validate-on-blur
              :hint="t('End time')"
              :rules="[endTimeRule]"
            />
          </v-col>
        </v-row>
      </v-form>
    </template>
    <template #tertiary-segment>
      <v-expansion-panels
        v-model="panelState"
        class="mt-4 mx-1"
        static
        multiple
        variant="accordion"
      >
        <expansion-panel-table
          :icon="mdiCalendarRemove"
          :title="t('\'No shift\' days')"
          :description="t('Set time periods when shift is not scheduled to run')"
          :headers="getNoshiftsTableHeaders(true, selectedFactoryAllowedStationIds)"
          :items="currentNoShiftDeviations"
          :add-button-text="t('No shift')"
          :loading="noShiftDeviationsLoading"
          :compact="isMobileView"
          :add-btn-disabled="!factoryId"
          show-edit
          show-delete
          @edit="onEditNoShiftDeviation"
          @delete="onDeleteNoShiftDeviation"
        />
        <expansion-panel-table
          v-if="currentTimeDeviations.length"
          :icon="mdiCircleEditOutline"
          :title="t('Exceptions in shift times')"
          :description="t('Shifts edited in the timeline are shown here')"
          :headers="getTimeDeviationTableHeaders(selectedFactoryAllowedStationIds)"
          :items="currentTimeDeviations"
          :loading="timeDeviationsLoading"
          :compact="isMobileView"
          :add-btn-disabled="!factoryId"
          show-delete
          @delete="onDeleteTimeDeviation"
        />
        <expansion-panel-table
          :icon="mdiFormatFontSizeDecrease"
          :title="t('Downtime auto-commenting')"
          :description="t('Make downtime commenting easier for operators by adding auto-comments')"
          :headers="getAutocommentTableHeaders(true)"
          :items="filteredPredefinedStops"
          :add-button-text="t('Auto-commenting')"
          :loading="isLoading"
          :compact="isMobileView"
          warning-key="hasError"
          show-edit
          show-delete
          @edit="onEditPredefinedStop"
          @delete="onDeletePredefinedStop"
        />
      </v-expansion-panels>
      <div class="d-inline-flex align-center mt-6">
        <multi-line-switch
          v-model="formData.enabled"
          :main-text="t('Template status')"
        />

        <icon-with-tooltip
          additional-classes="ml-2"
          :icon="mdiInformationOutline"
          :tooltip-text="t('Deleting or turning off templates will not affect active shifts or historical data.')"
        />
      </div>
    </template>
    <template #actions>
      <delete-button
        v-if="formData.id"
        @click="onDelete"
      />
      <v-spacer />
      <evocon-v-button
        type="secondary"
        :text="t('Cancel')"
        @click="goBackToOverview"
      />
      <evocon-v-button
        id="save-btn"
        color="primary"
        :text="t('Save')"
        :loading="isLoading"
        :disabled="saveBtnDisabled"
        @click="onSave(true)"
      />
    </template>
  </form-page-template>
</template>
<script setup>
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import {
  mdiContentCopy,
  mdiCalendarRemove,
  mdiCircleEditOutline,
  mdiFormatFontSizeDecrease,
  mdiInformationOutline,
} from '@mdi/js';
import { reactive, ref, computed, onMounted, watch } from 'vue';

import useShiftTemplateStore from '@/stores/shiftTemplate';
import useStationStore from '@/stores/station';
import useDeviceStore from '@/stores/device';
import useProfileStore from '@/stores/profile';
import useFactoryStore from '@/stores/factory';
import useConfirmDialogStore from '@/stores/confirmDialog';
import ColorSelectionInput from '@/components/molecules/ColorSelectionInput/index.vue';
import { selectableColor } from '@/constants/userSelectableColors';
import EvoconTimeInput from '@/components/atoms/EvoconTimeInput/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import FormPageTemplate from '@/components/templates/FormPageTemplate/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import DeleteButton from '@/components/atoms/DeleteButton/index.vue';
import MultiLineSwitch from '@/components/atoms/MultiLineSwitch/index.vue';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import { getDaysList } from '@/helpers/days/getDays';
import RemovedEntityView from '@/components/atoms/RemovedEntityView/index.vue';
import EvoconVChip from '@/components/atoms/EvoconVChip/index.vue';
import IconWithTooltip from '@/components/atoms/IconWithTooltip/index.vue';
import ExpansionPanelTable from '@/components/molecules/ExpansionPanelTable/index.vue';
import getNoshiftsTableHeaders from '@/components/pages/settings/SettingsShiftsEdit/noshiftTableHeadersConf.js';
import getAutocommentTableHeaders from '@/components/pages/settings/SettingsShiftsEdit/autocommentTableHeadersConf.js';
import getTimeDeviationTableHeaders from '@/components/pages/settings/SettingsShiftsEdit/timeDeviationTableHeadersConf.js';
import usePredefinedStops from '@/components/pages/settings/SettingsShiftsEdit/usePredefinedStops.js';
import useNoShiftDeviations from '@/components/pages/settings/SettingsShiftsEdit/useNoShiftDeviations.js';
import useTimeDeviations from '@/components/pages/settings/SettingsShiftsEdit/useTimeDeviations.js';
const DAY_TIME_DEVIATIONS_ENABLED = false; // Feature flag for enabling day-based time deviations, once BE finishes this enable it, adjust and remove the old code

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const shiftTemplateStore = useShiftTemplateStore();
const stationStore = useStationStore();
const deviceStore = useDeviceStore();
const profileStore = useProfileStore();
const factoryStore = useFactoryStore();
const confirmDialogStore = useConfirmDialogStore();

onBeforeRouteLeave((to, from, next) => {
  if (hasUnsavedPredefinedStops.value) {
    promptSavingChanges(to.fullPath);
  } else next();
});

const valid = ref(true);
const panelState = ref([false]);
const form = ref(null);
const formData = reactive({
  id: null,
  name: '',
  stationIds: [],
  startTime: null,
  endTime: null,
  daysOfWeek: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
  enabled: true,
  color: '',
  dateConfig: {},
});

const factoryId = ref(null);

const selectedFactoryAllowedStations = computed(() => stationStore.getSelectedFactoryAllowedStations(factoryId.value ? [factoryId.value] : []));
const selectedFactoryAllowedStationIds = computed(() => stationStore.getSelectedFactoryAllowedStations(factoryId.value ? [factoryId.value] : [], formData.stationIds, 'id'));

const startTimeRule = computed(() => (!!formData.startTime && autoStopsWithErrors.value.length === 0) || t('Start time'));
const endTimeRule = computed(() => (!!formData.endTime && autoStopsWithErrors.value.length === 0) || t('End time'));
const stationGroups = computed(() => stationStore.stationGroups);
const isLoading = computed(() => shiftTemplateStore.isLoading);
const shiftTemplatesMap = computed(() => shiftTemplateStore.shiftTemplatesMap);
const isMobileView = computed(() => deviceStore.isMobileView);
const firstDayOfWeek = computed(() => profileStore.firstDayOfWeek);
const language = computed(() => profileStore.language);
const orderedWriteAccessFactories = computed(() => factoryStore.orderedWriteAccessFactories);
const hasMultipleAdminFactories = computed(() => factoryStore.hasMultipleAdminFactories);
const getFactoryIdsByStationIds = computed(() => factoryStore.getFactoryIdsByStationIds);

const showFactoryField = computed(() => hasMultipleAdminFactories.value);

const daysOfWeekError = computed(() => !formData?.daysOfWeek?.length);
const formTitle = computed(() => (isEdit.value ? `${t('Edit')}: ${t('Shift')}` : `${t('New')}: ${t('Shift')}`));
const shiftId = computed(() => Number(route.params.id));
const shiftTemplate = computed(() => shiftTemplatesMap.value[shiftId.value]);

const saveBtnDisabled = computed(() => {
  const {
    name, stationIds, startTime, endTime, daysOfWeek,
  } = formData;
  return !name || stationIds.length === 0 || !startTime || !endTime || !daysOfWeek || daysOfWeek.length < 1;
});
const days = computed(() => getDaysList(language.value, firstDayOfWeek.value));
const isEdit = computed(() => !!formData.id);
const isRemovedShiftTemplate = computed(() => {
  const shiftTemplateExists = shiftTemplate.value && !shiftTemplate.value.deleted;
  return !isLoading.value && !Number.isNaN(shiftId.value) && !shiftTemplateExists;
});
const {
  onDeletePredefinedStop,
  onEditPredefinedStop,
  validateAutoCommentTimes,
  filteredPredefinedStops,
  autoStopsWithErrors,
  hasUnsavedPredefinedStops,
  shiftSaveCallback,
} = usePredefinedStops(shiftId, formData, isEdit);


onMounted(async () => {
  await fetchShiftTemplates();
  if (shiftId.value) {
    Object.assign(formData, { ...shiftTemplate.value });
    [factoryId.value] = getFactoryIdsByStationIds.value(formData.stationIds, false);
  } else if (!hasMultipleAdminFactories.value) {
    factoryId.value = orderedWriteAccessFactories.value[0].id;
  }
});
const shiftTemplateId = computed(() => formData.id);

const { openEditNoShiftDialog, openDeleteNoShiftConfirmation, noShiftDeviationsLoading, currentNoShiftDeviations, loadNoShiftDeviations } = useNoShiftDeviations(shiftTemplateId, isEdit);
const { timeDeviationsLoading, currentTimeDeviations, loadTimeDeviations, openDeleteTimeDeviationConfirmation } = useTimeDeviations(shiftTemplateId);


watch(shiftTemplateId, async (newId, oldId) => {
  if (newId && newId !== oldId) {
    await loadNoShiftDeviations();
    await loadTimeDeviations();
  }
});


const fetchShiftTemplates = (...args) => shiftTemplateStore.fetchShiftTemplates(...args);
const saveShiftTemplate = (...args) => shiftTemplateStore.saveShiftTemplate(...args);
const deleteShiftTemplate = (...args) => shiftTemplateStore.deleteShiftTemplate(...args);
const openConfirmDialog = (...args) => confirmDialogStore.openConfirmDialog(...args);


async function onSave(navigateToOverview = true) {
  await form.value?.validate();
  validateAutoCommentTimes();
  if (!valid.value || autoStopsWithErrors.value.length) return;
  await saveShiftTemplate({ data: { ...formData, factoryIds: [factoryId.value] }, callback: async (template) => {
    await shiftSaveCallback(template, navigateToOverview);
    if (navigateToOverview) goBackToOverview();
  } });
}

async function onDelete() {
  const dialogConfig = {
    title: t('Confirmation'),
    text: t('Are you sure you want to delete {value}? Deleting or turning off templates won’t affect active shifts or historical data.', { value: formData.name }),
    action: async () => {
      await deleteShiftTemplate(formData);
      goBackToOverview();
    },
    confirmText: t('Delete'),
    cancelText: t('Cancel'),
  };
  openConfirmDialog(dialogConfig);
}
function goBackToOverview() {
  router.push({
    name: 'shiftTemplateOverview',
    query: route.query ? { ...route.query } : {},
  });
}

function promptSavingChanges(navigateToPath) {
  const confirmDialogConfig = {
    title: t('Confirmation'),
    text: t('You are about to exit without saving changes. Do you want to save changes?'),
    action: async () => {
      await onSave(false);
      router.push({ path: navigateToPath });
    },
    closeAction: () => {
      hasUnsavedPredefinedStops.value = false;
      router.push({ path: navigateToPath });
    },
    confirmText: t('Save'),
    cancelText: t('Don\'t save'),
    color: 'primary',
  };
  openConfirmDialog(confirmDialogConfig);
}

function onToggleAllDays() {
  if (formData.daysOfWeek.length === 7) {
    formData.daysOfWeek = [];
  } else {
    formData.daysOfWeek = days.value.map((day) => day.id);
  }
}
function isDaySelected(day) {
  return formData.daysOfWeek.includes(day.id);
}

const areAllDaysSelected = computed(() => formData.daysOfWeek.length === days.value.length);
const areSomeDaysSelected = computed(() => formData.daysOfWeek.length > 0 && formData.daysOfWeek.length < days.value.length);
function onDayClick(day) {
  const index = formData.daysOfWeek.indexOf(day.id);
  if (index === -1) {
    formData.daysOfWeek.push(day.id);
  } else {
    formData.daysOfWeek.splice(index, 1);
  }
}

function getEnabledDays() {
  return days.value.filter((d) => formData.daysOfWeek.includes(d.id));
}
function getDayEndTime(dayId) {
  return formData.dateConfig?.[dayId]?.endTime;
}
function getDayStartTime(dayId) {
  return formData.dateConfig?.[dayId]?.startTime;
}
function ensureDateConfig() {
  if (!formData.dateConfig) formData.dateConfig = {};
  return formData.dateConfig;
}

function setDayEndTime(dayId, endTime) {
  const dateConfig = ensureDateConfig();
  dateConfig[dayId] = {
    ...dateConfig[dayId],
    endTime,
  };
}

function setDayStartTime(dayId, startTime) {
  const dateConfig = ensureDateConfig();
  dateConfig[dayId] = {
    ...(dateConfig[dayId] || {}),
    startTime,
  };
}

function onCopyShiftDayTimes(dayId) {
  const config = formData.dateConfig?.[dayId];
  if (!config) return;
  const enabledDays = getEnabledDays();
  const dateConfig = {};
  enabledDays.forEach((d) => {
    dateConfig[d.id] = { ...config };
  });
  formData.dateConfig = dateConfig;
}


async function onEditNoShiftDeviation(column) {
  const inputData = column ? column.item : {};
  const deviation = { allowedStationIds: [...selectedFactoryAllowedStationIds.value], stationIds: [...formData.stationIds], shiftTemplateId: formData.id, ...inputData };
  openEditNoShiftDialog(deviation);
}

function onDeleteNoShiftDeviation(column) {
  const deviation = column.item;
  openDeleteNoShiftConfirmation(deviation);
}

function onDeleteTimeDeviation(column) {
  const deviation = column.item;
  openDeleteTimeDeviationConfirmation(deviation);
}

</script>

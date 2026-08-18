<template>
  <form-dialog-template
    :primary-segment-title="t('\'No shift\' days')"
    :primary-segment-subtitle="t('Set time periods when shift is not scheduled to run')"
  >
    <template #primary-segment>
      <v-form
        ref="form"
        v-model="valid"
        @submit="onSaveClick"
      >
        <v-row>
          <v-col class="px-1 mb-2" cols="12" :md="singleStationOption ? 12 : 6">
            <evocon-v-input
              v-model.trim="formData.description"
              :placeholder="t('Name')"
              :hint="t('Name')"
              :rules="[descriptionRule]"
              required
              validate-on-blur
              max-length="25"
              autofocus
            />
          </v-col>
          <v-col
            v-if="!singleStationOption"
            class="px-1 mb-2"
            cols="12"
            md="6"
          >
            <generic-station-input
              v-model="formData.stationIds"
              :items-override="filteredStations"
              required
            />
          </v-col>
          <v-col class="px-1 mb-2" cols="12">
            <double-date-range-menu
              :key="dateRange.toString()"
              :date-range="dateRange"
              selection-type="custom"
              required
              :max="maxDate"
              :min="minDate"
              :show-period-selection="false"
              :placeholder="t('Select range')"
              :hint="t('Select range')"
              :navigate-to-end-disabled="true"
              @update:date-range="(val) => { dateRange = val; }"
            />
          </v-col>
        </v-row>
      </v-form>
    </template>
    <template #actions>
      <delete-button
        v-if="formData.id"
        @click="onDeleteClick()"
      />
      <v-spacer />
      <evocon-v-button
        :text="t('Cancel')"
        type="secondary"
        @click="closeDialog()"
      />
      <evocon-v-button
        :text="t('Save')"
        color="primary"
        @click="onSaveClick()"
      />
    </template>
  </form-dialog-template>
</template>
<script setup>
import { reactive, ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { DateTime } from 'luxon';

import useGenericDialogStore from '@/stores/genericDialog';
import useStationStore from '@/stores/station';
import useShiftTemplateStore from '@/stores/shiftTemplate';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import GenericStationInput from '@/components/organisms/GenericStationInput/index.vue';
import DoubleDateRangeMenu from '@/components/molecules/DoubleDateRangeMenu/index.vue';
import FormDialogTemplate from '@/components/templates/FormDialogTemplate/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import DeleteButton from '@/components/atoms/DeleteButton/index.vue';
import { getInputStartOfDayAsInZoneISO, getInputEndOfDayAsInZoneISO, getInputDateAsInZoneISO } from '@/helpers/time/inputTime.js';
const { t } = useI18n();
const genericDialogStore = useGenericDialogStore();
const stationStore = useStationStore();
const shiftTemplateStore = useShiftTemplateStore();
const form = ref(null);
const valid = ref(false);

const dialogData = computed(() => genericDialogStore.dialogData);
const minDate = computed(() => DateTime.now().toISODate());
const maxDate = computed(() => DateTime.now().plus({ years: 1 }).toISODate());
const allowedStationIds = computed(() => dialogData.value?.allowedStationIds || []);

const filteredStations = computed(() => {
  const allStations = stationStore.stations;
  if (allowedStationIds.value.length === 0) return allStations;
  return allStations.filter((station) => allowedStationIds.value.includes(station.id));
});

const singleStationOption = computed(() => filteredStations.value.length === 1);

const formData = reactive({
  id: null,
  description: '',
  stationIds: [],
  startTime: null,
  endTime: null,
  shiftTemplateId: null,
});

onMounted(() => {
  setFormData();
});

const dateRange = ref([DateTime.now().toISODate(), DateTime.now().toISODate()]);

const orderedDateRange = computed(() => [...dateRange.value].sort((a, b) => a.localeCompare(b)));

watch(orderedDateRange, (newVal) => {
  formData.startTime = getInputStartOfDayAsInZoneISO(newVal[0], zoneId.value);
  formData.endTime = getInputEndOfDayAsInZoneISO(newVal[1], zoneId.value);
});

const descriptionRule = computed(() => (formData?.description?.length > 0) || t('Name'));
const zoneId = computed(() => filteredStations.value[0]?.zoneId || 'local');


async function onSaveClick() {
  await form.value.validate();
  if (!valid.value) return;
  genericDialogStore.primaryAction({
    ...formData,
    startTime: DateTime.fromISO(formData.startTime).setZone(zoneId.value).setZone('local', { keepLocalTime: true }).toISO(),
    endTime: DateTime.fromISO(formData.endTime).setZone(zoneId.value).setZone('local', { keepLocalTime: true }).toISO(),
  });
}

function closeDialog() {
  genericDialogStore.closeDialog();
}


function setFormData() {
  if (dialogData.value) {
    formData.id = dialogData.value.id || null;
    formData.description = dialogData.value.description || '';
    if (singleStationOption.value) {
      formData.stationIds = [filteredStations.value[0].id];
    } else {
      const stationIdsToBeSet = dialogData.value.stationIds ? [...dialogData.value.stationIds] : [];
      const stationIds = stationIdsToBeSet.filter((id) => filteredStations.value.some((s) => s.id === id));
      formData.stationIds = stationIds;
    }
    formData.startTime = getInputStartOfDayAsInZoneISO(dialogData.value.startTime, zoneId.value);
    formData.endTime = getInputEndOfDayAsInZoneISO(dialogData.value.endTime, zoneId.value);
    formData.shiftTemplateId = dialogData.value.shiftTemplateId || null;
    if (dialogData.value.startTime && dialogData.value.endTime) {
      const startDate = getInputDateAsInZoneISO(dialogData.value.startTime, zoneId.value);
      const endDate = getInputDateAsInZoneISO(dialogData.value.endTime, zoneId.value);
      dateRange.value = [startDate, endDate];
    }
  }
}

function onDeleteClick() {
  if (!formData.id) throw new Error('Cannot delete no-shift deviation without an ID');
  shiftTemplateStore.deleteShiftTemplateNoShiftDeviation({ ...formData });
  genericDialogStore.closeDialog();
}

</script>

<template>
  <v-radio-group
    :model-value="requirements.currentMonthlyTriggerMode"
    hide-details
    @update:model-value="$emit('update:requirements', { currentMonthlyTriggerMode: $event })"
  >
    <div class="d-flex mx-1 mt-2" :class="{ 'align-start flex-column': isMobileView, 'align-center': !isMobileView }">
      <div class="d-flex align-center">
        <evocon-v-radio
          :label="`${$t('On a specific weekday')}:`"
          :value="monthlyTriggerModes.ON_WEEKDAY"
        />
      </div>
      <div class="d-flex align-center" :class="{ 'ml-8 mt-2': isMobileView}">
        <selection-input
          :model-value="[requirements.occurrence]"
          :items="monthlyTriggerOccurrenceList"
          :disabled="isOnCalendarDayTriggerSelected"
          is-single-select
          hide-search
          use-chips
          required
          menu-input-class="mx-2"
          @update:model-value="$emit('update:requirements', { occurrence: $event[0] })"
        />
        <selection-input
          :model-value="[requirements.dayOfWeek]"
          :items="getDaysList(language, firstDayOfWeek)"
          :disabled="isOnCalendarDayTriggerSelected"
          item-text="text"
          is-single-select
          hide-search
          use-chips
          required
          @update:model-value="$emit('update:requirements', { dayOfWeek: $event[0] })"
        />
      </div>
    </div>
    <div class="d-flex mx-1 mt-2" :class="{ 'align-start flex-column': isMobileView, 'align-center mb-1': !isMobileView }">
      <div class="d-flex align-center">
        <evocon-v-radio
          :label="`${$t('On a specific calendar day')}:`"
          :value="monthlyTriggerModes.ON_CALENDAR_DAY"
        />
      </div>
      <evocon-number-input
        :model-value="requirements.dayOfMonth"
        :error="hasDayOfMonthError"
        :disabled="isOnWeekdayTriggerSelected"
        :suffix="$t('Day').toLowerCase()"
        use-chip
        grow
        class="mx-2"
        :class="{ 'ml-10 mt-2': isMobileView}"
        @update:model-value="$emit('update:requirements', { dayOfMonth: $event })"
      />
      <span
        v-if="showDayOfMonthMessage"
        class="text-body-small"
        :class="{ 'ml-10 mt-2': isMobileView, 'text-error': hasDayOfMonthError, 'text-secondary': showDayOfMonthWarning }"
      >
        {{ dayOfMonthMessage }}
      </span>
    </div>
  </v-radio-group>
</template>
<script setup name="ChecklistMonthlyTriggerConditionsBlock">
import { computed } from 'vue';

import useProfileStore from '@/stores/profile';
import useDeviceStore from '@/stores/device';
import i18n from '@/services/i18n';
import EvoconVRadio from '@/components/atoms/EvoconVRadio/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import EvoconNumberInput from '@/components/atoms/EvoconNumberInput/index.vue';
import { getDaysList } from '@/helpers/days/getDays';
import { monthlyTriggerModes, getMonthlyTriggerOccurrenceList } from '@/constants/checklistsConstants';

const profileStore = useProfileStore();
const deviceStore = useDeviceStore();

const props = defineProps({
  requirements: {
    type: Object,
    default: () => {},
  },
  hasDayOfMonthError: {
    type: Boolean,
  },
});

defineEmits(['update:requirements']);

const language = computed(() => profileStore.language);
const firstDayOfWeek = computed(() => profileStore.firstDayOfWeek);
const isMobileView = computed(() => deviceStore.isMobileView);

const monthlyTriggerOccurrenceList = computed(() => getMonthlyTriggerOccurrenceList());
const isOnWeekdayTriggerSelected = computed(() => props.requirements.currentMonthlyTriggerMode === monthlyTriggerModes.ON_WEEKDAY);
const isOnCalendarDayTriggerSelected = computed(() => props.requirements.currentMonthlyTriggerMode === monthlyTriggerModes.ON_CALENDAR_DAY);

const showDayOfMonthWarning = computed(() => {
  if (isOnCalendarDayTriggerSelected.value) {
    const maxCommonDaysInMonth = 28;
    return props.requirements.dayOfMonth > maxCommonDaysInMonth;
  }
  return false;
});

const showDayOfMonthMessage = computed(() => props.hasDayOfMonthError || showDayOfMonthWarning.value);
const dayOfMonthMessage = computed(() => {
  if (props.hasDayOfMonthError) return i18n.global.t('Value must be between {min} and {max}', { min: 1, max: 31 });
  if (showDayOfMonthWarning.value) return i18n.global.t('Not all months have {value} days', { value: props.requirements.dayOfMonth });
  return '';
});
</script>

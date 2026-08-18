<template>
  <slot name="frequency-type" />
  <selection-input
    :model-value="[requirements.subType]"
    :items="periodicFrequenciesList"
    use-chips
    is-single-select
    hide-search
    required
    menu-input-class="ma-1"
    @update:model-value="onSelectSubType($event[0])"
  />
  <span
    v-if="isWeeklyTrigger || isMonthlyTrigger"
    class="d-flex white-space-nowrap"
    :class="{ 'flex-column align-start': isMobileView, 'align-center': !isMobileView }"
  >
    <div class="d-flex align-center">
      <span class="ma-1">{{ $t('Repeat every').toLowerCase() }}</span>
      <evocon-number-input
        :model-value="requirements.repeatEvery"
        :error="hasRepeatEveryError"
        :suffix="repeatEverySuffix"
        use-chip
        grow
        class="ma-1"
        @update:model-value="$emit('update:requirements', { repeatEvery: $event })"
      />
    </div>
    <span v-if="hasRepeatEveryError" class="ma-1 text-body-small text-error">{{ repeatEveryErrorText }}</span>
  </span>
  <selection-input
    v-if="isWeeklyTrigger"
    :model-value="requirements.daysOfWeek"
    :items="getDaysList(language, firstDayOfWeek)"
    item-text="text"
    :prepend-text="`${$t('Days')}:`"
    use-chips
    show-empty-array-as-all-selected
    menu-input-class="ma-1"
    @update:model-value="$emit('update:requirements', { daysOfWeek: $event })"
  />
  <span v-if="requirements.subType === periodicSubTypes.DAILY" class="ma-1">{{ $t('Show at').toLowerCase() }}</span>
  <evocon-time-input
    v-for="(time, index) in requirements.times"
    :key="`time-${index}`"
    :ref="el => timeInputs[index] = el"
    :model-value="time"
    :append-inner-icon="requirements.times.length > 1 ? mdiCloseCircle : ''"
    :prepend-inner-icon="mdiClockOutline"
    :error="hasTimeError(index)"
    use-chip
    class="ma-1"
    @update:model-value="onTimeInput($event, index)"
    @click:append-inner="onRemoveTime(index)"
    @focusin="timeInputFocused = true"
    @focusout="timeInputFocused = false"
  />
  <span>
    <evocon-v-button
      :icon="mdiPlus"
      :text="$t('Time')"
      size="small"
      color="quaternary-dark"
      class="ma-1"
      :disabled="requirements.times.length >= 24"
      @click="onAddTime"
    />
  </span>
  <slot name="frequency-actions" />
  <checklist-monthly-trigger-conditions-block
    v-if="isMonthlyTrigger"
    :requirements="requirements"
    :has-day-of-month-error="hasDayOfMonthError"
    @update:requirements="$emit('update:requirements', $event)"
  />
</template>
<script setup name="ChecklistPeriodicTrigger">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { mdiCloseCircle, mdiClockOutline, mdiPlus } from '@mdi/js';

import useProfileStore from '@/stores/profile';
import useDeviceStore from '@/stores/device';
import i18n from '@/services/i18n';
import {
  periodicSubTypes,
  monthlyTriggerModes,
  dayOfMonthLimits,
  repeatEveryWeekLimits,
  repeatEveryMonthLimits,
  getPeriodicFrequenciesList,
  getMonthlyTriggerOccurrenceList,
} from '@/constants/checklistsConstants';
import { getRepeatEverySuffix } from '@/helpers/checklist/getRepeatEverySuffix';
import { getDaysList } from '@/helpers/days/getDays';
import { timeInput24h } from '@/helpers/validationRules';
import EvoconNumberInput from '@/components/atoms/EvoconNumberInput/index.vue';
import EvoconTimeInput from '@/components/atoms/EvoconTimeInput/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import ChecklistMonthlyTriggerConditionsBlock from '@/components/organisms/settings/ChecklistMonthlyTriggerConditionsBlock/index.vue';

const profileStore = useProfileStore();
const deviceStore = useDeviceStore();

const props = defineProps({
  requirements: {
    type: Object,
    default: () => {},
  },
});

const emit = defineEmits(['update:requirements', 'update:is-trigger-complete', 'update:has-trigger-error']);

const hasTimeValidationError = ref(false);
const timeInputFocused = ref(false);
const timeInputs = ref([]);

const language = computed(() => profileStore.language);
const firstDayOfWeek = computed(() => profileStore.firstDayOfWeek);
const isMobileView = computed(() => deviceStore.isMobileView);

const periodicFrequenciesList = computed(() => getPeriodicFrequenciesList());
const monthlyTriggerOccurrenceList = computed(() => getMonthlyTriggerOccurrenceList());
const isWeeklyTrigger = computed(() => props.requirements.subType === periodicSubTypes.WEEKLY);
const isMonthlyTrigger = computed(() => props.requirements.subType === periodicSubTypes.MONTHLY);
const isOnCalendarDayTriggerSelected = computed(() => props.requirements.currentMonthlyTriggerMode === monthlyTriggerModes.ON_CALENDAR_DAY);
const repeatEverySuffix = computed(() => getRepeatEverySuffix(props.requirements));

const isBetween = (value, min, max) => value >= min && value <= max;

const hasRepeatEveryError = computed(() => {
  const { repeatEvery } = props.requirements;
  if (isWeeklyTrigger.value) {
    return !isBetween(repeatEvery, repeatEveryWeekLimits.min, repeatEveryWeekLimits.max);
  }
  if (isMonthlyTrigger.value) {
    return !isBetween(repeatEvery, repeatEveryMonthLimits.min, repeatEveryMonthLimits.max);
  }
  return false;
});

const hasDayOfMonthError = computed(() => {
  if (isMonthlyTrigger.value && isOnCalendarDayTriggerSelected.value) {
    return props.requirements.dayOfMonth !== null && !isBetween(props.requirements.dayOfMonth, dayOfMonthLimits.min, dayOfMonthLimits.max);
  }
  return false;
});

const repeatEveryErrorText = computed(() => i18n.global.t('Value must be between {min} and {max}', {
  min: isWeeklyTrigger.value ? repeatEveryWeekLimits.min : repeatEveryMonthLimits.min,
  max: isWeeklyTrigger.value ? repeatEveryWeekLimits.max : repeatEveryMonthLimits.max,
}));

const setMonthlyTriggerData = () => {
  const defaults = {
    occurrence: monthlyTriggerOccurrenceList.value[0].id,
    dayOfWeek: getDaysList(language.value, firstDayOfWeek.value)[0].id,
    dayOfMonth: null,
    repeatEvery: 1,
  };

  const newRequirements = { ...defaults };
  for (const key in props.requirements) {
    if (props.requirements[key] !== null) {
      newRequirements[key] = props.requirements[key];
    }
  }

  emit('update:requirements', newRequirements);
};

const onSelectSubType = (subType) => {
  if (subType === periodicSubTypes.MONTHLY) setMonthlyTriggerData();
  if (subType === periodicSubTypes.WEEKLY) emit('update:requirements', { subType, repeatEvery: 1 });
  else emit('update:requirements', { subType });
};

const hasTimeError = (index) => {
  const hasDuplicate = props.requirements.times.some((time, i) => i !== index && !!time && time === props.requirements.times[index]);
  return hasDuplicate || (!props.requirements.times[index] && hasTimeValidationError.value);
};

const reOrderTimes = async () => {
  // timeinput24h regex is used because internally time is stored in 24h format
  const isValid = props.requirements.times.every((time) => (timeInput24h.test(time)));

  if (!isValid) return;
  const times = [...props.requirements.times].sort((a, b) => {
    if (!a) return 1;
    if (!b) return -1;
    return a.localeCompare(b);
  });
  emit('update:requirements', { times: [''] });
  await nextTick();
  emit('update:requirements', { times });
};

const onTimeInput = (time, index) => {
  hasTimeValidationError.value = false;
  const newTimes = [...props.requirements.times];
  newTimes[index] = time;
  emit('update:requirements', { times: newTimes });
};

const onRemoveTime = (index) => {
  hasTimeValidationError.value = false;
  if (props.requirements.times.length === 1) {
    emit('update:requirements', { times: [''] });
    return;
  }
  const times = [...props.requirements.times];
  times.splice(index, 1);
  emit('update:requirements', { times });
};

const onAddTime = async () => {
  const times = [...props.requirements.times];
  times.push('');
  emit('update:requirements', { times });
  await nextTick();
  const input = timeInputs.value[times.length - 1];
  input?.$refs['time-input'].$refs.evoconTimeInput.$refs.evoconInputChip.$refs.chipInput.focus();
};

const isTriggerComplete = computed(() => {
  const { repeatEvery, dayOfMonth, times } = props.requirements;
  const areTimeInputsValid = times.every((time, i) => !!time);
  if (isMonthlyTrigger.value && isOnCalendarDayTriggerSelected.value) {
    return areTimeInputsValid && repeatEvery !== null && dayOfMonth !== null;
  }
  if (isWeeklyTrigger.value || isMonthlyTrigger.value) {
    return areTimeInputsValid && repeatEvery !== null;
  }
  return areTimeInputsValid;
});

const hasTriggerError = computed(() => {
  const isSomeTimeInputInvalid = props.requirements.times.some((time, i) => hasTimeError(i));
  if (isMonthlyTrigger.value) {
    return isSomeTimeInputInvalid || hasRepeatEveryError.value || hasDayOfMonthError.value;
  }
  if (isWeeklyTrigger.value) {
    return isSomeTimeInputInvalid || hasRepeatEveryError.value;
  }
  return isSomeTimeInputInvalid;
});

const validateMonthlyTrigger = () => {
  if (props.requirements.dayOfMonth === null && isOnCalendarDayTriggerSelected.value) emit('update:requirements', { dayOfMonth: 0 });
  if (props.requirements.times.some((time, i) => !time || hasTimeError(i))) hasTimeValidationError.value = true;
};

const validate = () => {
  if (!isTriggerComplete.value) {
    if (isMonthlyTrigger.value) validateMonthlyTrigger();
    else hasTimeValidationError.value = true;
  }
};

watch(timeInputFocused, (newVal, prevVal) => {
  if (prevVal && !newVal) reOrderTimes();
});

watch(isTriggerComplete, (newVal) => {
  emit('update:is-trigger-complete', newVal);
}, { immediate: true });

watch(hasTriggerError, (newVal) => {
  emit('update:has-trigger-error', newVal);
}, { immediate: true });

onMounted(async () => {
  await nextTick();
  if (isMonthlyTrigger.value) setMonthlyTriggerData();
});

defineExpose({ validate });
</script>

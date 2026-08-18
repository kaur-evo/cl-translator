<template>
  <v-card-text class="py-2">
    <v-radio-group
      v-model="startTimeOption"
      hide-details
    >
      <evocon-v-radio :label="$t('Start interval now')" value="now" />
      <evocon-v-radio :label="$t('Set interval start time')" value="time" class="mt-2">
        <template #label-append>
          <span class="ma-1 ml-2">
            <evocon-time-input
              v-model="startTime"
              :prepend-inner-icon="mdiClockOutline"
              :disabled="startTimeOption !== 'time'"
              use-chip
            />
          </span>
        </template>
      </evocon-v-radio>
    </v-radio-group>
  </v-card-text>
  <v-card-actions>
    <v-spacer />
    <evocon-v-button :text="$t('Cancel')" @click="closeDialog" />
    <evocon-v-button :text="$t('Save')" color="primary" @click="onSave" />
  </v-card-actions>
</template>

<script setup name="IntervalChecklistStartTimeDialog">
import { mdiClockOutline } from '@mdi/js';
import { ref } from 'vue';

import useGenericDialogStore from '@/stores/genericDialog';
import useChecklistTemplateStore from '@/stores/checklistTemplate';
import EvoconVRadio from '@/components/atoms/EvoconVRadio/index.vue';
import EvoconTimeInput from '@/components/atoms/EvoconTimeInput/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import { buildIntervalStartTimeISO } from '@/helpers/time/buildIntervalStartTimeISO';

const startTimeOption = ref('now');
const startTime = ref(null);

const checklistTemplateStore = useChecklistTemplateStore();
const genericDialogStore = useGenericDialogStore();
const closeDialog = () => genericDialogStore.closeDialog();

const onSave = () => {
  const checklist = { ...genericDialogStore.dialogData.checklist };
  if (startTimeOption.value === 'time' && startTime.value) {
    checklist.startTime = buildIntervalStartTimeISO(startTime.value);
  }
  checklistTemplateStore.saveChecklist(checklist);
  closeDialog();
};

</script>

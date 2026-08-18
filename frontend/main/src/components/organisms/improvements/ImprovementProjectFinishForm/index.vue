<template>
  <div class="px-4 pb-4 pt-0">
    <div class="mx-2 text-body-small text-medium-emphasis">
      {{ $t('Problem statement') }}
    </div>
    <div class="mx-2 text-body-large mt-1 mb-4 text-high-emphasis">
      {{ project.description }}
    </div>
    <evocon-v-textarea
      v-model="summaryInput"
      class="ma-2"
      :rules="[(v) => !!v]"
      :placeholder="$t('Improvement summary')"
      :hint="$t('Improvement summary')"
      counter
      no-resize
    />
    <evocon-date-input
      v-model="completionDate"
      :min="project.startDate"
      :hint="$t('Done')"
      class="mx-2"
    />
    <v-card-actions class="pa-2 justify-end">
      <evocon-v-button
        variant="text"
        :text="$t('Cancel')"
        @click="closeDialog()"
      />
      <evocon-v-button
        color="primary"
        :disabled="!summaryInput.length"
        :icon="project.finished ? '' : mdiCheckCircle"
        :text="project.finished ? $t('Save') : $t('Finish')"
        @click="finishProject()"
      />
    </v-card-actions>
  </div>
</template>
<script>
import { mapState, mapActions } from 'pinia';
import { mdiCalendar, mdiCheckCircle } from '@mdi/js';
import { format } from 'date-fns';

import { useGenericDialogStore } from '@/stores/index';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import EvoconVTextarea from '@/components/atoms/EvoconVTextarea/index.vue';
import EvoconDateInput from '@/components/molecules/EvoconDateInput/index.vue';

const vectorIcons = { mdiCalendar, mdiCheckCircle };

export default {
  name: 'ImprovementProjectFinishForm',
  components: { EvoconVButton, EvoconVTextarea, EvoconDateInput },
  data() {
    return {
      ...vectorIcons,
      completionDate: format(new Date(), 'yyyy-MM-dd'),
      summaryInput: '',
    };
  },
  computed: {
    ...mapState(useGenericDialogStore, ['dialogData']),
    project() {
      return this.dialogData.project || {};
    },
  },
  mounted() {
    this.summaryInput = this.project.finalSummary || '';
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog']),
    finishProject() {
      if (this.summaryInput.length) {
        this.dialogData.successCB({
          finalSummary: this.summaryInput,
          endDate: this.completionDate,
          finished: true,
        });
        this.closeDialog();
      }
    },
  },
};
</script>

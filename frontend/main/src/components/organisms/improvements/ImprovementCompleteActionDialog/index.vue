<template>
  <div class="pa-4">
    <v-row>
      <v-col class="pl-2">
        <div class="text-body-small font-weight-medium text-disabled">
          {{ $t('Description') }}
        </div>
        <div class="text-body-medium pb-2">
          {{ action.description }}
        </div>
      </v-col>
    </v-row>
    <v-row>
      <evocon-date-input
        v-model="completionDate"
        :min="action.startDate"
        :hint="$t('Done')"
      />
    </v-row>
    <v-card-actions class="pa-2 justify-end">
      <evocon-v-button
        variant="text"
        :text="$t('Cancel')"
        @click="closeDialog"
      />
      <evocon-v-button
        color="primary"
        :icon="mdiCheckCircle"
        :text="$t('Done')"
        @click="markAsComplete"
      />
    </v-card-actions>
  </div>
</template>
<script>
import { mapState, mapActions } from 'pinia';
import { mdiCheckCircle, mdiCalendar } from '@mdi/js';
import { format } from 'date-fns';

import { useGenericDialogStore } from '@/stores/index';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import EvoconDateInput from '@/components/molecules/EvoconDateInput/index.vue';

const vectorIcons = { mdiCheckCircle, mdiCalendar };

export default {
  name: 'ImprovementCompleteActionDialog',
  components: { EvoconVButton, EvoconDateInput },
  data() {
    return {
      ...vectorIcons,
      completionDate: format(new Date(), 'yyyy-MM-dd'),
    };
  },
  computed: {
    ...mapState(useGenericDialogStore, ['dialogData', 'onPrimaryAction']),
    action() {
      return this.dialogData.action;
    },
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog']),
    markAsComplete() {
      this.onPrimaryAction(this.action, this.completionDate);
    },
  },
};
</script>
<style lang="less" scoped>
.date-field {
  width: 100%;
}
</style>

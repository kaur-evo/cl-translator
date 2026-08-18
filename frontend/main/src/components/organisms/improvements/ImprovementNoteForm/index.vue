<template>
  <div class="px-4">
    <v-form
      ref="form"
      v-model="valid"
    >
      <evocon-v-textarea
        v-model="note.note"
        :placeholder="$t('Description')"
        :rules="[(v) => !!v]"
        :auto-grow="false"
        :disabled="isLoading"
        required
        no-resize
      />
      <selection-input
        :model-value="[note.stepId]"
        :items="steps"
        :placeholder="$t('Action')"
        :hint="`${$t('Link to an action')} (${$t('Optional').toLowerCase()})`"
        item-text="inputText"
        :disabled="isLoading"
        is-single-select
        hide-search
        @update:model-value="note.stepId = $event[0]"
      />
    </v-form>
    <v-card-actions class="px-0 justify-end">
      <evocon-v-button
        variant="text"
        :text="$t('Close')"
        @click="closeDialog"
      />
      <evocon-v-button
        color="primary"
        :disabled="!note.note"
        :loading="isLoading"
        :text="$t('Save')"
        @click="onSaveClick"
      />
    </v-card-actions>
  </div>
</template>
<script>
import { mapState, mapActions } from 'pinia';

import { useGenericDialogStore, useImprovementsNoteStore } from '@/stores/index';
import truncateText from '@/helpers/text/truncateText';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import EvoconVTextarea from '@/components/atoms/EvoconVTextarea/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';

export default {
  name: 'ImprovementNoteForm',
  components: { EvoconVButton, EvoconVTextarea, SelectionInput },
  data() {
    return {
      valid: true,
      note: {
        id: null,
        note: '',
        projectId: '',
        stepId: null,
      },
    };
  },
  computed: {
    ...mapState(useGenericDialogStore, ['dialogData', 'onPrimaryAction']),
    ...mapState(useImprovementsNoteStore, ['isLoading']),
    steps() {
      return this.dialogData.steps.map((step) => ({
        ...step,
        // eslint-disable-next-line no-magic-numbers
        inputText: `${step.ordering + 1}. ${this.truncateText(step.description, 65)}`,
      }));
    },
  },
  mounted() {
    this.note = { ...this.note, ...this.dialogData.note };
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog']),
    ...mapActions(useImprovementsNoteStore, ['editNote', 'createNote']),
    truncateText,
    async onSaveClick() {
      await this.$refs.form.validate();
      if (!this.valid) return;
      if (this.note.id) {
        await this.editNote(this.note);
      } else {
        await this.createNote(this.note);
      }
      this.onPrimaryAction();
      this.closeDialog();
    },
  },
};
</script>

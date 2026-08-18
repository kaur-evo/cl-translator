<template>
  <v-col class="px-4">
    <v-form
      ref="form"
      v-model="valid"
    >
      <evocon-v-input
        v-model.trim="name"
        class="mx-2"
        :placeholder="$t('Template name')"
        :rules="[(v) => !!v && !!String(v).trim() || $t('Template name')]"
        required
        @update:model-value="$emit('update-data', name)"
      />
    </v-form>
    <v-card-actions class="px-0 justify-end">
      <evocon-v-button
        color="grey-darken-4"
        variant="text"
        :text="$t('Close')"
        @click="closeDialog"
      />
      <evocon-v-button
        color="primary"
        :loading="loading"
        :text="$t('Save')"
        @click="onSaveClick"
      />
    </v-card-actions>
  </v-col>
</template>
<script>
import { mapState, mapActions } from 'pinia';

import { useGenericDialogStore } from '@/stores/index';
import improvementsActionsTemplateApi from '@/api/improvementsActionsTemplateApi';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';

export default {
  name: 'ImprovementActionsTemplateSaveForm',
  components: { EvoconVButton, EvoconVInput },
  emits: ['update-data'],
  data() {
    return {
      loading: false,
      valid: true,
      name: '',
    };
  },
  computed: {
    ...mapState(useGenericDialogStore, ['dialogData', 'onPrimaryAction']),
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog']),
    sanitizeActions(actions) {
      return actions.map((action) => ({
        description: action.description,
        projectId: null,
        ordering: action.ordering,
        responsibleUsers: [],
        deadline: '',
      }));
    },
    async onSaveClick() {
      await this.$refs.form.validate();
      if (!this.valid) return;
      const formData = { name: this.name, steps: this.sanitizeActions(this.dialogData.actions) };
      this.loading = true;
      await improvementsActionsTemplateApi.saveActionTemplate(formData);
      this.loading = false;
      const currentTemplates = await improvementsActionsTemplateApi.listActionTemplates();
      this.onPrimaryAction(currentTemplates);
      this.closeDialog();
    },
  },
};
</script>

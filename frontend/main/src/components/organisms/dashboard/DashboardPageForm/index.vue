<template>
  <v-form
    ref="form"
    v-model="valid"
    @submit="onSaveClick"
  >
    <evocon-v-input
      v-model.trim="formData.name"
      :placeholder="$t('Name')"
      :hint="$t('Name')"
      :rules="[nameRule]"
      class="px-4 pt-4 mb-2"
      required
      validate-on-blur
      :max-length="maxNameLength"
      autofocus
    />
    <v-card-actions>
      <v-spacer />
      <evocon-v-button
        :text="$t('Cancel')"
        type="secondary"
        @click="closeDialog"
      />
      <evocon-v-button
        :text="$t('Save')"
        color="primary"
        @click="onSaveClick"
      />
    </v-card-actions>
  </v-form>
</template>
<script>
import { mapState, mapActions } from 'pinia';

import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import { useGenericDialogStore } from '@/stores/index';

export default {
  name: 'DashboardPageForm',
  components: { EvoconVButton, EvoconVInput },
  data() {
    return {
      valid: true,
      maxNameLength: 25,
      formData: {
        id: false,
        name: '',
      },
    };
  },
  computed: {
    ...mapState(useGenericDialogStore, ['dialogData', 'onPrimaryAction']),
  },
  mounted() {
    this.formData = { ...this.dialogData.page };
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog']),
    nameRule(v) {
      return (!!v && v.length <= this.maxNameLength) || this.$t('Name');
    },
    async onSaveClick() {
      await this.$refs.form.validate();
      if (this.valid) {
        this.onPrimaryAction(this.formData);
      }
    },
  },
};
</script>

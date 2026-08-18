<template>
  <form-dialog-template
    :primary-segment-title="formData.entityId ? $t('Edit translation') : $t('Translation')"
  >
    <template #primary-segment>
      <v-form
        ref="form"
        v-model="valid"
        @submit="onSaveClick"
      >
        <v-row>
          <v-col
            cols="12"
            class="px-1 mb-2"
          >
            <selection-input
              :model-value="[formData.languageId]"
              :items="filteredLanguages"
              :items-map="languageMap"
              :placeholder="$t('Select language')"
              :hint="$t('Language')"
              item-value="languageId"
              item-flag="languageId"
              :checkbox="false"
              is-single-select
              hide-search
              required
              @update:model-value="onLanguageSelect"
            />
          </v-col>
          <v-col
            cols="12"
            class="px-1"
          >
            <evocon-v-input
              v-model.trim="formData.languageText"
              variant="filled"
              :rules="[(v) => !!v && !!v.trim() || $t('Translation')]"
              required
              validate-on="blur"
              :maxlength="100"
              :counter="100"
              :placeholder="$t('Translation')"
              :hint="$t('Translation')"
              persistent-hint
            />
          </v-col>
        </v-row>
      </v-form>
    </template>
    <template #actions>
      <v-spacer />
      <evocon-v-button
        :text="$t('Cancel')"
        type="secondary"
        @click="onCancelClick"
      />
      <evocon-v-button
        v-if="dialogData.isEntityAdding"
        :text="$t('Apply') "
        type="primary-light"
        @click="onSaveClick"
      />
      <evocon-v-button
        v-else
        :text="$t('Save')"
        color="primary"
        @click="onSaveClick"
      />
    </template>
  </form-dialog-template>
</template>
<script>
import { mapState, mapActions } from 'pinia';

import useGenericDialogStore from '@/stores/genericDialog';
import FormDialogTemplate from '@/components/templates/FormDialogTemplate/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import { languages, languageMap } from '@/constants/languages';

export default {
  name: 'SettingsTranslationsEditForm',
  components: {
    FormDialogTemplate,
    EvoconVButton,
    SelectionInput,
    EvoconVInput,
  },
  data() {
    return {
      valid: true,
      formData: {
        languageId: null,
        languageText: '',
      },
      languageMap,
    };
  },
  computed: {
    ...mapState(useGenericDialogStore, ['dialogData']),
    filteredLanguages() {
      const { translation, addedTranslations } = this.dialogData;
      return languages.filter((lang) => addedTranslations.every((trans) => trans.languageId !== lang.languageId || (translation?.languageId === lang.languageId)));
    },
  },
  mounted() {
    this.formData = { ...this.dialogData.translation };
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog']),
    onLanguageSelect(value) {
      this.formData = { ...this.formData, languageId: value[0] };
    },
    async validate() {
      this.$refs.form.validate();
    },
    async onSaveClick() {
      await this.validate();
      if (this.valid) {
        this.dialogData.action(this.formData);
        this.closeDialog();
      }
    },
    onCancelClick() {
      this.closeDialog();
    },
  },
};
</script>

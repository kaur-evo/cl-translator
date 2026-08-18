<template>
  <form-dialog-template
    :primary-segment-title="isEdit ? dialogData.bookmark.name : $t('Save a report')"
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
            <evocon-v-input
              v-model.trim="formData.name"
              variant="filled"
              :rules="[(v) => !!v || $t('Name')]"
              required
              validate-on="blur"
              :maxlength="50"
              :counter="50"
              :placeholder="$t('Name')"
              :hint="$t('Name')"
              persistent-hint
              @focus="setDialogPersistence(true)"
              @blur="setDialogPersistence(false)"
            />
          </v-col>
          <v-col
            cols="12"
            class="px-1"
          >
            <v-textarea
              v-model.trim="formData.description"
              variant="filled"
              validate-on="blur"
              :maxlength="100"
              :counter="100"
              rows="3"
              :placeholder="$t('Description')"
              :hint="`(${firstUpper($t('Optional'))})`"
              persistent-hint
              @focus="setDialogPersistence(true)"
              @blur="setDialogPersistence(false)"
            />
          </v-col>
        </v-row>
      </v-form>
    </template>
    <template #actions>
      <delete-button
        v-if="isEdit"
        @click="onDeleteClick()"
      />
      <v-spacer />
      <evocon-v-button
        :text="$t('Cancel')"
        type="secondary"
        @click="closeDialog()"
      />
      <evocon-v-button
        :text="$t('Save')"
        color="primary"
        @click="onSaveClick()"
      />
    </template>
  </form-dialog-template>
</template>
<script>
import { mapActions, mapState } from 'pinia';

import { useGenericDialogStore, useReportsConfigStore, useBookmarkStore } from '@/stores';
import { firstUpper } from '@/helpers/string-formatting';
import FormDialogTemplate from '@/components/templates/FormDialogTemplate/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import DeleteButton from '@/components/atoms/DeleteButton/index.vue';

export default {
  name: 'ReportsBookmarkForm',
  components: {
    FormDialogTemplate,
    EvoconVButton,
    EvoconVInput,
    DeleteButton,
  },
  data() {
    return {
      valid: true,
      formData: {
        name: '',
        description: '',
      },
    };
  },
  computed: {
    ...mapState(useGenericDialogStore, ['dialogData']),
    ...mapState(useReportsConfigStore, ['reportName', 'reportDescription', 'configType']),
    ...mapState(useBookmarkStore, ['bookmarkPresetsMap']),
    isEdit() {
      return !!this.dialogData.bookmark;
    },
  },
  mounted() {
    const hasNameChanged = this.reportName !== this.bookmarkPresetsMap[this.configType].name;
    if (hasNameChanged) {
      this.formData.name = this.reportName;
    }
    this.formData.description = this.reportDescription;
  },
  methods: {
    firstUpper,
    ...mapActions(useGenericDialogStore, ['closeDialog', 'setDialogPersistence']),
    ...mapActions(useBookmarkStore, ['saveNewBookmark', 'initDeleteBookmarkFlow', 'editBookmark']),
    async onSaveClick() {
      await this.$refs.form.validate();
      if (this.valid) {
        if (this.isEdit) this.editBookmark({ ...this.formData, id: this.dialogData.bookmark.id });
        else this.saveNewBookmark(this.formData);
        this.closeDialog();
      }
    },
    onDeleteClick() {
      this.initDeleteBookmarkFlow();
    },
  },
};
</script>

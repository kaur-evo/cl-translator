<template>
  <form-dialog-template
    :primary-segment-title="formData.id ? dialogData.tag.name : `${$t('New')}: ${$t('Tag')}`"
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
              :rules="[(v) => !!v && !!v.trim() || $t('Tag')]"
              required
              validate-on="blur"
              :max-length="200"
              :placeholder="$t('Tag')"
              :hint="$t('Tag')"
              @focus="setDialogPersistence(true)"
              @blur="setDialogPersistence(false)"
            />
          </v-col>
          <v-col
            cols="12"
            class="px-1 mb-2"
          >
            <evocon-v-input
              v-model.trim="formData.alias"
              :rules="[(v) => !!v && !!v.trim() || $t('Alias')]"
              required
              validate-on="blur"
              :max-length="15"
              :placeholder="$t('Alias')"
              :hint="$t('Alias')"
              @focus="setDialogPersistence(true)"
              @blur="setDialogPersistence(false)"
            />
          </v-col>
          <v-col
            cols="12"
            class="px-1"
          >
            <selection-input
              v-model="formData.entities"
              :placeholder="$t('Type')"
              item-text="text"
              item-value="value"
              :hint="$t('Type')"
              :items="getEnabledTagEntitiesList()"
              hide-search
            />
          </v-col>
        </v-row>
      </v-form>
    </template>
    <template #actions>
      <delete-button
        v-if="formData.id"
        @click="onDeleteClick()"
      />
      <v-spacer />
      <evocon-v-button
        type="secondary"
        :text="$t('Cancel')"
        @click="onCancelClick()"
      />
      <evocon-v-button
        color="primary"
        :text="$t('Save')"
        @click="onSaveClick()"
      />
    </template>
  </form-dialog-template>
</template>
<script>
import { mapState, mapActions } from 'pinia';

import useGenericDialogStore from '@/stores/genericDialog';
import useConfirmDialogStore from '@/stores/confirmDialog';
import { useTagStore } from '@/stores/index';
import FormDialogTemplate from '@/components/templates/FormDialogTemplate/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import DeleteButton from '@/components/atoms/DeleteButton/index.vue';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import { getEnabledTagEntitiesList } from '@/components/organisms/settings/SettingsTagEditForm/enabledTagEntities';

export default {
  name: 'SettingsTagEditForm',
  components: {
    FormDialogTemplate,
    EvoconVButton,
    EvoconVInput,
    DeleteButton,
    SelectionInput,
  },
  data() {
    return {
      valid: true,
      formData: {
        name: '',
        alias: '',
      },
    };
  },
  computed: {
    ...mapState(useGenericDialogStore, ['dialogData']),
  },
  mounted() {
    this.formData = { ...this.dialogData.tag };
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog', 'setDialogPersistence']),
    ...mapActions(useConfirmDialogStore, ['openConfirmDialog']),
    ...mapActions(useTagStore, ['saveTag', 'deleteTag']),
    getEnabledTagEntitiesList,
    async validate() {
      await this.$refs.form.validate();
    },
    async onSaveClick() {
      await this.validate();
      if (this.valid) {
        this.saveTag(this.formData);
        this.closeDialog();
      }
    },
    onCancelClick() {
      this.closeDialog();
    },
    onDeleteClick() {
      const dialogConfig = {
        title: this.$t('Confirmation'),
        text: this.$t('Are you sure you want to delete {value}?', { value: this.formData.name }),
        action: async () => {
          await this.deleteTag({ id: this.formData.id });
          this.closeDialog();
        },
        confirmText: this.$t('Delete'),
        cancelText: this.$t('Cancel'),
      };
      this.openConfirmDialog(dialogConfig);
    },
  },
};
</script>

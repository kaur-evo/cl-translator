<template>
  <v-row>
    <v-col
      cols="12"
      class="px-1"
    >
      <v-progress-linear
        v-if="loading"
        indeterminate
        class="mt-n1"
      />
      <tiny-cards-list
        :items="translationsWithLang"
        title-text-key="languageText"
        subtitle-text-key="langName"
        flag-icon-key="iconKey"
        :card-buttons="translationsCardButtons"
      />
    </v-col>
    <v-col
      cols="12"
      class="px-1 mt-2"
    >
      <evocon-v-button
        :text="$t('Translation')"
        :icon="mdiPlus"
        color="quaternary-dark"
        @click="onAdd"
      />
    </v-col>
  </v-row>
</template>
<script>
import { mapActions } from 'pinia';
import { mdiDelete, mdiPencil, mdiPlus } from '@mdi/js';
import { defineAsyncComponent } from 'vue';

import useGenericDialogStore from '@/stores/genericDialog';
import useConfirmDialogStore from '@/stores/confirmDialog';
import useGenericNotificationStore from '@/stores/genericNotification';
import translationApi from '@/api/translationApi';
import TinyCardsList from '@/components/molecules/TinyCardsList/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import { languageMap } from '@/constants/languages';

const vectorIcons = { mdiDelete, mdiPencil, mdiPlus };
export default {
  name: 'SettingsTranslationsCard',
  components: {
    TinyCardsList,
    EvoconVButton,
  },
  props: {
    languageTextEntity: {
      type: String,
      required: true,
    },
    entityId: {
      type: [String, Number],
      required: true,
    },
  },
  emits: ['update:have-translations-changed'],
  data() {
    return {
      ...vectorIcons,
      translations: [],
      loading: false,
    };
  },
  computed: {
    translationsWithLang() {
      return this.translations.map((t) => ({
        ...t,
        langName: this.getLanguageName(t.languageId),
        iconKey: this.getLanguageCountryCode(t.languageId),
      }));
    },
    newOrNoEntity() {
      return this.entityId === 0 || Number.isNaN(Number(this.entityId));
    },
    translationsCardButtons() {
      return [
        {
          icon: mdiPencil,
          text: this.$t('Edit'),
          tooltip: this.$t('Edit'),
          action: (props) => this.onEdit(props),
        },
        {
          icon: mdiDelete,
          text: this.$t('Delete'),
          tooltip: this.$t('Delete'),
          action: (props) => this.onDelete(props),
        },
      ];
    },
  },
  watch: {
    entityId(val) {
      if (val) {
        this.fetchTranslations();
      }
    },
  },
  mounted() {
    this.fetchTranslations();
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['openDialog']),
    ...mapActions(useConfirmDialogStore, ['openConfirmDialog']),
    ...mapActions(useGenericNotificationStore, ['notifySuccess', 'notifyError']),
    async fetchTranslations() {
      if (this.newOrNoEntity) return;
      this.loading = true;
      this.translations = await translationApi.getLanguageTexts(this.languageTextEntity, this.entityId);
      this.loading = false;
    },
    async saveTranslations(entityId, notificationText) {
      this.translations = this.translations.map((t) => ({ ...t, entityId }));
      try {
        translationApi.putLanguageTexts(this.translations);
        if (notificationText && notificationText.length) this.notifySuccess(this.$t('{value} saved', { value: notificationText }));
      } catch {
        this.notifyError('We are sorry! There is a problem with your request');
      }
      this.$emit('update:have-translations-changed', false);
    },
    getLanguageName(id) {
      return languageMap[id].name;
    },
    getLanguageCountryCode(id) {
      return languageMap[id].countryCode;
    },
    onAdd() {
      this.openTranslationDialog();
    },
    onEdit({ item, index }) {
      this.openTranslationDialog({ translation: item, index });
    },
    onDelete({ item, index }) {
      if (this.newOrNoEntity) {
        this.translations.splice(index, 1);
      } else {
        const dialogConfig = {
          title: this.$t('Confirmation'),
          text: this.$t('Are you sure you want to delete {value}?', { value: item.languageText }),
          action: () => this.onConfirmDelete(item, index),
          confirmText: this.$t('Delete'),
          cancelText: this.$t('Cancel'),
        };
        this.openConfirmDialog(dialogConfig);
      }
    },
    async onConfirmDelete(item, index) {
      try {
        await translationApi.deleteLanguageText(item.id);
        this.translations.splice(index, 1);
        this.notifySuccess(this.$t('{value} deleted', { value: item.languageText }));
      } catch {
        this.notifyError(this.$t('We are sorry! There is a problem with your request'));
      }
    },
    openTranslationDialog({ translation, index } = { translation: null }) {
      const dialogConfig = {
        component: defineAsyncComponent(() => import('../SettingsTranslationEditForm/index.vue')),
        data: {
          isEntityAdding: this.newOrNoEntity,
          action: (item) => this.onTranslationChange({ item, index }),
          translation,
          addedTranslations: this.translationsWithLang,
        },
        allowFullscreen: true,
      };
      this.openDialog(dialogConfig);
    },
    onTranslationChange({ item, index }) {
      const sanitizedItem = {
        ...item,
        entity: this.languageTextEntity,
        entityId: this.entityId,
      };
      if (index || index === 0) {
        this.translations.splice(index, 1, sanitizedItem);
      } else {
        this.translations.push(sanitizedItem);
      }
      if (this.newOrNoEntity) {
        this.$emit('update:have-translations-changed', true);
      } else {
        this.saveTranslations(this.entityId, item.languageText);
      }
    },
  },
};
</script>

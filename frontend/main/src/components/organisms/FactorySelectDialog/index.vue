<template>
  <dialog-template :title="$t('Choose factory')">
    <template #content>
      <div class="px-2">
        <evocon-v-checkbox
          :model-value="selectedFactories.length > 0"
          :label="$t('Select all')"
          :indeterminate="selectedFactories.length > 0 && selectedFactories.length < 7"
          class="my-2"
          @change="onToggleAllFactories"
        />
        <v-divider />
        <evocon-v-checkbox
          v-for="factory in factories"
          :key="`factory-${factory.id}`"
          v-model="selectedFactories"
          :label="factory.name"
          :true-value="factory.id"
          class="my-2"
        />
      </div>
    </template>
    <template #actions>
      <v-spacer />
      <evocon-v-button
        :text="$t('Cancel')"
        type="secondary"
        @click="closeDialog"
      />
      <evocon-v-button
        :icon="mdiDownload"
        :disabled="selectedFactories.length === 0"
        :text="$t('Download')"
        color="primary"
        @click="onDownload"
      />
    </template>
  </dialog-template>
</template>

<script setup name="FactorySelectDialog">
import { computed, ref } from 'vue';
import { mdiDownload } from '@mdi/js';

import DialogTemplate from '@/components/templates/DialogTemplate/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import EvoconVCheckbox from '@/components/atoms/EvoconVCheckbox/index.vue';
import useFactoryStore from '@/stores/factory';
import useGenericDialogStore from '@/stores/genericDialog';

const factoryStore = useFactoryStore();
const genericDialogStore = useGenericDialogStore();

const factories = computed(() => factoryStore.factories);
const selectedFactories = ref([]);

const closeDialog = () => {
  genericDialogStore.closeDialog();
};
const onToggleAllFactories = () => {
  if (selectedFactories.value.length === factories.value.length) {
    selectedFactories.value = [];
  } else {
    selectedFactories.value = factories.value.map((factory) => factory.id);
  }
};
const onDownload = () => {
  genericDialogStore.dialogData.action(selectedFactories.value);
};
</script>

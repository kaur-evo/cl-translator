<template>
  <form-dialog-template :primary-segment-title="`${$t('New')}: ${$t('API key')}`">
    <template #primary-segment>
      <v-form
        ref="form"
        v-model="valid"
        @submit="onDone"
      >
        <info-block
          :body="$t('Never share the secret key via unsecured channels. Never send it to Evocon support.')"
          :icon="mdiAlertCircleOutline"
          :color="colorConstants.light['lw-orange']"
          class="mx-1"
        />
        <v-row class="my-4">
          <v-col class="mx-1">
            <content-column
              :content-header="$t('API key')"
              :content-value="APIKey.keyId"
              :prepend-icon="mdiApi"
            />
          </v-col>
          <v-col class="mx-1">
            <content-column
              :content-header="$t('Secret key')"
              :content-value="APIKey.secret"
              :prepend-icon="mdiKey"
              :has-error="!isCheckboxChecked && hasError"
            />
          </v-col>
        </v-row>
        <evocon-v-checkbox
          v-model="isCheckboxChecked"
          class="mx-1"
          :label="$t('I understand this secret key will not be available again and I have copied it.')"
          :rules="[v => !!v]"
        />
      </v-form>
    </template>
    <template #actions>
      <v-spacer />
      <evocon-v-button
        color="primary"
        :text="$t('Done')"
        @click="onDone"
      />
    </template>
  </form-dialog-template>
</template>
<script setup name="APIKeyCompletionDialog">
import { ref } from 'vue';
import { mdiAlertCircleOutline, mdiApi, mdiKey } from '@mdi/js';

import useGenericDialogStore from '@/stores/genericDialog';
import useAPIKeysStore from '@/stores/APIKeys';
import colorConstants from '@/constants/colorConstants';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import EvoconVCheckbox from '@/components/atoms/EvoconVCheckbox/index.vue';
import InfoBlock from '@/components/atoms/InfoBlock/index.vue';
import ContentColumn from '@/components/molecules/ContentColumn/index.vue';
import FormDialogTemplate from '@/components/templates/FormDialogTemplate/index.vue';

const genericDialogStore = useGenericDialogStore();
const apiKeysStore = useAPIKeysStore();

const { APIKey } = genericDialogStore.dialogData;
const { APIKeys } = apiKeysStore;

const isCheckboxChecked = ref(false);
const form = ref(null);
const valid = ref(true);
const hasError = ref(false);

async function onDone() {
  await form.value.validate();
  if (!valid.value) {
    hasError.value = true;
    return;
  }
  const index = APIKeys.findIndex((el) => el.keyId === APIKey.keyId);
  APIKeys[index].secret = null;
  genericDialogStore.closeDialog();
}
</script>

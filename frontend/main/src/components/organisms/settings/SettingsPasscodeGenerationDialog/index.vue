<template>
  <form-dialog-template :primary-segment-title="$t('Passcode')">
    <template #primary-segment>
      <v-form
        ref="form"
        v-model="valid"
        @submit="onDone"
      >
        <info-block
          :body="$t('Make sure to share the passcode only with this operator.')"
          :icon="mdiAlertCircleOutline"
          :color="colorConstants.light['lw-orange']"
          class="mx-1"
        />
        <div class="d-flex align-center justify-center my-4">
          <span class="passcode pr-2">{{ passcode }}</span>
          <copy-to-clipboard-button
            :content="passcode"
            is-text
          />
        </div>
        <evocon-v-checkbox
          v-model="isCheckboxChecked"
          class="mx-1 my-2"
          :label="$t('I understand this passcode will not be available again, and I have copied it.')"
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
<script setup name="SettingsPasscodeGenerationDialog">
import { ref } from 'vue';
import { mdiAlertCircleOutline } from '@mdi/js';

import useGenericDialogStore from '@/stores/genericDialog';
import colorConstants from '@/constants/colorConstants';
import copyToClipboardButton from '@/components/atoms/CopyToClipboardButton/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import EvoconVCheckbox from '@/components/atoms/EvoconVCheckbox/index.vue';
import InfoBlock from '@/components/atoms/InfoBlock/index.vue';
import FormDialogTemplate from '@/components/templates/FormDialogTemplate/index.vue';

const genericDialogStore = useGenericDialogStore();

const { passcode } = genericDialogStore.dialogData;

const isCheckboxChecked = ref(false);
const form = ref(null);
const valid = ref(true);

async function onDone() {
  await form.value.validate();
  if (!valid.value) return;
  genericDialogStore.closeDialog();
}
</script>
<style lang="scss" scoped>
.passcode {
  font-size: 48px;
  font-weight: 600;
  line-height: 166%;
}
</style>

<template>
  <dialog-toolbar :title="'Contact support'" />
  <v-card-text class="py-0 px-4">
    <template v-if="state === 'initial'">
      <div>
        Evocon offers a comprehensive library of
        <a
          class="text-primary text-decoration-none font-weight-medium"
          href="https://support.evocon.com/Help-Support-1fce89bd3f624aba977dbbda5ef0224a"
          target="_blank"
          rel="noopener noreferrer"
        >
          support articles
        </a>
        to help you answer questions about the system and find solutions to problems.
        If you can't find the answer you need, please contact our support team by filling out this form.
      </div>
      <v-form
        ref="form"
        v-model="valid"
      >
        <evocon-v-input
          v-model.trim="email"
          hint="Email"
          placeholder="Email"
          :rules="[(v) => isValidEmail(v), (v) => !!v || 'Email']"
          class="my-2"
          required
          validate-on-blur
        />
        <evocon-v-input
          v-model.trim="subject"
          hint="Subject"
          placeholder="Subject"
          :rules="[(v) => !!v || 'Subject']"
          class="my-2"
          required
          validate-on-blur
        />
        <evocon-v-textarea
          v-model.trim="message"
          hint="Message"
          placeholder="Message"
          :rules="[(v) => !!v || 'Message']"
          class="my-2"
          required
          validate-on-blur
        />
      </v-form>
    </template>
    <div v-else-if="state === 'success'">
      Thank you. We will get back to you within 24 hours on weekdays.
    </div>
    <div v-else-if="state === 'failure'">
      An error has occurred. Please email Evocon support directly at support@evocon.com.
      <content-column
        :prepend-icon="mdiInformationOutline"
        content-header="Message"
        :content-value="message"
        class="my-2"
      >
        <template #content>
          <div v-for="(line, i) in message.split('\n')" :key="i" class="text-body-medium error-line">
            {{ line }}
          </div>
        </template>
      </content-column>
    </div>
  </v-card-text>
  <v-card-actions>
    <v-spacer />
    <evocon-v-button
      text="Close"
      type="secondary"
      @click="closeDialog"
    />
    <evocon-v-button
      v-if="state === 'initial'"
      text="Send"
      :loading="loading"
      color="primary"
      @click="onSendSupportRequest"
    />
  </v-card-actions>
</template>

<script setup name="SupportFormDialog">
import { mdiInformationOutline } from '@mdi/js';
import { onMounted, ref, computed } from 'vue';

import DialogToolbar from '@/components/atoms/DialogToolbar/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import EvoconVTextarea from '@/components/atoms/EvoconVTextarea/index.vue';
import ContentColumn from '@/components/molecules/ContentColumn/index.vue';
import { isValidEmail } from '@/helpers/validationRules';
import hubspotApi from '@/api/hubspotApi';
import { useProfileStore, useGenericDialogStore, useGenericNotificationStore } from '@/stores/index';

const profileStore = useProfileStore();
const genericDialogStore = useGenericDialogStore();
const genericNotificationStore = useGenericNotificationStore();

const email = ref('');
const subject = ref('');
const message = ref('');
const valid = ref(true);
const form = ref(null);
const loading = ref(false);
const state = ref('initial');

const currentUser = computed(() => profileStore.currentUser);
const closeDialog = () => genericDialogStore.closeDialog();

onMounted(() => {
  email.value = currentUser.value.email;
});

const onSendSupportRequest = async () => {
  await form.value.validate();
  if (!valid.value) return;
  loading.value = true;
  const body = {
    formId: 'aae4777c-ab2a-4d68-82f8-1c2bcba55b93',
    email: currentUser.value.email,
    firstname: currentUser.value.fullName,
    'TICKET.content': message.value,
    'TICKET.subject': subject.value,
  };
  try {
    await hubspotApi.forwardToSupport(body);
    state.value = 'success';
    genericNotificationStore.notifySuccess('Message sent');
  } catch {
    state.value = 'failure';
    genericNotificationStore.openNotification({
      type: 'error',
      text: 'An error has occurred',
      secondaryText: 'Please email Evocon support directly at support@evocon.com',
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.error-line {
  min-height: 20px;
}
</style>
